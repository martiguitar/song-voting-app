import React, { useState } from 'react';
import { Github, Heart } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const Footer = () => {
  const { t } = useLanguage();
  const [showImprint, setShowImprint] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  return (
    <>
      <footer className="bg-black/30 backdrop-blur-sm py-6 border-t border-primary-500/20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-neutral-400 text-sm flex items-center">
              <span>Made with</span>
              <Heart size={16} className="text-pink-500 mx-1" />
              <span>for ton.band sessions</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-sm">
              <button
                onClick={() => setShowImprint(true)}
                className="text-neutral-400 hover:text-primary-400 transition-colors"
              >
                {t('footer.imprint')}
              </button>
              <span className="text-neutral-600">•</span>
              <button
                onClick={() => setShowPrivacy(true)}
                className="text-neutral-400 hover:text-primary-400 transition-colors"
              >
                {t('footer.privacy')}
              </button>
              <span className="text-neutral-600 hidden sm:inline">•</span>
              <a
                href="#"
                className="text-neutral-400 hover:text-primary-400 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github size={20} />
              </a>
              <span className="text-neutral-400">2025</span>
            </div>
          </div>
        </div>
      </footer>

      {showImprint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/80 backdrop-blur-sm p-4">
          <div className="bg-neutral-800 rounded-lg shadow-xl border border-primary-500/20 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-neutral-800 border-b border-primary-500/20 p-6">
              <h2 className="text-2xl font-semibold text-primary-300">{t('footer.imprint')}</h2>
            </div>
            <div className="p-6 space-y-4 text-neutral-300">
              <div>
                <h3 className="text-lg font-semibold text-neutral-100 mb-2">{t('footer.responsible')}</h3>
                <p>ton.band</p>
                <p>Angaben gemäß § 5 TMG</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-neutral-100 mb-2">{t('footer.contact')}</h3>
                <p>E-Mail: info@ton.band</p>
              </div>
            </div>
            <div className="sticky bottom-0 bg-neutral-800 border-t border-primary-500/20 p-6">
              <button
                onClick={() => setShowImprint(false)}
                className="w-full px-4 py-2 bg-primary-500 text-neutral-900 font-medium rounded-md hover:bg-primary-600 transition-colors"
              >
                {t('songs.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {showPrivacy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/80 backdrop-blur-sm p-4">
          <div className="bg-neutral-800 rounded-lg shadow-xl border border-primary-500/20 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-neutral-800 border-b border-primary-500/20 p-6">
              <h2 className="text-2xl font-semibold text-primary-300">{t('footer.privacy')}</h2>
            </div>
            <div className="p-6 space-y-4 text-neutral-300">
              <div>
                <h3 className="text-lg font-semibold text-neutral-100 mb-2">{t('footer.dataCollection')}</h3>
                <p className="mb-2">{t('footer.dataCollectionText')}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-neutral-100 mb-2">{t('footer.localStorage')}</h3>
                <p className="mb-2">{t('footer.localStorageText')}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-neutral-100 mb-2">{t('footer.cookies')}</h3>
                <p className="mb-2">{t('footer.cookiesText')}</p>
              </div>
            </div>
            <div className="sticky bottom-0 bg-neutral-800 border-t border-primary-500/20 p-6">
              <button
                onClick={() => setShowPrivacy(false)}
                className="w-full px-4 py-2 bg-primary-500 text-neutral-900 font-medium rounded-md hover:bg-primary-600 transition-colors"
              >
                {t('songs.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Footer;