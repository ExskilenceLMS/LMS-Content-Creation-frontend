import React from 'react';

function ApprovalModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="modal fade show" tabIndex="-1" style={{ display: 'block' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header bg-gray-500">
            <h5 className="modal-title text-lg fw-bold text-gray-900">Save File</h5>
            <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <p className="text-sm text-gray-500">Do you want to submit the changes ?</p>
          </div>
          <div className="modal-footer bg-light">
            {/* Yes button */}
            <button type="button" className="btn btn-success" onClick={onConfirm}>
              Yes
            </button>
            {/* No button */}
            <button type="button" className="btn btn-danger" onClick={onClose}>
              No
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ApprovalModal;
