'use client'

import { useState, useEffect } from 'react';
import { WelcomeModal } from './WelcomeModal';
import { WelcomeTour } from './WelcomeTour';
import { PersistentTourButton } from './PersistentTourButton';
import { TourProgress } from './TourProgress';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface Props {
  lawyerName: string;
}

export function WelcomeWrapper({ lawyerName }: Props) {
  const [hasSeenWelcome, setHasSeenWelcome] = useLocalStorage('hasSeenLawyerWelcome', false);
  const [hasSeenTour, setHasSeenTour] = useLocalStorage('hasSeenLawyerTour', false);
  const [showModal, setShowModal] = useState(true);
  const [showTour, setShowTour] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Show modal only if user hasn't seen it before
    if (hasSeenWelcome) {
      setShowModal(false);
    }
  }, [hasSeenWelcome]);

  useEffect(() => {
    const handleTourStart = () => {
      setShowModal(false);
      setShowTour(true);
      setShowProgress(true);
    };

    const handleTourEnd = () => {
      setShowTour(false);
      setShowProgress(false);
      setHasSeenTour(true);
    };

    window.addEventListener('startTour', handleTourStart);
    window.addEventListener('tourEnd', handleTourEnd);

    return () => {
      window.removeEventListener('startTour', handleTourStart);
      window.removeEventListener('tourEnd', handleTourEnd);
    };
  }, [setHasSeenTour]);

  const handleStartTour = () => {
    setHasSeenWelcome(true);
    window.dispatchEvent(new Event('startTour'));
  };

  const handleCloseModal = () => {
    setHasSeenWelcome(true);
    setShowModal(false);
  };

  if (!isMounted) return null;

  return (
    <>
      <WelcomeModal 
        lawyerName={lawyerName}
        onStartTour={handleStartTour}
        onClose={handleCloseModal}
        isOpen={showModal}
      />
      {showTour && <WelcomeTour />}
      {!showTour && !showModal && !hasSeenTour && <PersistentTourButton />}
      {showProgress && <TourProgress />}
    </>
  );
} 