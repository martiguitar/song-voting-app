import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Song } from '../types';
import { Library, Shuffle, Search } from 'lucide-react';
import { formatDate } from '../utils';
import SongCard from './SongCard';
import SongDetailsModal from './SongDetailsModal';

interface AllSongsProps {
  songs: Song[];
  onAddLink: (id: string, url: string, description: string) => void;
  onRemoveLink: (id: string, index: number) => void;
}

const AllSongs: React.FC<AllSongsProps> = ({ songs = [], onAddLink, onRemoveLink }) => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [randomSong, setRandomSong] = useState<Song | null>(null);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);

  const sortedSongs = [...songs].sort((a, b) => {
    const titleCompare = a.title.localeCompare(b.title);
    return titleCompare !== 0 ? titleCompare : a.artist.localeCompare(b.artist);
  });

  const filteredSongs = sortedSongs.filter(
    song =>
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pickRandomSong = () => {
    const availableSongs = searchQuery ? filteredSongs : sortedSongs;
    if (availableSongs.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableSongs.length);
      setRandomSong(availableSongs[randomIndex]);
    }
  };

  const handleSongClick = (song: Song) => {
    setSelectedSong(song);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Library className="text-primary-300" size={24} />
          <h2 className="text-xl font-semibold text-primary-300 font-sans">
            {t('allSongs.title')}
          </h2>
        </div>
        <p className="text-sm text-neutral-400">
          {t('allSongs.total')} {songs.length}
        </p>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-grow">
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
        
        <button
          onClick={pickRandomSong}
          className="px-4 py-2 flex items-center gap-2 text-neutral-300 bg-neutral-800/50 border border-primary-500/30 rounded-md hover:bg-primary-500/10 hover:text-primary-300 transition-colors"
        >
          <Shuffle size={18} />
          {t('songs.pickRandom')}
        </button>
      </div>

      {randomSong && (
        <div className="p-4 border border-primary-500/30 rounded-lg bg-neutral-800/50">
          <h3 className="text-lg font-medium text-primary-300 mb-2">
            {t('songs.random')}
          </h3>
          <SongCard
            song={randomSong}
            onUpvote={() => {}}
            onDownvote={() => {}}
            onRemove={() => {}}
            isTopSong={false}
            hasVoted={true}
            onClick={() => handleSongClick(randomSong)}
          />
        </div>
      )}

      <div className="space-y-2">
        {filteredSongs.map(song => (
          <SongCard
            key={`${song.id}-${song.sessionDate.toISOString()}`}
            song={song}
            onUpvote={() => {}}
            onDownvote={() => {}}
            onRemove={() => {}}
            isTopSong={false}
            hasVoted={true}
            onClick={() => handleSongClick(song)}
          />
        ))}
      </div>

      {selectedSong && (
        <SongDetailsModal
          song={selectedSong}
          onClose={() => setSelectedSong(null)}
          onAddLink={(url, description) => onAddLink(selectedSong.id, url, description)}
          onRemoveLink={(index) => onRemoveLink(selectedSong.id, index)}
        />
      )}
    </div>
  );
};

export default React.memo(AllSongs);