import React from 'react';
import ImageUploadField from './ImageUploadField';

const AssetCard = ({ title, description, children, uploaded }) => (
  <div className={`rounded-xl border p-5 space-y-4 transition-colors ${
    uploaded ? 'border-white/10 bg-white/[0.03]' : 'border-dashed border-white/10 bg-white/[0.015]'
  }`}>
    <div className="flex items-start justify-between">
      <div>
        <h4 className="text-sm font-medium text-white">{title}</h4>
        <p className="text-xs text-white/35 mt-0.5">{description}</p>
      </div>
      {uploaded && (
        <span className="text-xs text-green-400/80 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full">
          Set
        </span>
      )}
    </div>
    {children}
  </div>
);

const BrandingUpload = ({ profile, uploadAsset, removeAsset }) => {
  return (
    <div className="space-y-4">
      <p className="text-xs text-white/30 pb-1">
        Branding assets are embedded in approved invoice PDFs at generation time.
        Updating them will not affect already-generated PDFs.
      </p>

      <AssetCard
        title="Company Logo"
        description="Shown in the top-left header of every invoice"
        uploaded={!!profile?.logo_url}
      >
        <ImageUploadField
          label="Logo"
          hint="Recommended: 300×100 px, transparent PNG · Max 500 KB"
          currentUrl={profile?.logo_url}
          onUpload={(file) => uploadAsset('logo', file)}
          onRemove={() => removeAsset('logo')}
          showWarning={false}
        />
      </AssetCard>

      <AssetCard
        title="Digital Signature"
        description="Printed in the authorised signatory block"
        uploaded={!!profile?.signature_url}
      >
        <ImageUploadField
          label="Signature"
          hint="Recommended: 150×60 px, transparent PNG · Max 500 KB"
          currentUrl={profile?.signature_url}
          onUpload={(file) => uploadAsset('signature', file)}
          onRemove={() => removeAsset('signature')}
          showWarning={true}
        />
      </AssetCard>

      <AssetCard
        title="Company Seal"
        description="Circular stamp shown next to the signature"
        uploaded={!!profile?.seal_url}
      >
        <ImageUploadField
          label="Seal"
          hint="Recommended: 100×100 px, transparent PNG · Max 500 KB"
          currentUrl={profile?.seal_url}
          onUpload={(file) => uploadAsset('seal', file)}
          onRemove={() => removeAsset('seal')}
          showWarning={true}
        />
      </AssetCard>

      <div className="pt-1 text-xs text-white/20">
        Accepted formats: PNG, JPG · Max file size: 500 KB per asset
      </div>
    </div>
  );
};

export default BrandingUpload;
