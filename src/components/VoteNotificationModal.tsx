import React from 'react';
import { AlertCircle, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface VoteNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const VoteNotificationModal: React.FC<VoteNotificationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md p-6 bg-neutral-800 rounded-lg shadow-xl border border-primary-500/20 m-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-200 transition-colors"
          aria-label={t('songs.cancel')}
        >
          <X size={20} />
        </button>

        <div className="flex items-start gap-4 mb-4">
          <div className="flex-shrink-0 p-2 bg-primary-500/20 rounded-full">
            <AlertCircle className="text-primary-300" size={24} />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-primary-300 mb-2">
              {t('vote.notificationTitle')}
            </h3>
            <p className="text-neutral-300 leading-relaxed">
              {t('vote.notificationMessage')}
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-primary-500 text-neutral-900 font-medium rounded-md hover:bg-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/50"
          >
            {t('vote.understand')}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-700 text-neutral-300 rounded-md hover:bg-neutral-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/50"
          >
            {t('songs.cancel')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoteNotificationModal;
