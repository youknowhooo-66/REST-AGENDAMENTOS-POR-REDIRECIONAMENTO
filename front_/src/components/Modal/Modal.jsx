import React from 'react'

const Modal = ({isOpen, onClose, children}) => {
    if(!isOpen) return null
  return (
  <div className='fixed inset-0 z-50 flex items-center justify-center bg-background/70'>
    <div className='bg-card rounded-xl shadow-lg w-full max-w-md p-6 relative'>
        <button
        onClick={onClose}
        className='absolute top-3 right-3 text-text-muted hover:text-text font-bold text-lg cursor-pointer'
        >
        X
        </button>
        {/* conteudo do modal */}
        {children}
    </div>
  </div>
  )
}

export default Modal