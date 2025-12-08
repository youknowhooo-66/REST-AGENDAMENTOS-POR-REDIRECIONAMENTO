import React from 'react';

const Modal = ({ isOpen, onClose, children, maxWidth = 'md' }) => {
  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal Content */}
      <div
        className={`
          relative bg-white dark:bg-slate-800 
          rounded-2xl shadow-2xl 
          w-full ${maxWidthClasses[maxWidth]} 
          p-6 sm:p-8
          border border-slate-200 dark:border-slate-700
          animate-scale-in
          max-h-[90vh] overflow-y-auto
          custom-scrollbar
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="
            absolute top-4 right-4 
            w-8 h-8 
            flex items-center justify-center
            text-slate-400 hover:text-slate-600 
            dark:text-slate-500 dark:hover:text-slate-300
            hover:bg-slate-100 dark:hover:bg-slate-700
            rounded-lg
            smooth-transition
            focus:outline-none focus:ring-2 focus:ring-primary/20
          "
          aria-label="Fechar modal"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Modal Content */}
        <div className="mt-2">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;