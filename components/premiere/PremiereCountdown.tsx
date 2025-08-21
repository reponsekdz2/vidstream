import React, { useState, useEffect } from 'react';
import { differenceInSeconds, formatDuration, intervalToDuration } from 'date-fns';

interface PremiereCountdownProps {
  premiereTime: string;
}

const PremiereCountdown: React.FC<PremiereCountdownProps> = ({ premiereTime }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const premiereDate = new Date(premiereTime);
      const now = new Date();
      const secondsRemaining = differenceInSeconds(premiereDate, now);

      if (secondsRemaining <= 0) {
        setTimeLeft('Premiering now!');
        clearInterval(interval);
        // Here you might want to trigger a reload or state change in the parent
        return;
      }

      const duration = intervalToDuration({ start: 0, end: secondsRemaining * 1000 });
      setTimeLeft(formatDuration(duration, { format: ['days', 'hours', 'minutes', 'seconds'] }));
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [premiereTime]);

  return (
    <div className="w-full h-full bg-black text-white flex flex-col items-center justify-center">
      <h2 className="text-3xl font-bold text-brand-red">PREMIERE</h2>
      <p className="mt-2 text-lg">Starts in</p>
      <p className="text-5xl font-mono font-bold mt-4 tracking-wider">
        {timeLeft}
      </p>
    </div>
  );
};

export default PremiereCountdown;