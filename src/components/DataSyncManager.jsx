import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase'; 
import { setUser, setLoadingComplete } from '../features/auth/authSlice';

import { hydrateHardware } from '../features/hardwareLog/hardwareSlice';
import { hydrateVault } from '../features/vault/vaultSlice';
import { hydrateJourney } from '../features/journey/journeySlice';
import { hydrateStreak } from '../features/dashboard/streakSlice'; 
import { hydrateTimeline } from '../features/dashboard/timelineSlice';

//FACTORY DEFAULTS 
const FACTORY_HARDWARE = { sleepHours: 7, waterIntake: 0, exercised: false, dietLogged: false, caffeineLogs: [], quickDrinks: [ { id: 'default-1', name: 'Espresso', amount: 64 }, { id: 'default-2', name: 'Filter', amount: 95 }, { id: 'default-3', name: 'Pre-Wk', amount: 200 } ] };
const FACTORY_VAULT = { cards: [] };
const FACTORY_JOURNEY = { nodes: [], crossTrainingActive: false, crossTrainingMessage: '' };
const FACTORY_STREAK = { mindProgress: 0, bodyProgress: 0, journeyProgress: 0, currentStreak: 1, limitlessLevel: 1, shieldActive: false };
const FACTORY_TIMELINE = {
  schedule: [
    { id: 1, time: '8:00 AM', title: 'Aerobic BDNF Spike', subtitle: 'Hardware Maintained', status: 'upcoming', dotColor: 'bg-gray-800' },
    { id: 2, time: '10:00 AM', title: '90-Min Deep Focus', subtitle: 'Career Journey Integration', status: 'upcoming', dotColor: 'bg-gray-800' },
    { id: 3, time: '2:00 PM', title: 'Neuro-Gym', subtitle: 'Dual N-Back Session', status: 'upcoming', dotColor: 'bg-gray-800' },
    { id: 4, time: '6:00 PM', title: 'Hemisphere Switch', subtitle: 'Creative task (Music/Art)', status: 'upcoming', dotColor: 'bg-gray-800' }
  ]
};

export default function DataSyncManager({ children }) {
  const dispatch = useDispatch();
  const store = useStore();
  const user = useSelector(state => state.auth.user);
  const isInitializing = useSelector(state => state.auth.isInitializing);
  
  const saveTimeoutRef = useRef(null);
  const isHydratingRef = useRef(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        dispatch(setUser({ 
          uid: currentUser.uid, 
          email: currentUser.email, 
          name: currentUser.displayName 
        }));
        
        isHydratingRef.current = true; 

        try {
          const docRef = doc(db, 'users', currentUser.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            
            // MIDNIGHT RESET ENGINE
            const today = new Date();
            const todayStr = today.toDateString(); 
            const lastLoginStr = data.lastLoginDate || "";

            if (todayStr !== lastLoginStr) {
              console.log("New Day Detected! Initiating Daily Protocol Reset...");
              
              if (lastLoginStr) {
                const lastLoginDate = new Date(lastLoginStr);
                const diffTime = Math.abs(today - lastLoginDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                if (diffDays === 1) {
                  if (data.streak) data.streak.currentStreak += 1;
                } else {
                  if (data.streak) data.streak.currentStreak = 1;
                }
              } else {
                if (data.streak) data.streak.currentStreak = 1;
              }

              if (data.hardware) {
                data.hardware.waterIntake = 0;
                data.hardware.exercised = false;
                data.hardware.dietLogged = false;
                data.hardware.sleepHours = 0;
                
                if (data.hardware.caffeineLogs) {
                   const oneDayAgo = Date.now() - 86400000;
                   data.hardware.caffeineLogs = data.hardware.caffeineLogs.filter(log => log.timestamp > oneDayAgo);
                }
              }

              if (data.timeline && data.timeline.schedule) {
                data.timeline.schedule.forEach(task => {
                  task.status = 'upcoming';
                  task.dotColor = 'bg-gray-800';
                });
              }

              if (data.streak) {
                data.streak.mindProgress = 0;
                data.streak.bodyProgress = 0;
                data.streak.journeyProgress = 0;
              }

              data.lastLoginDate = todayStr;
              await setDoc(docRef, data, { merge: true });
            }
            
            if (data.hardware) dispatch(hydrateHardware(data.hardware));
            if (data.vault) dispatch(hydrateVault(data.vault));
            if (data.journey) dispatch(hydrateJourney(data.journey));
            if (data.streak) dispatch(hydrateStreak(data.streak));
            if (data.timeline) dispatch(hydrateTimeline(data.timeline));
            
          } else {
            const baseData = {
              name: currentUser.displayName || "Operator",
              email: currentUser.email,
              lastLoginDate: new Date().toDateString(),
              hardware: FACTORY_HARDWARE,
              vault: FACTORY_VAULT,
              journey: FACTORY_JOURNEY,
              streak: FACTORY_STREAK,
              timeline: FACTORY_TIMELINE
            };
            
            await setDoc(docRef, baseData, { merge: true });
            
            dispatch(hydrateHardware(FACTORY_HARDWARE));
            dispatch(hydrateVault(FACTORY_VAULT));
            dispatch(hydrateJourney(FACTORY_JOURNEY));
            dispatch(hydrateStreak(FACTORY_STREAK));
            dispatch(hydrateTimeline(FACTORY_TIMELINE));
          }
        } catch (error) {
          console.error("Hydration Error:", error);
        } finally {
          isHydratingRef.current = false; 
        }
      } else {
        dispatch(hydrateHardware(FACTORY_HARDWARE));
        dispatch(hydrateVault(FACTORY_VAULT));
        dispatch(hydrateJourney(FACTORY_JOURNEY));
        dispatch(hydrateStreak({ ...FACTORY_STREAK, currentStreak: 0 })); 
        dispatch(hydrateTimeline(FACTORY_TIMELINE));
        
        dispatch(setUser(null));
        dispatch(setLoadingComplete());
      }
    });

    return () => unsubscribe();
  }, [dispatch, store]);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = store.subscribe(() => {
      if (isHydratingRef.current) return; 

      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      
      saveTimeoutRef.current = setTimeout(async () => {
        try {
          const state = store.getState();
          
          if (!auth.currentUser || auth.currentUser.uid !== state.auth.user?.uid) {
            return; 
          }

          const dataToSave = {
            name: state.auth.user.name,                     
            email: state.auth.user.email,                   
            lastLoginDate: new Date().toDateString(),
            hardware: state.hardware,
            vault: state.vault,
            journey: state.journey,
            streak: state.streak,
            timeline: state.timeline
          };
          
          await setDoc(doc(db, 'users', auth.currentUser.uid), dataToSave, { merge: true });
          
          await setDoc(doc(db, 'directory', auth.currentUser.uid), {
            name: state.auth.user.name || "Operator",
            uid: auth.currentUser.uid
          }, { merge: true });

          console.log("OS State Synced to Matrix.");
        } catch (error) {
          console.error("Sync Error:", error);
        }
      }, 2000); 
    });

    return () => {
      unsubscribe();
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [user, store]);

  if (isInitializing) {
    return (
      <div className="h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-white">
        <div className="flex gap-2 animate-pulse mb-4">
          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
          <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
          <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
        </div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest font-mono">Decrypting Neural Link...</p>
      </div>
    );
  }

  return children;
}