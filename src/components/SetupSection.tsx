import React, { useState } from 'react';
import { Settings, RotateCcw, Check, Ban, ThumbsDown, Toggle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useSongs } from '../hooks/useSongs';
import { useSettings } from '../hooks/useSettings';
import SongList from './SongList';

const SETUP_PASSWORD = 'Tremonti88';

const SetupSection: React.FC = () => {
  const { t } = useLanguage();
  const { resetVotes, songs, blockSong, unblockSong } = useSongs();
  const { settings, loading: settingsLoading, toggleDownvote } = useSettings();
  const [isResetting, setIsResetting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === SETUP_PASSWORD) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError(t('setup.wrongPassword'));
    }
  };

  const handleResetVotes = async () => {
    try {
      setIsResetting(true);
      await resetVotes();
      setShowConfirm(false);
    } catch (error) {
      console.error('Error resetting votes:', error);
    } finally {
      setIsResetting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="text-primary-300" size={24} />
          <h2 className="text-xl font-semibold text-primary-300">{t('setup.title')}</h2>
        </div>
        
        <div className="p-6 rounded-lg bg-neutral-800/50 border border-primary-500/20">
          <form onSubmit={handlePasswordSubmit} className="max-w-sm mx-auto space-y-4">
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-neutral-400">
                {t('setup.password')}
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-900 border border-primary-500/30 rounded-md text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                placeholder="••••••••"
              />
              {error && <p className="text-sm text-secondary-500">{error}</p>}
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 text-neutral-900 bg-primary-500 rounded-md hover:bg-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/50"
            >
              {t('setup.unlock')}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Settings className="text-primary-300" size={24} />
          <h2 className="text-xl font-semibold text-primary-300">{t('setup.title')}</h2>
        </div>
        <button
          onClick={() => setIsAuthenticated(false)}
          className="text-sm text-neutral-400 hover:text-primary-300 transition-colors"
        >
          {t('setup.lock')}
        </button>
      </div>
      
      <div className="space-y-6">
        {/* Downvote Toggle Section */}
        <div className="p-4 rounded-lg bg-neutral-800/50 border border-primary-500/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-neutral-100 mb-1 flex items-center gap-2">
                <ThumbsDown size={20} />
                Downvote-Funktion
              </h3>
              <p className="text-sm text-neutral-400">
                Aktiviere oder deaktiviere die Downvote-Buttons für alle Benutzer
              </p>
            </div>
            
            <button
              onClick={toggleDownvote}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/50 ${
                settings.downvoteEnabled
                  ? 'bg-primary-500/20 text-primary-300 hover:bg-primary-500/30'
                  : 'bg-neutral-700 text-neutral-400 hover:bg-neutral-600'
              }`}
              disabled={settingsLoading}
            >
              <Toggle size={18} />
              {settings.downvoteEnabled ? 'Aktiviert' : 'Deaktiviert'}
            </button>
          </div>
        </div>

        {/* Reset Votes Section */}
        <div className="p-4 rounded-lg bg-neutral-800/50 border border-primary-500/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-neutral-100 mb-1">{t('setup.resetVotes')}</h3>
              <p className="text-sm text-neutral-400">{t('setup.resetVotesDesc')}</p>
            </div>
            
            {!showConfirm ? (
              <button
                onClick={() => setShowConfirm(true)}
                className="px-4 py-2 flex items-center gap-2 text-secondary-500 hover:text-secondary-400 bg-neutral-900 rounded-md hover:bg-neutral-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                disabled={isResetting}
              >
                <RotateCcw size={18} />
                {t('setup.resetButton')}
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleResetVotes}
                  className="px-4 py-2 text-neutral-900 bg-secondary-500 rounded-md hover:bg-secondary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-secondary-500/50"
                  disabled={isResetting}
                >
                  {isResetting ? t('setup.resetting') : t('setup.confirm')}
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-4 py-2 text-neutral-300 bg-neutral-900 rounded-md hover:bg-neutral-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                  disabled={isResetting}
                >
                  {t('setup.cancel')}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Song Management Section */}
        <div className="p-4 rounded-lg bg-neutral-800/50 border border-primary-500/20">
          <div className="mb-4">
            <h3 className="text-lg font-medium text-neutral-100 mb-1">{t('setup.manageSongs')}</h3>
            <p className="text-sm text-neutral-400">{t('setup.manageSongsDesc')}</p>
          </div>
          
          <SongList
            songs={songs}
            onUpvote={() => {}}
            onDownvote={() => {}}
            onRemove={() => {}}
            onUndoVote={() => {}}
            onAddLink={() => {}}
            onRemoveLink={() => {}}
            onBlock={blockSong}
            onUnblock={unblockSong}
            topSongIds={[]}
            hasVoted={() => true}
          />
        </div>
      </div>
    </div>
  );
};

export default SetupSection;