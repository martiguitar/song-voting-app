import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Song } from '../types';
import SongCard from './SongCard';
import { Trophy } from 'lucide-react';

interface TopSongsProps {
  songs: Song[];
  onUpvote: (id: string) => void;
  onDownvote: (id: string) => void;
  onRemove: (id: string) => void;
  onUndoVote: (id: string) => void;
  onAddLink: (id: string, url: string, description: string) => void;
  onRemoveLink: (id: string, index: number) => void;
  onBlock?: (id: string) => void;
  onUnblock?: (id: string) => void;
  hasVoted: (id: string) => boolean;
}

const TopSongs: React.FC<TopSongsProps> = ({ 
  songs, 
  onUpvote, 
  onDownvote, 
  onRemove, 
  onUndoVote,
  onAddLink,
  onRemoveLink,
  onBlock,
  onUnblock,
  hasVoted 
}) => {
  const { t } = useLanguage();
  
  if (songs.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="text-primary-300" size={24} />
        <h2 className="text-xl font-semibold text-primary-300 font-sans">{t('songs.top')}</h2>
      </div>
      
      <div className="p-4 rounded-lg bg-gradient-to-r from-neutral-800/50 via-neutral-800/30 to-neutral-800/50 border border-primary-500/30 shadow-[0_0_30px_rgba(0,225,255,0.1)]">
        <div className="space-y-4">
          {songs.map((song, index) => (
            <SongCard
              key={song.id}
              song={song}
              onUpvote={onUpvote}
              onDownvote={onDownvote}
              onRemove={onRemove}
              onUndoVote={onUndoVote}
              onAddLink={onAddLink}
              onRemoveLink={onRemoveLink}
              onBlock={onBlock}
              onUnblock={onUnblock}
              isTopSong={true}
              rank={index + 1}
              hasVoted={hasVoted(song.id)}
            />
          ))}
        </div>
        
        <p className="mt-4 text-sm text-center text-neutral-400">
          {t('songs.willBePlayed')}
        </p>
      </div>
    </div>
  );
};

export default TopSongs;