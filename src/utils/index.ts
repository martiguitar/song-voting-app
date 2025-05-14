export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
};

export const getNextSessionDate = (): Date => {
  const now = new Date();
  const nextSaturday = new Date(now);
  nextSaturday.setDate(now.getDate() + ((6 - now.getDay() + 7) % 7));
  nextSaturday.setHours(18, 0, 0, 0);
  return nextSaturday;
};

export const getNextVotingStart = (): Date => {
  const now = new Date();
  const nextSunday = new Date(now);
  nextSunday.setDate(now.getDate() + ((0 - now.getDay() + 7) % 7));
  nextSunday.setHours(10, 0, 0, 0);
  return nextSunday;
};

export const getVotingEndTime = (): Date => {
  const now = new Date();
  const thisFriday = new Date(now);
  thisFriday.setDate(now.getDate() + ((5 - now.getDay() + 7) % 7));
  thisFriday.setHours(18, 0, 0, 0);
  return thisFriday;
};

export const isVotingAllowed = (): boolean => {
  const now = new Date();
  const friday = new Date(now);
  friday.setDate(now.getDate() + ((5 - now.getDay() + 7) % 7));
  friday.setHours(18, 0, 0, 0);

  const sunday = new Date(now);
  sunday.setDate(now.getDate() + ((0 - now.getDay() + 7) % 7));
  sunday.setHours(10, 0, 0, 0);

  // If we're past Friday 18:00, get next Sunday's start time
  if (now > friday) {
    sunday.setDate(sunday.getDate() + 7);
  }

  // Voting is CLOSED between Friday 18:00 and Sunday 10:00
  const isClosedPeriod = now >= friday && now <= sunday;
  return !isClosedPeriod;
};

export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

export const generateUserId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

export const formatTimeRemaining = (timeInMs: number): string => {
  if (timeInMs <= 0) return '0T 00:00:00';
  
  const days = Math.floor(timeInMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeInMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeInMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeInMs % (1000 * 60)) / 1000);
  
  return `${days}T ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};