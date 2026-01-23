'use client';

import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDangerous = false,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-[#013644]/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      <div className="relative bg-[#002833] border border-white/10 w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-8 text-center">
          <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-6 ${isDangerous ? 'bg-red-500/10 text-red-500' : 'bg-[#98E32F]/10 text-[#98E32F]'}`}>
            <AlertTriangle size={32} />
          </div>
          
          <h3 className="text-2xl font-bold mb-2 text-white">{title}</h3>
          <p className="text-white/60 text-sm leading-relaxed mb-8">
            {message}
          </p>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3.5 rounded-xl font-bold text-white/40 hover:text-white hover:bg-white/5 transition-all"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 py-3.5 rounded-xl font-black text-[#013644] transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98] ${
                isDangerous 
                  ? 'bg-red-500 hover:bg-red-400 shadow-red-500/20' 
                  : 'bg-[#98E32F] hover:bg-[#86c929] shadow-[#98E32F]/20'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-white/20 hover:text-white hover:bg-white/5 rounded-full transition-all"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
}
