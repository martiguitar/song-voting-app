export interface Song {
  id: string;
  title: string;
  artist: string;
  votes: number;
  addedAt: Date;
  sessionDate: Date;
  votedBy: Set<string>;
  voteType?: 'up' | 'down';
  submitter: string;
  submitterUserId?: string;
  links?: {
    url: string;
    description: string;
  }[];
  blockedUntil: Date | null;
}

export interface Session {
  date: Date;
  songs: Song[];
}

export interface Vote {
  songId: string;
  userId: string;
  type: 'up' | 'down';
}