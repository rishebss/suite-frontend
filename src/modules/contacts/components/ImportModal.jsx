import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { X, Check, Database, Loader2, AlertCircle } from 'lucide-react';
import Button from '@/components/Button';
import { cn } from '@/lib/utils';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';

// Isolated Step Components
import UploadStep from './import/UploadStep';
import ColumnSelectStep from './import/ColumnSelectStep';
import MappingStep from './import/MappingStep';
import PreviewStep from './import/PreviewStep';
import RingLoader from '@/components/ui/RingLoader';

const STEPS = {
    UPLOAD: 'UPLOAD',
    SELECT_COLS: 'SELECT_COLS',
    MAP: 'MAP',
    PREVIEW: 'PREVIEW'
};

const SYSTEM_FIELDS = [
    { key: 'name', label: 'Contact Name', required: true },
    { key: 'email', label: 'Email Address', required: false },
    { key: 'phone', label: 'Phone Number', required: false },
];

const BACKEND_STATUSES = ['Lead', 'Prospect', 'Customer', 'Inactive', 'Retarget', 'Imports'];

const ImportModal = ({ isOpen, onClose, onSuccess }) => {
    const [step, setStep] = useState(STEPS.UPLOAD);
    const [file, setFile] = useState(null);
    const [importName, setImportName] = useState('');
    const [allHeaders, setAllHeaders] = useState([]);
    const [selectedHeaders, setSelectedHeaders] = useState([]);
    const [mapping, setMapping] = useState({});
    const [importStatus, setImportStatus] = useState('Imports');
    const [previewData, setPreviewData] = useState([]);
    const [isImporting, setIsImporting] = useState(false);
    const [importProgress, setImportProgress] = useState(0);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (!isOpen) {
            setStep(STEPS.UPLOAD);
            setFile(null);
            setImportName('');
            setAllHeaders([]);
            setSelectedHeaders([]);
            setMapping({});
            setImportStatus('Imports');
            setPreviewData([]);
            setError(null);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const currentStepIndex = Object.keys(STEPS).indexOf(step);

    const handleFileChange = async (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;
        setFile(selectedFile);
        try {
            const headers = await parseHeaders(selectedFile);
            setAllHeaders(headers);
            setSelectedHeaders(headers);
            setStep(STEPS.SELECT_COLS);
        } catch (err) { setError('Failed to read file.'); }
    };

    const parseHeaders = (file) => {
        return new Promise((resolve, reject) => {
            const ext = file.name.split('.').pop().toLowerCase();
            if (ext === 'csv') {
                Papa.parse(file, { header: true, preview: 1, complete: (results) => resolve(Object.keys(results.data[0] || {})), error: (err) => reject(err) });
            } else {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const workbook = XLSX.read(new Uint8Array(e.target.result), { type: 'array' });
                    const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: 1 });
                    resolve(jsonData[0] || []);
                };
                reader.readAsArrayBuffer(file);
            }
        });
    };

    const toggleHeader = (header) => {
        setSelectedHeaders(prev => prev.includes(header) ? prev.filter(h => h !== header) : [...prev, header]);
    };

    const generatePreview = async () => {
        if (!mapping.name) { setError('Name is required.'); return; }
        setError(null);
        try {
            const fullData = await parseFileFull(file, 5);
            const transformed = fullData.map(row => {
                const previewRow = {
                    _status: mapping.status ? row[mapping.status] : importStatus,
                    _raw: {}
                };
                selectedHeaders.forEach(h => {
                    previewRow._raw[h] = row[h];
                });
                return previewRow;
            });
            setPreviewData(transformed);
            setStep(STEPS.PREVIEW);
        } catch (err) { setError('Preview failed.'); }
    };

    const goToMapping = () => {
        if (selectedHeaders.length === 0) { setError('Select at least one column.'); return; }
        setError(null);
        const initialMapping = {};
        SYSTEM_FIELDS.forEach(sf => {
            const match = selectedHeaders.find(h => h.toLowerCase() === sf.key.toLowerCase() || h.toLowerCase().includes(sf.key.toLowerCase()));
            if (match) initialMapping[sf.key] = match;
        });
        setMapping(initialMapping);
        setStep(STEPS.MAP);
    };

    const handleFinalImport = async () => {
        setError(null);
        setIsImporting(true);
        setImportProgress(0);
        try {
            const fullData = await parseFileFull(file);
            console.log('[Import] Full raw data from file (first 2 rows):', JSON.stringify(fullData.slice(0, 2)));
            console.log('[Import] Raw keys in first row:', Object.keys(fullData[0] || {}));
            console.log('[Import] selectedHeaders:', selectedHeaders);
            console.log('[Import] mapping:', mapping);
            const normalizedHeaders = normalizeHeaders(selectedHeaders);
            const transformedData = fullData.map(row => {
                const normRow = buildRowLookup(row);
                const contact = { status: mapping.status ? normRow[mapping.status] : importStatus };
                const additional = {};
                normalizedHeaders.forEach(h => {
                    const sysTarget = Object.keys(mapping).find(key => mapping[key] && mapping[key].trim() === h);
                    if (sysTarget && sysTarget !== 'status') { contact[sysTarget] = normRow[h]; }
                    else if (!sysTarget || sysTarget === 'status') { additional[h] = normRow[h]; }
                });
                return { ...contact, additional_data: additional };
            }).filter(c => c.name);
            console.log('[Import] First transformed row:', JSON.stringify(transformedData[0]));
            console.log('[Import] Rows with non-empty additional_data:', transformedData.filter(r => Object.keys(r.additional_data || {}).length > 0).length);

            const CHUNK_SIZE = 1500;
            const total = transformedData.length;
            let currentBatchId = null;

            for (let i = 0; i < total; i += CHUNK_SIZE) {
                const chunk = transformedData.slice(i, i + CHUNK_SIZE);
                
                let url = `/api/contacts/bulk-create/?batch_name=${encodeURIComponent(importName || 'Unnamed Import')}`;
                if (currentBatchId) {
                    url += `&batch_id=${currentBatchId}`;
                }

                const response = await axios.post(url, chunk);
                
                if (response.data.success) {
                    currentBatchId = response.data.batch_id;
                    const progress = Math.min(Math.round(((i + chunk.length) / total) * 100), 100);
                    setImportProgress(progress);
                } else {
                    throw new Error(response.data.message || 'Import failed at a chunk.');
                }
            }

            onSuccess();
        } catch (err) { 
            console.error('Import error:', err);
            setError(err.response?.data?.message || err.message || 'Import failed.'); 
        } finally { 
            setIsImporting(false); 
        }
    };

    const parseFileFull = (file, limit = null) => {
        return new Promise((resolve, reject) => {
            const ext = file.name.split('.').pop().toLowerCase();
            if (ext === 'csv') {
                Papa.parse(file, { header: true, skipEmptyLines: true, preview: limit, complete: (results) => resolve(results.data), error: (err) => reject(err) });
            } else {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const workbook = XLSX.read(new Uint8Array(e.target.result), { type: 'array' });
                    let data = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
                    if (limit) data = data.slice(0, limit);
                    resolve(data);
                };
                reader.readAsArrayBuffer(file);
            }
        });
    };

    // Normalize header name: trim whitespace so selectedHeaders keys match row keys
    const normalizeHeaders = (headers) => headers.map(h => h.trim());
    const buildRowLookup = (row) => {
        const normalized = {};
        Object.keys(row).forEach(key => {
            normalized[key.trim()] = row[key];
        });
        return normalized;
    };

    const stepItems = [
        { label: 'Upload' },
        { label: 'Select' },
        { label: 'Match' },
        { label: 'Preview' }
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-3xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,1)] flex flex-col h-[580px] overflow-hidden outline-none ring-0 animate-in zoom-in-95 duration-200">

                {/* Stepper Header */}
                <div className="px-10 py-6 bg-zinc-950 border-b border-zinc-800 shrink-0 outline-none">
                    <div className="flex items-center justify-between relative max-w-[480px] mx-auto select-none">
                        <div className="absolute top-[18px] left-[18px] right-[18px] h-[1px] bg-zinc-800 -z-0" />
                        <div
                            className="absolute top-[18px] left-[18px] h-[1.5px] bg-blue-500 transition-all duration-300 -z-0"
                            style={{
                                width: `calc(${(currentStepIndex / 3) * 100}% - 0px)`,
                                maxWidth: 'calc(100% - 36px)',
                                display: currentStepIndex === 0 ? 'none' : 'block'
                            }}
                        />
                        {stepItems.map((item, idx) => (
                            <div key={idx} className="relative z-10 flex flex-col items-center gap-3">
                                <div className={cn(
                                    "w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-black transition-all duration-300 border",
                                    currentStepIndex > idx ? "bg-blue-500 border-blue-500 text-black" :
                                        currentStepIndex === idx ? "bg-zinc-950 border-blue-500 text-blue-400" :
                                            "bg-zinc-950 border-white/5 text-white/10"
                                )}>
                                    {currentStepIndex > idx ? <Check size={16} strokeWidth={4} /> : idx + 1}
                                </div>
                                <span className={cn("text-[8px] font-black uppercase tracking-[0.2em] transition-colors", currentStepIndex >= idx ? "text-white/60" : "text-white/10")}>
                                    {item.label}
                                </span>
                            </div>
                        ))}
                    </div>
                    <button onClick={onClose} className="absolute top-8 right-8 p-2 rounded-lg hover:bg-white/5 text-white/20 transition-colors focus:outline-none outline-none ring-0">
                        <X size={20} />
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-zinc-950 outline-none ring-0 focus:outline-none">
                    {step === STEPS.UPLOAD && <UploadStep fileInputRef={fileInputRef} onFileChange={handleFileChange} importName={importName} onImportNameChange={setImportName} />}
                    {step === STEPS.SELECT_COLS && <ColumnSelectStep allHeaders={allHeaders} selectedHeaders={selectedHeaders} onToggleHeader={toggleHeader} />}
                    {step === STEPS.MAP && (
                        <MappingStep
                            systemFields={SYSTEM_FIELDS}
                            selectedHeaders={selectedHeaders}
                            mapping={mapping}
                            onMappingChange={(key, val) => setMapping({ ...mapping, [key]: val === "IGNORE" ? "" : val })}
                        />
                    )}
                    {step === STEPS.MAP && (
                        <div className="mt-6 flex items-center gap-4 p-4 rounded-xl bg-blue-500/[0.03] border border-blue-500/10">
                            <div className="w-32 shrink-0">
                                <p className="text-xs font-bold text-blue-400">Set Batch Status</p>
                                <p className="text-[9px] text-blue-400/40 font-black uppercase tracking-widest leading-none mt-0.5">Applies to all</p>
                            </div>
                            <div className="flex-1">
                                <Select value={importStatus} onValueChange={setImportStatus}>
                                    <SelectTrigger className="w-full bg-blue-500/5 border-blue-500/20 rounded-md h-9 text-xs text-blue-100 focus:ring-0 focus:ring-offset-0 focus:border-blue-500/40 transition-all outline-none">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-900 border-white/10 text-white shadow-2xl">
                                        {BACKEND_STATUSES.map(s => (
                                            <SelectItem key={s} value={s} className="focus:bg-white/5 focus:text-white">{s}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}
                    {step === STEPS.PREVIEW && <PreviewStep previewData={previewData} selectedHeaders={selectedHeaders} mapping={mapping} isImporting={isImporting} importProgress={importProgress} />}


                    {error && (
                        <div className="mt-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-500 outline-none">
                            <AlertCircle size={18} />
                            <p className="text-[10px] font-bold uppercase tracking-widest">{error}</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-zinc-800 flex justify-end gap-3 shrink-0 bg-zinc-950 outline-none">
                    {step !== STEPS.UPLOAD && (
                        <button
                            type="button"
                            className="px-6 py-2 rounded-sm bg-zinc-900/50 border border-zinc-800 text-white/40 hover:text-white hover:bg-zinc-800 transition-all text-[10px] font-medium uppercase tracking-[0.2em]"
                            onClick={() => {
                                if (step === STEPS.PREVIEW) setStep(STEPS.MAP);
                                else if (step === STEPS.MAP) setStep(STEPS.SELECT_COLS);
                                else if (step === STEPS.SELECT_COLS) setStep(STEPS.UPLOAD);
                            }}
                        >
                            Back
                        </button>
                    )}
                    {step !== STEPS.UPLOAD && (
                        <button
                            type="button"
                            className="px-6 py-2 rounded-sm bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 hover:border-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed text-[10px] font-medium uppercase tracking-[0.2em] transition-all flex items-center gap-2"
                            disabled={isImporting}
                            onClick={() => {
                                if (step === STEPS.SELECT_COLS) goToMapping();
                                else if (step === STEPS.MAP) generatePreview();
                                else if (step === STEPS.PREVIEW) handleFinalImport();
                            }}
                        >
                            {isImporting ? (
                                <span>Importing...</span>
                            ) : (
                                <span>{step === STEPS.PREVIEW ? 'Import Now' : 'Next'}</span>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ImportModal;
