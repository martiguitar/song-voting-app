import React, { createContext, useContext, useState } from 'react';

type Language = 'en' | 'de';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    'app.title': 'ton.band',
    'app.subtitle': 'Vote for your favorite covers - top 3 will be played!',
    'app.footer': 'Cover Song Voting App',
    'app.nextSession': 'Next Session:',
    'nav.current': 'Current Session',
    'nav.allSongs': 'All Songs',
    'nav.setup': 'Settings',
    'songs.suggest': 'Suggest a Cover Song',
    'songs.title': 'Song Title',
    'songs.artist': 'Artist',
    'songs.submitter': 'Your Name',
    'songs.enterTitle': 'Enter song title',
    'songs.enterArtist': 'Enter artist name',
    'songs.enterSubmitter': 'Enter your name',
    'songs.submit': 'Submit',
    'songs.cancel': 'Cancel',
    'songs.error': 'Please fill in all required fields',
    'songs.top': 'Top 3 Songs',
    'songs.willBePlayed': 'These songs will be played at the next session!',
    'songs.all': 'All Suggestions',
    'songs.count': 'songs',
    'songs.search': 'Search songs or artists...',
    'songs.noResults': 'No songs match your search',
    'songs.noSongs': 'No songs have been suggested yet',
    'songs.random': 'Random Song',
    'songs.pickRandom': 'Pick Random Song',
    'songs.links': 'Links',
    'songs.addLink': 'Add Link',
    'songs.linkUrl': 'URL (Sheets, Spotify, YouTube, etc.)',
    'songs.linkDesc': 'Short description (e.g., "Guitar tabs", "Spotify", "Tutorial")',
    'songs.details': 'Song Details',
    'songs.addedOn': 'Added on',
    'songs.sessionDate': 'Session date',
    'songs.votes': 'Votes',
    'songs.upvote': 'Upvote',
    'songs.downvote': 'Downvote',
    'songs.undoVote': 'Undo vote',
    'songs.block': 'Block song',
    'songs.unblock': 'Unblock song',
    'songs.blocked': 'Song is blocked',
    'songs.remove': 'Remove song',
    'songs.password': 'Password',
    'songs.confirm': 'Confirm',
    'songs.deleteTitle': 'Delete Song',
    'songs.deleteMessage': 'Are you sure you want to delete "{title}" by {artist}?',
    'allSongs.title': 'All Songs Ever',
    'allSongs.total': 'Total songs:',
    'voting.endsIn': 'Voting ends in:',
    'voting.nextStart': 'Next voting starts on',
    'setup.title': 'Administration',
    'setup.password': 'Admin Password',
    'setup.unlock': 'Unlock Admin Area',
    'setup.resetVotes': 'Reset All Votes',
    'setup.resetVotesDesc': 'This will reset all votes to zero. This action cannot be undone.',
    'setup.resetButton': 'Reset Votes',
    'setup.resetting': 'Resetting...',
    'setup.confirm': 'Confirm',
    'setup.cancel': 'Cancel',
    'setup.lock': 'Lock Admin Area',
    'setup.manageSongs': 'Manage Songs',
    'setup.manageSongsDesc': 'Block or unblock songs from voting. Blocked songs will be automatically unblocked after 4 weeks.',
  },
  de: {
    'app.title': 'ton.band',
    'app.subtitle': 'Stimme für deine Lieblings-Covers ab - die Top 3 werden gespielt!',
    'app.footer': 'Cover Song Voting App',
    'app.nextSession': 'Nächste Session:',
    'nav.current': 'Aktuelle Session',
    'nav.allSongs': 'Alle Songs',
    'nav.setup': 'Administration',
    'songs.suggest': 'Cover Song vorschlagen',
    'songs.title': 'Songtitel',
    'songs.artist': 'Künstler',
    'songs.submitter': 'Dein Name',
    'songs.enterTitle': 'Songtitel eingeben',
    'songs.enterArtist': 'Künstlername eingeben',
    'songs.enterSubmitter': 'Deinen Namen eingeben',
    'songs.submit': 'Absenden',
    'songs.cancel': 'Abbrechen',
    'songs.error': 'Bitte fülle alle Pflichtfelder aus',
    'songs.top': 'Top 3 Songs',
    'songs.willBePlayed': 'Diese Songs werden in der nächsten Session gespielt!',
    'songs.all': 'Alle Vorschläge',
    'songs.count': 'Songs',
    'songs.search': 'Songs oder Künstler suchen...',
    'songs.noResults': 'Keine Songs entsprechen deiner Suche',
    'songs.noSongs': 'Es wurden noch keine Songs vorgeschlagen',
    'songs.random': 'Zufälliger Song',
    'songs.pickRandom': 'Zufälligen Song wählen',
    'songs.links': 'Links',
    'songs.addLink': 'Link hinzufügen',
    'songs.linkUrl': 'URL (Noten, Spotify, YouTube, etc.)',
    'songs.linkDesc': 'Kurze Beschreibung (z.B. "Gitarren-Tabs", "Spotify", "Tutorial")',
    'songs.details': 'Song Details',
    'songs.addedOn': 'Hinzugefügt am',
    'songs.sessionDate': 'Session Datum',
    'songs.votes': 'Stimmen',
    'songs.upvote': 'Upvote',
    'songs.downvote': 'Downvote',
    'songs.undoVote': 'Abstimmung zurückziehen',
    'songs.block': 'Song sperren',
    'songs.unblock': 'Sperrung aufheben',
    'songs.blocked': 'Song ist gesperrt',
    'songs.remove': 'Song entfernen',
    'songs.password': 'Admin-Passwort',
    'songs.confirm': 'Bestätigen',
    'songs.deleteTitle': 'Song löschen',
    'songs.deleteMessage': 'Möchtest du "{title}" von {artist} wirklich löschen?',
    'allSongs.title': 'Alle Songs',
    'allSongs.total': 'Gesamt:',
    'voting.endsIn': 'Abstimmung endet in:',
    'voting.nextStart': 'Nächste Abstimmung startet am',
    'setup.title': 'Administration',
    'setup.password': 'Admin-Passwort',
    'setup.unlock': 'Admin-Bereich entsperren',
    'setup.resetVotes': 'Alle Stimmen zurücksetzen',
    'setup.resetVotesDesc': 'Dies setzt alle Stimmen auf Null zurück. Diese Aktion kann nicht rückgängig gemacht werden.',
    'setup.resetButton': 'Stimmen zurücksetzen',
    'setup.resetting': 'Wird zurückgesetzt...',
    'setup.confirm': 'Bestätigen',
    'setup.cancel': 'Abbrechen',
    'setup.lock': 'Admin-Bereich sperren',
    'setup.manageSongs': 'Songs verwalten',
    'setup.manageSongsDesc': 'Sperre oder entsperre Songs für die Abstimmung. Gesperrte Songs werden nach 4 Wochen automatisch entsperrt.',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('de');

  const t = (key: string, params?: Record<string, string>): string => {
    let text = translations[language][key as keyof typeof translations['en']] || key;
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        text = text.replace(`{${key}}`, value);
      });
    }
    
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};