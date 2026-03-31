'use client';
import { AlertTriangle, X } from 'lucide-react';
import Button from './Button';

export default function ConfirmDelete({
  isOpen, onClose, onConfirm,
  itemName = 'this item', isLoading = false
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
        <button onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-lg">
          <X className="w-4 h-4 text-gray-500" />
        </button>
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="p-3 bg-red-100 rounded-full">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">
              Confirm Delete
            </h3>
            <p className="text-sm text-gray-500">
              Are you sure you want to delete{' '}
              <span className="font-medium text-gray-700">
                {itemName}
              </span>?
              This action cannot be undone.
            </p>
          </div>
          <div className="flex gap-3 w-full">
            <Button variant="outline" className="flex-1"
              onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button variant="danger" className="flex-1"
              onClick={onConfirm} isLoading={isLoading}>
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}