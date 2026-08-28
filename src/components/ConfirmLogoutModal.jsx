import React from 'react';
import { createPortal } from 'react-dom';
import { LogOut } from 'lucide-react';

const ConfirmLogoutModal = ({ onConfirm, onCancel }) => {
  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl p-6 flex flex-col gap-5">

        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0">
            <LogOut size={18} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Sign out</h3>
            <p className="text-xs text-white/40 mt-1 leading-relaxed">Are you sure you want to log out of your account?</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-xs text-white/40 hover:text-white hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg text-xs bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
          >
            Log out
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};

export default ConfirmLogoutModal;
