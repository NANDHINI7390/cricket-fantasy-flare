
import { useState, useEffect } from 'react';

type CountdownValues = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
};

export const useCountdown = (targetDateStr: string): CountdownValues => {
  const calculateTimeLeft = (): CountdownValues => {
    try {
      const targetDate = new Date(targetDateStr);
      const now = new Date();
      
      // Calculate the time difference in milliseconds
      const difference = targetDate.getTime() - now.getTime();
      
      // Check if the difference is less than 0 (i.e., the date has passed)
      if (difference <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
      }
      
      // Calculate days, hours, minutes, and seconds
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      
      return { days, hours, minutes, seconds, isExpired: false };
    } catch (error) {
      console.error("Error calculating countdown:", error);
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
    }
  };

  // State to store the countdown values
  const [timeLeft, setTimeLeft] = useState<CountdownValues>(calculateTimeLeft());
  
  useEffect(() => {
    // Update the countdown every second
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    
    // Cleanup function to clear the interval when the component unmounts
    return () => clearInterval(timer);
  }, [targetDateStr]);
  
  return timeLeft;
};
