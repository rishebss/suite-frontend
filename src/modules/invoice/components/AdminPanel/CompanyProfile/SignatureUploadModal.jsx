import React from 'react';
import ImageUploadField from './ImageUploadField';
import RingLoader from '@/components/ui/RingLoader';
import { useCompanyProfile } from '../../../hooks/useCompanyProfile';

const SignatureUploadModal = ({ onClose }) => {
  const { profile, loading, uploadAsset, removeAsset } = useCompanyProfile();

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div>
            <h3 className="text-base font-semibold text-white">Company Signature</h3>
            <p className="text-xs text-white/40 mt-0.5">
              Embedded in all approved invoice PDFs
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/[0.08] transition-all text-lg"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {loading ? (
            <RingLoader className="py-8" />
          ) : !profile ? (
            <div className="text-center py-6 space-y-2">
              <p className="text-sm text-white/40">No company profile configured.</p>
              <p className="text-xs text-white/25">
                Set up Company Info in Admin → Company Profile first.
              </p>
            </div>
          ) : (
            <ImageUploadField
              label="Digital Signature"
              hint="Recommended: 150×60 px, transparent PNG · Max 500 KB"
              currentUrl={profile?.signature_url}
              onUpload={(file) => uploadAsset('signature', file)}
              onRemove={() => removeAsset('signature')}
              showWarning={false}
            />
          )}

          <div className="flex gap-2 pt-1">
            <button
              onClick={onClose}
              className="flex-1 text-sm py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white/70 hover:bg-white/[0.10] transition-all"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignatureUploadModal;
