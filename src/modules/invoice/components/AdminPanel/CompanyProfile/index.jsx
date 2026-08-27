import React, { useState } from 'react';
import Input from '@/components/Input';
import RingLoader from '@/components/ui/RingLoader';
import BrandingUpload from './BrandingUpload';
import { useCompanyProfile } from '../../../hooks/useCompanyProfile';
import { Save, Building2, Banknote, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';

const TABS = [
  { label: 'Company Info', key: 'info', icon: Building2 },
  { label: 'Bank Details', key: 'bank', icon: Banknote },
  { label: 'Branding', key: 'branding', icon: Palette },
];

const CompanyProfileAdmin = () => {
  const [activeTab, setActiveTab] = useState(0);
  const { profile, loading, error, updateProfile, uploadAsset, removeAsset } = useCompanyProfile();

  const EMPTY_FORM = {
    company_name: '', company_address: '', gstin: '', pan_number: '',
    phone: '', email: '', website: '', state: '', state_code: '',
    bank_name: '', bank_account: '', bank_ifsc: '', bank_branch: '',
  };

  const [form, setForm] = useState(EMPTY_FORM);
  const [saveStatus, setSaveStatus] = useState('');

  React.useEffect(() => {
    if (profile) setForm({ ...EMPTY_FORM, ...profile });
  }, [profile]);

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSave = async () => {
    setSaveStatus('');
    const result = await updateProfile(form);
    if (result.success) {
      setSaveStatus('Saved successfully.');
    } else {
      const errDetail = result.errors
        ? Object.entries(result.errors).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join(' | ')
        : result.message;
      setSaveStatus(errDetail);
    }
  };

  const brandingMissing = profile && !(profile.signature_url);

  if (loading) {
    return <RingLoader className="py-20" />;
  }

  return (
    <div className="flex flex-col bg-black h-full">
      <header className="px-10 py-8 flex justify-between items-center border-b border-white/5 relative z-20 bg-black/50 backdrop-blur-xl shrink-0">
        <div className="space-y-0.5">
          <h1 className="text-2xl font-semibold text-white">Company Profile</h1>
          <p className="text-sm text-white/40">Branding assets here are embedded in all approved invoice PDFs.</p>
        </div>
        {activeTab !== 2 && (
          <button
            onClick={handleSave}
            className="!w-auto h-9 px-4 bg-white text-black rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-gray-100 transition-all flex items-center gap-2"
          >
            <Save size={14} />
            Save Changes
          </button>
        )}
      </header>

      <main className="flex-1 px-10 pt-5 pb-10 relative z-10 overflow-hidden flex flex-col gap-4 min-h-0">
        {error && (
          <div className="p-4 bg-red-900/20 border border-red-500/20 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="flex items-center border-b border-white/5 shrink-0">
          <div className="flex items-center gap-1">
            {TABS.map((tab, idx) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(idx)}
                className={cn(
                  "px-4 py-2.5 text-sm capitalize transition-all border-b-2 -mb-px flex items-center gap-2",
                  activeTab === idx
                    ? "text-white border-blue-500 font-medium"
                    : "text-white/30 border-transparent hover:text-white/60"
                )}
              >
                <tab.icon size={14} />
                {tab.label}
                {tab.key === 'branding' && brandingMissing && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          {/* Company Info */}
          {activeTab === 0 && (
            <div className="space-y-4 w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Input
                    label="Company Name *"
                    type="text"
                    value={form?.company_name || ''}
                    onChange={(e) => set('company_name', e.target.value)}
                    placeholder="Bytehive Digitals Pvt Ltd"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-medium text-white/40 block mb-1.5">
                    Company Address *
                  </label>
                  <textarea
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-white/20 outline-none focus:border-white/20 transition-all resize-none"
                    rows={3}
                    placeholder="Street, City, State, PIN"
                    value={form?.company_address || ''}
                    onChange={(e) => set('company_address', e.target.value)}
                  />
                </div>
                <Input label="GSTIN *" type="text" value={form?.gstin || ''} onChange={(e) => set('gstin', e.target.value.toUpperCase())} placeholder="22AAAAA0000A1Z5" />
                <Input label="PAN Number" type="text" value={form?.pan_number || ''} onChange={(e) => set('pan_number', e.target.value.toUpperCase())} placeholder="AAAAA0000A" />
                <Input label="Phone" type="tel" value={form?.phone || ''} onChange={(e) => set('phone', e.target.value)} placeholder="+91 98765 43210" />
                <Input label="Email" type="email" value={form?.email || ''} onChange={(e) => set('email', e.target.value)} placeholder="billing@company.com" />
                <Input label="Website" type="url" value={form?.website || ''} onChange={(e) => set('website', e.target.value)} placeholder="https://company.com" />
                <Input label="State" type="text" value={form?.state || ''} onChange={(e) => set('state', e.target.value)} placeholder="Kerala" />
                <Input label="State Code" type="text" value={form?.state_code || ''} onChange={(e) => set('state_code', e.target.value)} placeholder="32" />
              </div>
            </div>
          )}

          {/* Bank Details */}
          {activeTab === 1 && (
            <div className="space-y-4 w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Bank Name" type="text" value={form?.bank_name || ''} onChange={(e) => set('bank_name', e.target.value)} placeholder="HDFC Bank" />
                <Input label="Account Number" type="text" value={form?.bank_account || ''} onChange={(e) => set('bank_account', e.target.value)} placeholder="00000000000000" />
                <Input label="IFSC Code" type="text" value={form?.bank_ifsc || ''} onChange={(e) => set('bank_ifsc', e.target.value.toUpperCase())} placeholder="HDFC0001234" />
                <Input label="Branch" type="text" value={form?.bank_branch || ''} onChange={(e) => set('bank_branch', e.target.value)} placeholder="Ernakulam Main" />
              </div>
            </div>
          )}

          {/* Branding */}
          {activeTab === 2 && (
            <BrandingUpload
              profile={profile}
              uploadAsset={uploadAsset}
              removeAsset={removeAsset}
            />
          )}

          {/* Status Message */}
          {saveStatus && (
            <div className="mt-6 pt-4 border-t border-white/5">
              <p className={`text-xs font-medium ${saveStatus === 'Saved successfully.' ? 'text-green-400' : 'text-red-400'}`}>
                {saveStatus}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CompanyProfileAdmin;
