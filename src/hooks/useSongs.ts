import { useState, useEffect } from 'react';
import { Song, Session } from '../types';
import { getNextSessionDate, isSameDay, generateUserId, isVotingAllowed } from '../utils';
import { supabase } from '../lib/supabase';

const USER_ID_KEY = 'ton.band.userId';

export const useSongs = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [userId] = useState(() => {
    const stored = localStorage.getItem(USER_ID_KEY);
    if (stored) return stored;
    const newId = generateUserId();
    localStorage.setItem(USER_ID_KEY, newId);
    return newId;
  });
  const nextSessionDate = getNextSessionDate();

  useEffect(() => {
    const fetchSongsAndVotes = async () => {
      const { data: songsData, error: songsError } = await supabase
        .from('songs')
        .select(`
          *,
          votes (
            user_id,
            vote_type
          ),
          links (
            id,
            url,
            description
          )
        `)
        .order('votes', { ascending: false });

      if (songsError) {
        console.error('Error fetching songs:', songsError);
        return;
      }

      const processedSongs = songsData.map(song => {
        const userVote = song.votes?.find((vote: any) => vote.user_id === userId);
        const upvotes = song.votes?.filter((vote: any) => vote.vote_type === 'up').length || 0;
        const downvotes = song.votes?.filter((vote: any) => vote.vote_type === 'down').length || 0;
        const totalVotes = upvotes - downvotes;

        return {
          id: song.id,
          title: song.title,
          artist: song.artist,
          votes: totalVotes,
          addedAt: new Date(song.added_at),
          sessionDate: new Date(song.session_date),
          submitter: song.submitter,
          votedBy: new Set(song.votes?.map((vote: any) => vote.user_id) || []),
          voteType: userVote?.vote_type,
          links: song.links,
          blockedUntil: song.blocked_until ? new Date(song.blocked_until) : null
        };
      });

      setSongs(processedSongs);
    };

    fetchSongsAndVotes();

    const songsSubscription = supabase
      .channel('songs_channel')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'songs'
      }, () => {
        fetchSongsAndVotes();
      })
      .subscribe();

    const votesSubscription = supabase
      .channel('votes_channel')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'votes'
      }, () => {
        fetchSongsAndVotes();
      })
      .subscribe();

    return () => {
      songsSubscription.unsubscribe();
      votesSubscription.unsubscribe();
    };
  }, [userId]);

  const resetVotes = async () => {
    try {
      // Delete all votes from the votes table
      const { error: votesError } = await supabase
        .from('votes')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all votes

      if (votesError) {
        console.error('Error resetting votes:', votesError);
        throw votesError;
      }

      // Reset the votes count in the songs table
      const { error: songsError } = await supabase
        .from('songs')
        .update({ votes: 0 })
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Update all songs

      if (songsError) {
        console.error('Error resetting song vote counts:', songsError);
        throw songsError;
      }
    } catch (error) {
      console.error('Error in resetVotes operation:', error);
      throw error;
    }
  };

  const upvoteSong = async (id: string) => {
    if (!id) {
      console.error('Invalid song ID provided for upvote');
      return;
    }

    if (!isVotingAllowed()) {
      console.error('Voting is not allowed at this time');
      return;
    }

    const song = songs.find(s => s.id === id);
    if (song?.blockedUntil && song.blockedUntil > new Date()) {
      console.error('Song is blocked from voting');
      return;
    }

    const { error } = await supabase
      .from('votes')
      .upsert({
        song_id: id,
        user_id: userId,
        vote_type: 'up'
      });

    if (error) {
      console.error('Error upvoting song:', error);
    }
  };

  const downvoteSong = async (id: string) => {
    if (!id) {
      console.error('Invalid song ID provided for downvote');
      return;
    }

    if (!isVotingAllowed()) {
      console.error('Voting is not allowed at this time');
      return;
    }

    const song = songs.find(s => s.id === id);
    if (song?.blockedUntil && song.blockedUntil > new Date()) {
      console.error('Song is blocked from voting');
      return;
    }

    const { error } = await supabase
      .from('votes')
      .upsert({
        song_id: id,
        user_id: userId,
        vote_type: 'down'
      });

    if (error) {
      console.error('Error downvoting song:', error);
    }
  };

  const undoVote = async (id: string) => {
    if (!id) {
      console.error('Invalid song ID provided for vote removal');
      return;
    }

    if (!isVotingAllowed()) {
      console.error('Voting is not allowed at this time');
      return;
    }

    const song = songs.find(s => s.id === id);
    if (song?.blockedUntil && song.blockedUntil > new Date()) {
      console.error('Song is blocked from voting');
      return;
    }

    const { error } = await supabase
      .from('votes')
      .delete()
      .match({ song_id: id, user_id: userId });

    if (error) {
      console.error('Error removing vote:', error);
    }
  };

  const blockSong = async (songId: string) => {
    if (!songId) {
      console.error('Invalid song ID provided for blocking');
      return;
    }

    try {
      const { error } = await supabase
        .from('songs')
        .update({ 
          blocked_until: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString() 
        })
        .eq('id', songId);

      if (error) {
        console.error('Error blocking song:', error);
      }
    } catch (error) {
      console.error('Error in blockSong operation:', error);
    }
  };

  const unblockSong = async (songId: string) => {
    if (!songId) {
      console.error('Invalid song ID provided for unblocking');
      return;
    }

    try {
      const { error } = await supabase
        .from('songs')
        .update({ blocked_until: null })
        .eq('id', songId);

      if (error) {
        console.error('Error unblocking song:', error);
      }
    } catch (error) {
      console.error('Error in unblockSong operation:', error);
    }
  };

  const addSong = async (title: string, artist: string, submitter: string, links?: { url: string; description: string }[]) => {
    if (!title) {
      console.error('Invalid song title provided');
      return;
    }

    const { data: existingSongs } = await supabase
      .from('songs')
      .select('id')
      .ilike('title', title)
      .ilike('artist', artist);

    if (existingSongs && existingSongs.length > 0) {
      console.error('Song already exists');
      return;
    }

    const { data: song, error: songError } = await supabase
      .from('songs')
      .insert({
        title,
        artist,
        submitter,
        session_date: nextSessionDate.toISOString(),
        votes: 0
      })
      .select()
      .single();

    if (songError) {
      console.error('Error adding song:', songError);
      return;
    }

    if (links && links.length > 0 && song) {
      const { error: linksError } = await supabase
        .from('links')
        .insert(
          links.map(link => ({
            song_id: song.id,
            url: link.url,
            description: link.description
          }))
        );

      if (linksError) {
        console.error('Error adding links:', linksError);
      }
    }
  };

  const removeSong = async (id: string) => {
    if (!id) {
      console.error('Invalid song ID provided for removal');
      return;
    }

    const { error } = await supabase
      .from('songs')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error removing song:', error);
    }
  };

  const addLink = async (songId: string, url: string, description: string) => {
    if (!songId) {
      console.error('Invalid song ID provided for adding link');
      return;
    }

    const { error } = await supabase
      .from('links')
      .insert({
        song_id: songId,
        url,
        description
      });

    if (error) {
      console.error('Error adding link:', error);
      throw error;
    }
  };

  const removeLink = async (songId: string, index: number) => {
    if (!songId) {
      console.error('Invalid song ID provided for removing link');
      return;
    }

    const song = songs.find(s => s.id === songId);
    if (!song?.links?.[index]) return;

    const { error } = await supabase
      .from('links')
      .delete()
      .eq('id', song.links[index].id);

    if (error) {
      console.error('Error removing link:', error);
    }
  };

  const hasVoted = (songId: string): boolean => {
    if (!songId) return false;
    const song = songs.find(s => s.id === songId);
    return song?.votedBy.has(userId) || false;
  };

  const topSongs = [...songs]
    .filter(song => !song.blockedUntil || song.blockedUntil <= new Date())
    .sort((a, b) => b.votes - a.votes)
    .slice(0, 3);

  const allSongs = songs.reduce((acc, song) => {
    const key = `${song.title}-${song.artist}`.toLowerCase();
    if (!acc.some(s => `${s.title}-${s.artist}`.toLowerCase() === key)) {
      acc.push(song);
    }
    return acc;
  }, [] as Song[]);

  return {
    songs,
    topSongs,
    addSong,
    upvoteSong,
    downvoteSong,
    undoVote,
    removeSong,
    addLink,
    removeLink,
    blockSong,
    unblockSong,
    resetVotes,
    nextSessionDate,
    hasVoted,
    sessions,
    allSongs
  };
};