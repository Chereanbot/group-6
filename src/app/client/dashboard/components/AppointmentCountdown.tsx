import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineClock } from 'react-icons/hi';

interface CountdownProps {
  targetDate: string;
  title: string;
  description: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const AppointmentCountdown = ({ targetDate, title, description }: CountdownProps) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(targetDate) - +new Date();
      let timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };

      if (difference > 0) {
        timeLeft = {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        };
      }

      return timeLeft;
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const timeBlocks = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Minutes', value: timeLeft.minutes },
    { label: 'Seconds', value: timeLeft.seconds }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700"
    >
      <div className="flex items-center gap-2 mb-4">
        <HiOutlineClock className="w-6 h-6 text-primary-500" />
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        {description}
      </p>

      <div className="grid grid-cols-4 gap-2">
        {timeBlocks.map((block) => (
          <div
            key={block.label}
            className="flex flex-col items-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
          >
            <motion.span
              key={block.value}
              initial={{ scale: 1.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-2xl font-bold text-primary-500"
            >
              {block.value.toString().padStart(2, '0')}
            </motion.span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {block.label}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}; 