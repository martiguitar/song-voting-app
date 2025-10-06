import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Song } from '../types';
import SongCard from './SongCard';
import { List, Search, SortAsc, ArrowUpDown, Music, Vote } from 'lucide-react';

interface SongListProps {
  songs: Song[];
  onUpvote: (id: string) => void;
  onDownvote: (id: string) => void;
  onRemove: (id: string) => void;
  onUndoVote: (id: string) => void;
  onAddLink: (id: string, url: string, description: string) => void;
  onRemoveLink: (id: string, index: number) => void;
  onBlock?: (id: string) => void;
  onUnblock?: (id: string) => void;
  topSongIds: string[];
  hasVoted: (id: string) => boolean;
  currentUserId?: string;
}

type SortKey = 'votes' | 'title' | 'artist' | 'addedAt';
type SortOrder = 'asc' | 'desc';

const SongList: React.FC<SongListProps> = ({
  songs,
  onUpvote,
  onDownvote,
  onRemove,
  onUndoVote,
  onAddLink,
  onRemoveLink,
  onBlock,
  onUnblock,
  topSongIds,
  hasVoted,
  currentUserId
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('addedAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const { t } = useLanguage();

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('desc');
    }
  };

  const getSortIcon = (key: SortKey) => {
    if (sortKey !== key) return null;
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  const sortedSongs = [...songs].sort((a, b) => {
    const multiplier = sortOrder === 'asc' ? 1 : -1;
    
    switch (sortKey) {
      case 'votes':
        return (b.votes - a.votes) * multiplier;
      case 'title':
        return a.title.localeCompare(b.title) * multiplier;
      case 'artist':
        return a.artist.localeCompare(b.artist) * multiplier;
      case 'addedAt':
        return (b.addedAt.getTime() - a.addedAt.getTime()) * multiplier;
      default:
        return 0;
    }
  });

  const filteredSongs = sortedSongs.filter(
    (song) =>
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <List size={20} className="text-primary-300" />
          <h2 className="text-xl font-semibold text-primary-300 font-sans">{t('songs.all')}</h2>
        </div>
        <p className="text-sm text-neutral-400">{songs.length} {t('songs.count')}</p>
      </div>

      <div className="space-y-4 mb-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search size={18} className="text-neutral-500" />
          </div>
          <input
            type="text"
            placeholder={t('songs.search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-neutral-800/50 border border-primary-500/30 rounded-md placeholder-neutral-500 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleSort('votes')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors ${
              sortKey === 'votes'
                ? 'bg-primary-500/20 text-primary-300'
                : 'bg-neutral-800/50 text-neutral-400 hover:text-primary-300 hover:bg-primary-500/10'
            }`}
          >
            <Vote size={14} />
            Votes {getSortIcon('votes')}
          </button>
          <button
            onClick={() => handleSort('title')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors ${
              sortKey === 'title'
                ? 'bg-primary-500/20 text-primary-300'
                : 'bg-neutral-800/50 text-neutral-400 hover:text-primary-300 hover:bg-primary-500/10'
            }`}
          >
            <SortAsc size={14} />
            Title {getSortIcon('title')}
          </button>
          <button
            onClick={() => handleSort('artist')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors ${
              sortKey === 'artist'
                ? 'bg-primary-500/20 text-primary-300'
                : 'bg-neutral-800/50 text-neutral-400 hover:text-primary-300 hover:bg-primary-500/10'
            }`}
          >
            <Music size={14} />
            Artist {getSortIcon('artist')}
          </button>
          <button
            onClick={() => handleSort('addedAt')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors ${
              sortKey === 'addedAt'
                ? 'bg-primary-500/20 text-primary-300'
                : 'bg-neutral-800/50 text-neutral-400 hover:text-primary-300 hover:bg-primary-500/10'
            }`}
          >
            <ArrowUpDown size={14} />
            Date {getSortIcon('addedAt')}
          </button>
        </div>
      </div>

      {filteredSongs.length === 0 ? (
        <div className="p-8 text-center rounded-lg bg-neutral-800/30 border border-primary-500/20">
          <p className="text-neutral-400">
            {searchQuery ? t('songs.noResults') : t('songs.noSongs')}
          </p>
        </div>
      ) : (
        <div className="flex flex-col-reverse space-y-reverse space-y-2">
          {filteredSongs.map((song) => (
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
              isTopSong={topSongIds.includes(song.id)}
              hasVoted={hasVoted(song.id)}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SongList;