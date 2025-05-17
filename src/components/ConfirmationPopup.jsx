import React from 'react';

const ConfirmationPopup = ({ 
  title, 
  message, 
  confirmText, 
  cancelText, 
  onConfirm, 
  onCancel 
}) => {
  return (
    <div className="confirmation-overlay">
      <div className="confirmation-container">
        <h2 className="confirmation-title">{title}</h2>
        <p className="confirmation-message">{message}</p>
        <div className="confirmation-buttons">
          <button 
            className="confirmation-button confirm" 
            onClick={onConfirm}
          >
            {confirmText}
          </button>
          <button 
            className="confirmation-button cancel" 
            onClick={onCancel}
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPopup;
