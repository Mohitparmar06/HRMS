import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function DeleteConfirmation({ isOpen, onClose, onConfirm, title, itemName, message }) {
  if (!isOpen) return null;

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal admin-modal-sm" onClick={e => e.stopPropagation()}>
        <div className="emp-delete-modal">
          <div className="emp-delete-icon">
            <AlertTriangle size={28} />
          </div>
          <h3>{title || 'Delete Item'}</h3>
          <p>{message || <>Are you sure you want to delete <strong>{itemName}</strong>? This action cannot be undone.</>}</p>
          <div className="emp-delete-actions">
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn emp-delete-confirm-btn" onClick={onConfirm}>Delete</button>
          </div>
        </div>
      </div>
    </div>
  );
}
