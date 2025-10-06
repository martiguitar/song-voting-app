import React, { useState, useEffect } from 'react';
import { Song } from '../types';
import { ChevronUp, ChevronDown, Trash2, Music, Link as LinkIcon, RotateCcw, ExternalLink, User, Ban, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useSettings } from '../hooks/useSettings';
import SongDetailsModal from './SongDetailsModal';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';
import VoteNotificationModal from './VoteNotificationModal';
import { isVotingAllowed } from '../utils';

interface SongCardProps {
  song: Song;
  onUpvote: (id: string) => void;
  onDownvote: (id: string) => void;
  onRemove: (id: string) => void;
  onUndoVote?: (id: string) => void;
  onAddLink?: (id: string, url: string, description: string) => void;
  onRemoveLink?: (id: string, index: number) => void;
  onBlock?: (id: string) => void;
  onUnblock?: (id: string) => void;
  isTopSong: boolean;
  rank?: number;
  hasVoted: boolean;
  readonly?: boolean;
  onClick?: () => void;
}

const SongCard: React.FC<SongCardProps> = ({ 
  song, 
  onUpvote, 
  onDownvote, 
  onRemove,
  onUndoVote,
  onAddLink,
  onRemoveLink,
  onBlock,
  onUnblock,
  isTopSong,
  rank,
  hasVoted,
  readonly = false,
  onClick
}) => {
  const { t } = useLanguage();
  const { settings } = useSettings();
  const [showDetails, setShowDetails] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const [showVoteNotification, setShowVoteNotification] = useState(false);
  const [pendingVoteAction, setPendingVoteAction] = useState<(() => void) | null>(null);

  useEffect(() => {
    const hasSeenNotification = localStorage.getItem('voteNotificationSeen');
    if (!hasSeenNotification) {
      setShowVoteNotification(false);
    }
  }, []);

  const isNew = Date.now() - song.addedAt.getTime() < 5 * 24 * 60 * 60 * 1000; // 5 days
  const isBlocked = song.blockedUntil && song.blockedUntil > new Date();
  const votingAllowed = isVotingAllowed();

  const getBlockedDaysRemaining = () => {
    if (!song.blockedUntil || song.blockedUntil <= new Date()) return 0;
    const diffTime = song.blockedUntil.getTime() - Date.now();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleVoteClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    if (isBlocked || !votingAllowed) return;

    const hasSeenNotification = localStorage.getItem('voteNotificationSeen');
    if (!hasSeenNotification) {
      setPendingVoteAction(() => action);
      setShowVoteNotification(true);
    } else {
      action();
    }
  };

  const handleConfirmVote = () => {
    localStorage.setItem('voteNotificationSeen', 'true');
    setShowVoteNotification(false);
    if (pendingVoteAction) {
      pendingVoteAction();
      setPendingVoteAction(null);
    }
  };

  const handleCancelVote = () => {
    setShowVoteNotification(false);
    setPendingVoteAction(null);
  };

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const handleBlockClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowBlockConfirm(true);
  };

  const handleConfirmDelete = () => {
    onRemove(song.id);
    setShowDeleteConfirm(false);
  };

  const handleConfirmBlock = () => {
    if (isBlocked && onUnblock) {
      onUnblock(song.id);
    } else if (!isBlocked && onBlock) {
      onBlock(song.id);
    }
    setShowBlockConfirm(false);
  };

  const handleLinkClick = (e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    window.open(url, '_blank');
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    } else if (!readonly) {
      setShowDetails(true);
    }
  };

  const getVoteButtons = () => {
    if (readonly) return null;

    if (hasVoted && onUndoVote) {
      return (
        <button
          onClick={(e) => handleVoteClick(e, () => onUndoVote(song.id))}
          className="group relative p-2 text-neutral-400 hover:text-primary-300 hover:bg-primary-500/10 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/50"
          title={!votingAllowed ? t('songs.votingClosed') : isBlocked ? t('songs.blocked') : t('songs.undoVote')}
          disabled={isBlocked || !votingAllowed}
        >
          <RotateCcw size={20} />
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-neutral-800 text-neutral-200 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            {!votingAllowed ? t('songs.votingClosed') : isBlocked ? t('songs.blocked') : t('songs.undoVote')}
          </span>
        </button>
      );
    }

    return (
      <div className="flex gap-1" onClick={e => e.stopPropagation()}>
        <button
          onClick={(e) => handleVoteClick(e, () => onUpvote(song.id))}
          className={`group relative p-2 transition-colors rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500/50 ${
            song.voteType === 'up'
              ? 'text-primary-300 bg-primary-500/20'
              : 'text-neutral-400 hover:bg-primary-500/10 hover:text-primary-300'
          } ${(isBlocked || !votingAllowed) ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={isBlocked || !votingAllowed}
          title={!votingAllowed ? t('songs.votingClosed') : isBlocked ? t('songs.blocked') : t('songs.upvote')}
        >
          <ChevronUp size={20} />
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-neutral-800 text-neutral-200 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            {!votingAllowed ? t('songs.votingClosed') : isBlocked ? t('songs.blocked') : t('songs.upvote')}
          </span>
        </button>

        {settings.downvoteEnabled && (
          <button
            onClick={(e) => handleVoteClick(e, () => onDownvote(song.id))}
            className={`group relative p-2 transition-colors rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500/50 ${
              song.voteType === 'down'
                ? 'text-secondary-500 bg-secondary-500/20'
                : 'text-neutral-400 hover:bg-secondary-500/10 hover:text-secondary-500'
            } ${(isBlocked || !votingAllowed) ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isBlocked || !votingAllowed}
            title={!votingAllowed ? t('songs.votingClosed') : isBlocked ? t('songs.blocked') : t('songs.downvote')}
          >
            <ChevronDown size={20} />
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-neutral-800 text-neutral-200 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {!votingAllowed ? t('songs.votingClosed') : isBlocked ? t('songs.blocked') : t('songs.downvote')}
            </span>
          </button>
        )}
      </div>
    );
  };

  return (
    <>
      <div
        onClick={handleCardClick}
        className={`relative p-3 sm:p-4 mb-2 sm:mb-3 bg-neutral-800/50 backdrop-blur-sm rounded-lg border transition-all duration-300 hover:bg-neutral-800/70 ${
          !readonly || onClick ? 'cursor-pointer' : ''
        } ${
          isTopSong ? 'border-primary-500/30 shadow-[0_0_15px_rgba(0,225,255,0.3)]' : 'border-primary-500/10'
        } ${
          isBlocked ? 'opacity-75' : ''
        }`}
        role="button"
        tabIndex={0}
        onKeyPress={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleCardClick();
          }
        }}
      >
        {isTopSong && rank && (
          <div className="absolute flex items-center justify-center w-6 h-6 text-sm font-bold text-neutral-900 rounded-full -top-2 -left-2 bg-primary-300">
            {rank}
          </div>
        )}

        {isNew && (
          <div className="absolute flex items-center justify-center px-2 py-0.5 text-xs font-bold text-neutral-900 rounded-md -top-2 -right-2 bg-primary-300">
            NEU
          </div>
        )}

        {isBlocked && (
          <div className="absolute flex items-center justify-center px-2 py-0.5 text-xs font-bold text-red-900 rounded-md -top-2 right-2 bg-red-400">
            GESPERRT ({getBlockedDaysRemaining()}T)
          </div>
        )}
        
        <div className="flex items-start gap-2 sm:gap-3">
          <div className="flex-shrink-0">
            <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary-500/10 text-primary-300 ring-1 ring-primary-500/30">
              <Music size={16} className="sm:w-[18px] sm:h-[18px]" />
            </div>
          </div>
          
          <div className="flex-grow min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-neutral-100 line-clamp-1 flex items-center gap-2 group">
              {song.title}
              {(!readonly || onClick) && (
                <ExternalLink size={14} className="text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity sm:w-4 sm:h-4" />
              )}
            </h3>
            <p className="text-sm text-neutral-400 line-clamp-1">
              by {song.artist}
            </p>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-1">
              <span className="text-xs text-neutral-400">
                {song.addedAt.toLocaleDateString()}
              </span>
              <span className={`text-sm font-medium ${
                song.votes > 0 ? 'text-primary-300' : 
                song.votes < 0 ? 'text-secondary-500' : 
                'text-neutral-400'
              }`}>
                {song.votes > 0 ? '+' : ''}{song.votes}
              </span>
              <span className="flex items-center gap-1 text-xs text-neutral-400">
                <User size={10} className="sm:w-3 sm:h-3" />
                {song.submitter}
              </span>
            </div>
            
            {song.links && song.links.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {song.links.map((link, index) => (
                  <button
                    key={index}
                    onClick={(e) => handleLinkClick(e, link.url)}
                    className="group relative flex items-center gap-1 text-xs sm:text-sm text-neutral-400 hover:text-primary-300 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/50 rounded-md px-2 py-1"
                  >
                    <LinkIcon size={12} className="sm:w-3.5 sm:h-3.5" />
                    {link.description}
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-neutral-800 text-neutral-200 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {link.url}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex items-start gap-1 sm:gap-2">
            {getVoteButtons()}
            
            {!readonly && (
              <>
                {(onBlock || onUnblock) && (
                  <button 
                    onClick={handleBlockClick}
                    className={`group relative p-2 transition-colors rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500/50 ${
                      isBlocked
                        ? 'text-red-500 bg-red-500/20'
                        : 'text-neutral-400 hover:bg-red-500/10 hover:text-red-500'
                    }`}
                    aria-label={isBlocked ? t('songs.unblock') : t('songs.block')}
                  >
                    <Ban size={14} className="sm:w-4 sm:h-4" />
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-neutral-800 text-neutral-200 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {isBlocked ? t('songs.unblock') : t('songs.block')}
                    </span>
                  </button>
                )}
                <button 
                  onClick={handleRemoveClick}
                  className="group relative p-2 text-neutral-400 transition-colors rounded-full hover:bg-secondary-500/10 hover:text-secondary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                  aria-label={t('songs.remove')}
                >
                  <Trash2 size={14} className="sm:w-4 sm:h-4" />
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-neutral-800 text-neutral-200 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {t('songs.remove')}
                  </span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {showDetails && !readonly && (
        <SongDetailsModal
          song={song}
          onClose={() => setShowDetails(false)}
          onAddLink={(url: string, description: string) => {
            if (onAddLink) {
              onAddLink(song.id, url, description);
            }
          }}
          onRemoveLink={onRemoveLink ? (index: number) => onRemoveLink(song.id, index) : undefined}
        />
      )}

      <DeleteConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        title={t('songs.deleteTitle')}
        message={t('songs.deleteMessage', { title: song.title, artist: song.artist })}
      />

      {(onBlock || onUnblock) && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/80 backdrop-blur-sm ${
          showBlockConfirm ? '' : 'hidden'
        }`}>
          <div className="w-full max-w-md p-6 bg-neutral-800 rounded-lg shadow-xl border border-primary-500/20">
            <h3 className="text-xl font-semibold text-primary-300 mb-4">
              {isBlocked ? t('songs.unblock') : t('songs.block')}
            </h3>
            <p className="text-neutral-300 mb-2">{song.title}</p>
            <p className="text-neutral-400 mb-6">{song.artist}</p>

            <div className="flex gap-3">
              <button
                onClick={handleConfirmBlock}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/50"
              >
                <Check size={18} className="inline-block mr-2" />
                {t('songs.confirm')}
              </button>
              <button
                onClick={() => setShowBlockConfirm(false)}
                className="flex-1 px-4 py-2 bg-neutral-700 text-neutral-300 rounded-md hover:bg-neutral-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/50"
              >
                {t('songs.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      <VoteNotificationModal
        isOpen={showVoteNotification}
        onClose={handleCancelVote}
        onConfirm={handleConfirmVote}
      />
    </>
  );
};

export default React.memo(SongCard);