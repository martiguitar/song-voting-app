import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Calendar, Library, Settings, Menu, X } from 'lucide-react';
import Logo from './Logo';

interface NavigationProps {
  currentView: 'current' | 'allSongs' | 'setup';
  onViewChange: (view: 'current' | 'allSongs' | 'setup') => void;
  isHeaderCollapsed: boolean;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, onViewChange, isHeaderCollapsed }) => {
  const { t, language, setLanguage } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="container mx-auto px-4">
      <div className="flex flex-col gap-2 sm:gap-6">
        <div className="flex flex-col sm:flex-col items-center gap-2 sm:gap-6">
          <div className="w-full flex items-center justify-between sm:justify-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 sm:hidden text-neutral-400 hover:text-primary-300 transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
              isHeaderCollapsed ? 'max-h-0 opacity-0 scale-95' : 'max-h-48 opacity-100 scale-100'
            }`}>
              <Logo />
            </div>

            <div className="w-10 sm:hidden" /> {/* Spacer for symmetry */}
          </div>
          
          {/* Mobile Menu */}
          <div className={`w-full sm:hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
          }`}>
            <nav className="flex flex-col gap-2 p-4 bg-neutral-800/30 backdrop-blur-sm rounded-xl border border-primary-500/10">
              <button
                onClick={() => {
                  onViewChange('current');
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  currentView === 'current'
                    ? 'bg-primary-500/20 text-primary-300'
                    : 'text-neutral-400 hover:text-primary-300 hover:bg-primary-500/10'
                }`}
              >
                <Calendar size={18} className="flex-shrink-0" />
                <span>{t('nav.current')}</span>
              </button>
              
              <button
                onClick={() => {
                  onViewChange('allSongs');
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  currentView === 'allSongs'
                    ? 'bg-primary-500/20 text-primary-300'
                    : 'text-neutral-400 hover:text-primary-300 hover:bg-primary-500/10'
                }`}
              >
                <Library size={18} className="flex-shrink-0" />
                <span>{t('nav.allSongs')}</span>
              </button>

              <div className="w-full h-px bg-primary-500/10 my-1"></div>

              <button
                onClick={() => {
                  onViewChange('setup');
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  currentView === 'setup'
                    ? 'bg-primary-500/20 text-primary-300'
                    : 'text-neutral-400 hover:text-primary-300 hover:bg-primary-500/10'
                }`}
              >
                <Settings size={18} className="flex-shrink-0" />
                <span>{t('nav.setup')}</span>
              </button>

              <button
                onClick={() => {
                  setLanguage(language === 'en' ? 'de' : 'en');
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg text-neutral-400 hover:text-primary-300 hover:bg-primary-500/10 transition-all duration-200"
              >
                <span>{language.toUpperCase()}</span>
              </button>
            </nav>
          </div>

          {/* Desktop Menu */}
          <nav className="hidden sm:flex items-center">
            <div className="flex items-center gap-2 p-1 bg-neutral-800/30 backdrop-blur-sm rounded-xl border border-primary-500/10">
              <button
                onClick={() => onViewChange('current')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  currentView === 'current'
                    ? 'bg-primary-500/20 text-primary-300'
                    : 'text-neutral-400 hover:text-primary-300 hover:bg-primary-500/10'
                }`}
              >
                <Calendar size={18} className="flex-shrink-0" />
                <span>{t('nav.current')}</span>
              </button>
              
              <button
                onClick={() => onViewChange('allSongs')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  currentView === 'allSongs'
                    ? 'bg-primary-500/20 text-primary-300'
                    : 'text-neutral-400 hover:text-primary-300 hover:bg-primary-500/10'
                }`}
              >
                <Library size={18} className="flex-shrink-0" />
                <span>{t('nav.allSongs')}</span>
              </button>

              <div className="flex items-center gap-2">
                <div className="w-px h-8 bg-primary-500/10"></div>
                
                <button
                  onClick={() => onViewChange('setup')}
                  className={`p-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    currentView === 'setup'
                      ? 'bg-primary-500/20 text-primary-300'
                      : 'text-neutral-400 hover:text-primary-300 hover:bg-primary-500/10'
                  }`}
                >
                  <Settings size={18} />
                </button>

                <button
                  onClick={() => setLanguage(language === 'en' ? 'de' : 'en')}
                  className="px-3 py-1.5 text-sm font-medium rounded-lg text-neutral-400 hover:text-primary-300 hover:bg-primary-500/10 transition-all duration-200"
                >
                  {language.toUpperCase()}
                </button>
              </div>
            </div>
          </nav>
        </div>

        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
          isHeaderCollapsed ? 'max-h-0 opacity-0 scale-95' : 'max-h-20 opacity-100 scale-100'
        }`}>
          <p className="text-center text-sm sm:text-base text-neutral-400 font-medium">
            {t('app.subtitle')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Navigation;