import React, { useState, useContext } from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { AuthContext } from '../context/AuthContext';

interface ReportModalProps {
  contentId: string;
  contentType: 'video' | 'comment';
  onClose: () => void;
}

const ReportModal: React.FC<ReportModalProps> = ({ contentId, contentType, onClose }) => {
  const { currentUser } = useContext(AuthContext);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const reportReasons = [
    'Spam or misleading',
    'Hate speech or graphic violence',
    'Harassment or bullying',
    'Copyright violation',
    'Nudity or sexual content'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason || !currentUser) {
      setError('Please select a reason.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const response = await fetch(`/api/v1/${contentType}s/${contentId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reporterId: currentUser.id, reason }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit report.');
      }
      setSuccess(true);
      setTimeout(onClose, 2000); // Close modal after 2 seconds on success

    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[101] p-4">
      <div className="bg-dark-surface rounded-lg w-full max-w-md shadow-xl text-dark-text-primary">
        <div className="flex items-center justify-between p-4 border-b border-dark-element">
          <h2 className="text-xl font-semibold">Report Content</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-dark-element">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        
        {success ? (
            <div className="p-6 text-center">
                <h3 className="text-lg font-semibold text-green-400">Thank you for your report</h3>
                <p className="mt-2 text-sm text-dark-text-secondary">Your feedback helps us keep the community safe.</p>
            </div>
        ) : (
             <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <p className="text-sm">Why are you reporting this {contentType}?</p>
                <div className="space-y-2">
                    {reportReasons.map(r => (
                        <label key={r} className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-dark-element">
                            <input
                                type="radio"
                                name="reason"
                                value={r}
                                checked={reason === r}
                                onChange={() => setReason(r)}
                                className="w-4 h-4 bg-dark-element border-dark-element text-brand-red focus:ring-brand-red"
                            />
                            <span>{r}</span>
                        </label>
                    ))}
                </div>
                 {error && <p className="text-sm text-red-400">{error}</p>}
                <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={onClose} className="px-4 py-1.5 text-sm rounded-full hover:bg-dark-element">Cancel</button>
                    <button type="submit" disabled={submitting || !reason} className="px-4 py-1.5 text-sm rounded-full bg-brand-red hover:bg-brand-red-dark disabled:opacity-50">
                        {submitting ? 'Submitting...' : 'Submit'}
                    </button>
                </div>
            </form>
        )}
      </div>
    </div>
  );
};

export default ReportModal;