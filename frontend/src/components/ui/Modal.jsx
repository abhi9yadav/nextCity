import React from "react";

const Modal = ({ children, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[2000]">
      <div className="relative">
        {children}

        {/* Click outside to close */}
        <div
          className="fixed inset-0 -z-10"
          onClick={onClose}
        />
      </div>
    </div>
  );
};

export default Modal;