import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { saveDailySnapshot } from '../features/oracle/oracleSlice';
import { resetDailyHardware } from '../features/hardwareLog/hardwareSlice';
import { incrementStreak, updateLastActiveDate } from '../features/dashboard/streakSlice';

export default function DayCycleEngine() {
  const dispatch = useDispatch();
  
  const hardware = useSelector(state => state.hardware);
  const lastActiveDate = useSelector(state => state.streak?.lastActiveDate);

  useEffect(() => {
    // This function checks the date
    const performDateCheck = () => {
      const today = new Date().toDateString();

      if (!lastActiveDate) {
        dispatch(updateLastActiveDate(today));
        return;
      }

      if (lastActiveDate !== today) {
        console.log("⚡ MIDNIGHT PROTOCOL INITIATED. Archiving and resetting OS.");

        const snapshot = {
          date: lastActiveDate,
          hardwareStats: { ...hardware } 
        };
        dispatch(saveDailySnapshot(snapshot));

        //Reset all trackers back to zero
        dispatch(resetDailyHardware());

        // Increase the limitless streak by 1
        dispatch(incrementStreak());

        //Update
        dispatch(updateLastActiveDate(today));
      }
    };

    performDateCheck();
    
    const interval = setInterval(performDateCheck, 60000); 
    
    return () => clearInterval(interval);
  }, [dispatch, hardware, lastActiveDate]);

  return null;
}