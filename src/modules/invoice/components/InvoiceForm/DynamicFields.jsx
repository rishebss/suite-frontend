import React from 'react';
import Input from '@/components/Input';

/**
 * Renders domain-specific extra fields defined in InvoiceSchema.extra_fields.
 * Each field definition: { name, label, type, required }
 *
 * @param {Array}    extraFields  - schema.extra_fields array
 * @param {Object}   values       - current extra_data object
 * @param {Function} onChange     - (name, value) => void
 */
const DynamicFields = ({ extraFields = [], values = {}, onChange }) => {
  if (!extraFields || extraFields.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">
        Domain Details
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {extraFields.map((field) => (
          <Input
            key={field.name}
            label={field.label + (field.required ? ' *' : '')}
            type={field.type || 'text'}
            placeholder={field.label}
            value={values[field.name] || ''}
            onChange={(e) => onChange(field.name, e.target.value)}
            required={field.required}
          />
        ))}
      </div>
    </div>
  );
};

export default DynamicFields;
