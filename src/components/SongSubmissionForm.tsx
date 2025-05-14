import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Music, Plus, Link as LinkIcon, X } from 'lucide-react';

interface SongSubmissionFormProps {
  onSubmit: (title: string, artist: string, submitter: string, links?: { url: string; description: string }[]) => void;
}

const SongSubmissionForm: React.FC<SongSubmissionFormProps> = ({ onSubmit }) => {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [submitter, setSubmitter] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [links, setLinks] = useState<{ url: string; description: string }[]>([]);
  const { t } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !artist.trim() || !submitter.trim()) {
      setError(t('songs.error'));
      return;
    }
    
    onSubmit(title.trim(), artist.trim(), submitter.trim(), links.length > 0 ? links : undefined);
    setTitle('');
    setArtist('');
    setSubmitter('');
    setLinks([]);
    setError(null);
    setIsExpanded(false);
  };

  const addLink = () => {
    setLinks([...links, { url: '', description: '' }]);
  };

  const updateLink = (index: number, field: 'url' | 'description', value: string) => {
    const newLinks = [...links];
    newLinks[index][field] = value;
    setLinks(newLinks);
  };

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setIsExpanded(false);
    }
  };

  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsExpanded(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  return (
    <div className="w-full max-w-md mx-auto mb-6 sm:mb-8 px-2 sm:px-0">
      {!isExpanded ? (
        <button
          onClick={() => setIsExpanded(true)}
          className="flex items-center justify-center w-full gap-2 px-4 py-3 font-semibold text-neutral-100 transition-all duration-300 bg-primary-500/20 rounded-md border border-primary-500/30 hover:bg-primary-500/30 hover:border-primary-500/50 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
        >
          <Plus size={20} className="text-primary-300" />
          <span className="text-primary-300">{t('songs.suggest')}</span>
        </button>
      ) : (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/80 backdrop-blur-sm p-4"
          onClick={handleBackdropClick}
        >
          <form
            onSubmit={handleSubmit}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-md p-6 space-y-4 bg-neutral-800 rounded-lg shadow-xl border border-primary-500/20 animate-fade-in relative overflow-y-auto max-h-[90vh]"
          >
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="absolute top-4 right-4 p-1 text-neutral-400 hover:text-primary-300 transition-colors rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500/50"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2 mb-4 text-lg sm:text-xl font-semibold text-primary-300 font-sans">
              <Music size={20} className="sm:w-6 sm:h-6" />
              <h2>{t('songs.suggest')}</h2>
            </div>
            
            <div>
              <label htmlFor="songTitle" className="block mb-1 text-sm font-medium text-neutral-400">
                {t('songs.title')}
              </label>
              <input
                id="songTitle"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('songs.enterTitle')}
                className="w-full px-3 py-2 bg-neutral-900 border border-primary-500/30 rounded-md text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                autoFocus
              />
            </div>
            
            <div>
              <label htmlFor="artist" className="block mb-1 text-sm font-medium text-neutral-400">
                {t('songs.artist')}
              </label>
              <input
                id="artist"
                type="text"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder={t('songs.enterArtist')}
                className="w-full px-3 py-2 bg-neutral-900 border border-primary-500/30 rounded-md text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
              />
            </div>

            <div>
              <label htmlFor="submitter" className="block mb-1 text-sm font-medium text-neutral-400">
                {t('songs.submitter')}
              </label>
              <input
                id="submitter"
                type="text"
                value={submitter}
                onChange={(e) => setSubmitter(e.target.value)}
                placeholder={t('songs.enterSubmitter')}
                className="w-full px-3 py-2 bg-neutral-900 border border-primary-500/30 rounded-md text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-neutral-400">
                  {t('songs.links')}
                </label>
                <button
                  type="button"
                  onClick={addLink}
                  className="flex items-center gap-1 px-2 py-1 text-sm text-neutral-400 hover:text-primary-300 transition-colors rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                >
                  <Plus size={16} />
                  {t('songs.addLink')}
                </button>
              </div>

              {links.map((link, index) => (
                <div key={index} className="flex gap-2">
                  <div className="flex-grow space-y-2">
                    <div className="flex items-center gap-2">
                      <LinkIcon size={16} className="text-neutral-500 flex-shrink-0" />
                      <input
                        type="url"
                        value={link.url}
                        onChange={(e) => updateLink(index, 'url', e.target.value)}
                        placeholder={t('songs.linkUrl')}
                        className="w-full px-3 py-2 bg-neutral-900 border border-primary-500/30 rounded-md text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-sm"
                      />
                    </div>
                    <input
                      type="text"
                      value={link.description}
                      onChange={(e) => updateLink(index, 'description', e.target.value)}
                      placeholder={t('songs.linkDesc')}
                      className="w-full px-3 py-2 bg-neutral-900 border border-primary-500/30 rounded-md text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-sm"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeLink(index)}
                    className="self-start p-2 text-neutral-400 hover:text-secondary-500 transition-colors rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            
            {error && <p className="text-sm text-secondary-500">{error}</p>}
            
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="flex-1 px-4 py-2 text-neutral-300 bg-neutral-900 border border-primary-500/30 rounded-md hover:bg-neutral-800 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/50"
              >
                {t('songs.cancel')}
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 text-neutral-900 bg-primary-500 rounded-md hover:bg-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/50"
              >
                {t('songs.submit')}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default SongSubmissionForm;