import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { X, Link, Plus, Trash2, Check } from 'lucide-react';
import { Song } from '../types';
import { formatDate } from '../utils';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';

interface SongDetailsModalProps {
  song: Song;
  onClose: () => void;
  onAddLink?: (url: string, description: string) => void;
  onRemoveLink?: (index: number) => void;
}

const SongDetailsModal: React.FC<SongDetailsModalProps> = ({ song, onClose, onAddLink, onRemoveLink }) => {
  const { t } = useLanguage();
  const [newUrl, setNewUrl] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deletingLinkIndex, setDeletingLinkIndex] = useState<number | null>(null);

  useEffect(() => {
    setShowConfirm(newUrl.trim() !== '' && newDescription.trim() !== '');
  }, [newUrl, newDescription]);

  const handleConfirm = async () => {
    if (!onAddLink) return;
    
    setError(null);
    if (!newUrl.trim() || !newDescription.trim()) {
      setError('Bitte fülle alle Felder aus.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onAddLink(newUrl.trim(), newDescription.trim());
      setNewUrl('');
      setNewDescription('');
      setShowConfirm(false);
    } catch (error) {
      console.error('Failed to add link:', error);
      setError('Fehler beim Hinzufügen des Links.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setNewUrl('');
    setNewDescription('');
    setShowConfirm(false);
  };

  const handleRemoveLink = (index: number) => {
    setDeletingLinkIndex(index);
  };

  const handleConfirmLinkDelete = () => {
    if (onRemoveLink && deletingLinkIndex !== null) {
      onRemoveLink(deletingLinkIndex);
      setDeletingLinkIndex(null);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/80 backdrop-blur-sm"
        onClick={handleBackdropClick}
      >
        <div 
          className="relative w-full max-w-lg p-6 mx-4 bg-neutral-800 rounded-lg shadow-xl border border-primary-500/20 animate-fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 text-neutral-400 hover:text-primary-300 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/50 rounded-full"
          >
            <X size={20} />
          </button>

          <h2 className="text-2xl font-bold text-primary-300 mb-2">{song.title}</h2>
          <p className="text-neutral-400 mb-6">by {song.artist}</p>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-neutral-100 mb-3 flex items-center gap-2">
                <Link size={18} className="text-primary-300" />
                {t('songs.links')}
              </h3>
              
              {song.links && song.links.length > 0 ? (
                <div className="space-y-2">
                  {song.links.map((link, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-grow flex items-center gap-2 p-3 bg-neutral-900 rounded-lg text-neutral-300 hover:text-primary-300 transition-colors border border-primary-500/20"
                      >
                        <Link size={16} />
                        {link.description}
                      </a>
                      {onRemoveLink && (
                        <button
                          onClick={() => handleRemoveLink(index)}
                          className="p-2 text-neutral-400 hover:text-secondary-500 transition-colors rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                          title="Link entfernen"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : null}

              {onAddLink && (
                <div className="mt-4 space-y-3">
                  <input
                    type="url"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    placeholder={t('songs.linkUrl')}
                    className="w-full px-3 py-2 bg-neutral-900 border border-primary-500/30 rounded-md text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                    required
                    disabled={isSubmitting}
                  />
                  <input
                    type="text"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder={t('songs.linkDesc')}
                    className="w-full px-3 py-2 bg-neutral-900 border border-primary-500/30 rounded-md text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                    required
                    disabled={isSubmitting}
                  />
                  {error && (
                    <p className="text-sm text-secondary-500">{error}</p>
                  )}
                  {showConfirm ? (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleConfirm}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary-500 text-neutral-900 rounded-md hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                        disabled={isSubmitting}
                      >
                        <Check size={16} />
                        Bestätigen
                      </button>
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="flex-1 px-4 py-2 bg-neutral-900 text-neutral-300 rounded-md hover:bg-neutral-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                        disabled={isSubmitting}
                      >
                        Abbrechen
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowConfirm(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-neutral-300 rounded-md hover:bg-neutral-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                      disabled={isSubmitting}
                    >
                      <Plus size={16} />
                      {t('songs.addLink')}
                    </button>
                  )}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold text-neutral-100 mb-2">{t('songs.details')}</h3>
              <div className="space-y-2 text-sm text-neutral-400">
                <p>{t('songs.addedOn')}: {formatDate(song.addedAt)}</p>
                <p>{t('songs.sessionDate')}: {formatDate(song.sessionDate)}</p>
                <p>{t('songs.votes')}: {song.votes}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DeleteConfirmationDialog
        isOpen={deletingLinkIndex !== null}
        onClose={() => setDeletingLinkIndex(null)}
        onConfirm={handleConfirmLinkDelete}
        title="Link löschen"
        message={`Möchtest du diesen Link wirklich löschen?`}
      />
    </>
  );
};

export default React.memo(SongDetailsModal);