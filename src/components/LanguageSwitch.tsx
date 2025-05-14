import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Languages } from 'lucide-react';

const LanguageSwitch: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <button
      onClick={() => setLanguage(language === 'en' ? 'de' : 'en')}
      className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-400 transition-colors rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-700"
      aria-label="Switch language"
    >
      <Languages size={16} />
      <span className="font-medium">{language.toUpperCase()}</span>
    </button>
  );
}

export default LanguageSwitch;