import React from 'react';
import { SUPPLY_TYPES } from '../../types/invoice.types';

/**
 * Toggle between Intra-State (CGST+SGST) and Inter-State (IGST).
 */
const SupplyTypeSelector = ({ value, onChange }) => {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-white/60 uppercase tracking-wider">
        Supply Type
      </label>
      <div className="flex gap-3">
        {SUPPLY_TYPES.map((type) => {
          const selected = value === type.value;
          return (
            <button
              key={type.value}
              type="button"
              onClick={() => onChange(type.value)}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium border transition-all duration-200 ${
                selected
                  ? 'bg-white text-black border-white'
                  : 'bg-white/[0.03] text-white/60 border-white/10 hover:bg-white/[0.06] hover:text-white/80'
              }`}
            >
              {type.label}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-white/30">
        {value === 'intra_state'
          ? 'CGST + SGST will be applied (each = GST rate ÷ 2)'
          : 'IGST will be applied (= full GST rate)'}
      </p>
    </div>
  );
};

export default SupplyTypeSelector;
