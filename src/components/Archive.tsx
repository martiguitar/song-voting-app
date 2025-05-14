import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Session } from '../types';
import SongCard from './SongCard';
import { Archive as ArchiveIcon } from 'lucide-react';
import { formatDate } from '../utils';

interface ArchiveProps {
  sessions: Session[];
}

const Archive: React.FC<ArchiveProps> = ({ sessions = [] }) => {
  const { t } = useLanguage();
  const pastSessions = (sessions || [])
    .filter(session => session.date < new Date())
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  if (pastSessions.length === 0) {
    return (
      <div className="p-8 text-center rounded-lg bg-gray-900/30 border border-gray-800">
        <p className="text-gray-500">{t('archive.noSessions')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 mb-6">
        <ArchiveIcon className="text-gray-400" size={24} />
        <h2 className="text-xl font-semibold text-white font-montserrat">
          {t('archive.title')}
        </h2>
      </div>

      {pastSessions.map(session => (
        <div key={session.date.toISOString()} className="space-y-4">
          <h3 className="text-lg font-medium text-gray-400">
            {t('archive.sessionDate')} {formatDate(session.date)}
          </h3>
          <div className="p-4 rounded-lg bg-gray-900/30 border border-gray-800">
            {session.songs
              .sort((a, b) => b.votes - a.votes)
              .map(song => (
                <SongCard
                  key={song.id}
                  song={song}
                  onUpvote={() => {}}
                  onDownvote={() => {}}
                  onRemove={() => {}}
                  isTopSong={false}
                  hasVoted={true}
                  readonly
                />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Archive;