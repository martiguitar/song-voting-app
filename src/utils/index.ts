export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('de-DE', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

export const formatTimeRemaining = (timeInMs: number): string => {
  if (timeInMs <= 0) return '0T 00:00:00';

  const days = Math.floor(timeInMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeInMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeInMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeInMs % (1000 * 60)) / 1000);

  return `${days}T ${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export const getNextSessionDate = (): Date => {
  const now = new Date();
  const day = now.getDay(); // 0 = So, 6 = Sa
  const daysUntilSaturday = (6 - day + 7) % 7;
  const session = new Date(now);
  session.setDate(now.getDate() + daysUntilSaturday);
  session.setHours(18, 0, 0, 0);
  return session;
};

export const getNextVotingStart = (): Date => {
  const now = new Date();
  const day = now.getDay(); // 0 = Sonntag
  const daysUntilNextSunday = (7 - day) % 7;
  const sunday = new Date(now);
  sunday.setDate(now.getDate() + daysUntilNextSunday);
  sunday.setHours(10, 0, 0, 0);
  return sunday;
};

export const getVotingEndTime = (): Date => {
  const now = new Date();
  const day = now.getDay(); // 5 = Freitag
  const daysUntilNextFriday = (5 - day + 7) % 7;
  const friday = new Date(now);
  friday.setDate(now.getDate() + daysUntilNextFriday);
  friday.setHours(18, 0, 0, 0);
  return friday;
};

export const isVotingAllowed = (): boolean => {
  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sunday, 5 = Friday
  const currentHour = now.getHours();

  // If it's Sunday (0), only allow after 10:00
  if (currentDay === 0) {
    return currentHour >= 10;
  }

  // If it's Friday (5), only allow before 18:00
  if (currentDay === 5) {
    return currentHour < 18;
  }

  // Allow Monday (1) through Thursday (4)
  return currentDay >= 1 && currentDay <= 4;
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