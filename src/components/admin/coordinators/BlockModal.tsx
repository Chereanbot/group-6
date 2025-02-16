import { useState } from 'react';

interface BlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (action: 'block' | 'ban', reason: string) => void;
  coordinatorName: string;
  loading?: boolean;
}

export const BlockModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  coordinatorName,
  loading = false 
}: BlockModalProps) => {
  const [action, setAction] = useState<'block' | 'ban'>('block');
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <h3 className="text-lg font-bold mb-4">
          {action === 'block' ? 'Block' : 'Ban'} {coordinatorName}
        </h3>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Action</label>
          <select
            value={action}
            onChange={(e) => setAction(e.target.value as 'block' | 'ban')}
            className="w-full border rounded-lg p-2"
            disabled={loading}
          >
            <option value="block">Block (30 days)</option>
            <option value="ban">Ban (Permanent)</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Reason</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full border rounded-lg p-2"
            rows={3}
            placeholder="Enter reason..."
            required
            disabled={loading}
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (reason.trim()) {
                onConfirm(action, reason);
              }
            }}
            className={`px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700
              ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={loading || !reason.trim()}
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              `Confirm ${action === 'block' ? 'Block' : 'Ban'}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}; 