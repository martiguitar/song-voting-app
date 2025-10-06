import React, { useState, useEffect } from 'react';
import { useSongs } from './hooks/useSongs';
import { useLanguage } from './context/LanguageContext';
import SongSubmissionForm from './components/SongSubmissionForm';
import TopSongs from './components/TopSongs';
import SongList from './components/SongList';
import AllSongs from './components/AllSongs';
import Navigation from './components/Navigation';
import VotingCountdown from './components/VotingCountdown';
import SetupSection from './components/SetupSection';
import Footer from './components/Footer';
import { formatDate, getNextSessionDate, getNextVotingStart, getVotingEndTime } from './utils';

type View = 'current' | 'allSongs' | 'setup';

function App() {
  const [currentView, setCurrentView] = useState<View>('current');
  const [scrollProgress, setScrollProgress] = useState(0);
  const { songs, topSongs, addSong, upvoteSong, downvoteSong, undoVote, removeSong, addLink, removeLink, nextSessionDate, hasVoted, allSongs, userId } = useSongs();
  const { t } = useLanguage();
  
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const maxScroll = 100; // Threshold for full collapse
      const progress = Math.min(scrollPosition / maxScroll, 1);
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
      <div className="absolute inset-0 bg-white/5 pointer-events-none z-0" />

      <div className="relative z-10">
        <header 
          className="sticky top-0 z-20 bg-black/30 backdrop-blur-lg border-b border-primary-500/20"
          style={{
            paddingTop: `${Math.max(16, 24 - (8 * scrollProgress))}px`,
            paddingBottom: `${Math.max(16, 24 - (8 * scrollProgress))}px`,
          }}
        >
          <div className="container px-4 mx-auto">
            <Navigation 
              currentView={currentView} 
              onViewChange={setCurrentView}
              isHeaderCollapsed={scrollProgress > 0.5}
            />
            
            <div 
              className="flex flex-col items-center overflow-hidden transition-transform duration-300"
              style={{
                opacity: 1 - scrollProgress,
                maxHeight: `${Math.max(0, 100 - (100 * scrollProgress))}px`,
                transform: `translateY(${-20 * scrollProgress}px)`,
              }}
            >
              <p className="text-sm text-neutral-400 font-medium">
                {t('app.nextSession')} <span className="text-primary-300">{formatDate(nextSessionDate)}</span>
              </p>
              
              {currentView === 'current' && (
                <VotingCountdown 
                  endTime={getVotingEndTime()} 
                  nextVotingStart={getNextVotingStart()} 
                />
              )}
            </div>
          </div>
        </header>

        <main className="container px-4 py-8 mx-auto max-w-3xl">
          {currentView === 'current' && (
            <>
              <SongSubmissionForm onSubmit={addSong} />
              <TopSongs
                songs={topSongs}
                onUpvote={upvoteSong}
                onDownvote={downvoteSong}
                onRemove={removeSong}
                onUndoVote={undoVote}
                onAddLink={addLink}
                onRemoveLink={removeLink}
                hasVoted={hasVoted}
                currentUserId={userId}
              />
              <SongList
                songs={songs}
                onUpvote={upvoteSong}
                onDownvote={downvoteSong}
                onRemove={removeSong}
                onUndoVote={undoVote}
                onAddLink={addLink}
                onRemoveLink={removeLink}
                topSongIds={topSongs.map(song => song.id)}
                hasVoted={hasVoted}
                currentUserId={userId}
              />
            </>
          )}

          {currentView === 'allSongs' && (
            <AllSongs 
              songs={allSongs} 
              onAddLink={addLink}
              onRemoveLink={removeLink}
            />
          )}

          {currentView === 'setup' && (
            <SetupSection />
          )}
        </main>
        
        <Footer />
      </div>
    </div>
  );
}

export default App;