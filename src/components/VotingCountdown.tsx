import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Timer } from 'lucide-react';
import {
  formatTimeRemaining,
  getVotingEndTime,
  isVotingAllowed,
} from '../utils';

interface VotingCountdownProps {
  nextVotingStart: Date;
}

const VotingCountdown: React.FC<VotingCountdownProps> = ({ nextVotingStart }) => {
  const { t } = useLanguage();
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isVotingClosed, setIsVotingClosed] = useState<boolean>(false);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();

      if (!isVotingAllowed()) {
        setIsVotingClosed(true);
        setTimeRemaining(0);
        return;
      }

      const endTime = getVotingEndTime();
      const timeDiff = endTime.getTime() - now.getTime();

      if (timeDiff <= 0) {
        setTimeRemaining(0);
        setIsVotingClosed(true);
      } else {
        setTimeRemaining(timeDiff);
        setIsVotingClosed(false);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center gap-2 py-2 text-xs sm:text-sm text-neutral-400 border-t border-primary-500/20 mt-4 font-medium">
      <Timer size={14} className="text-primary-300 sm:w-4 sm:h-4" />
      {isVotingClosed ? (
        <p className="text-center">
          {t('voting.nextStart')} {nextVotingStart.toLocaleDateString('de-DE')} um{' '}
          {nextVotingStart.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr
        </p>
      ) : (
        <div className="flex items-center gap-1">
          <span>{t('voting.endsIn')}</span>
          <span className="font-mono font-normal bg-primary-500/10 px-2 py-1 rounded text-xs sm:text-sm text-primary-300">
            {formatTimeRemaining(timeRemaining)}
          </span>
        </div>
      )}
    </div>
  );
};

export default VotingCountdown;