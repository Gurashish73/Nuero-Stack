import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { showNotification } from '../features/ui/uiSlice';
import { generateContent } from '../services/gemini';

const FALLBACK_DIRECTIVES = [
  "Neuroplasticity requires deep focus followed by deep rest. Do not skip your NSDR protocol today.",
  "Trending Skill Alert: WebAssembly (Wasm) and Rust are disrupting standard web backends. Map this on your Journey.",
  "Dopamine baseline check: If you feel unmotivated, you may have spiked your dopamine too early. Embrace the boredom.",
  "Myelin sheathing occurs during sleep. The skills you practiced today will not wire into your brain until you hit deep REM.",
  "Trending Framework: React Server Components are shifting the rendering paradigm. Audit your Knowledge Vault for gaps."
];

export default function NotificationManager() {
  const dispatch = useDispatch();
  const hardware = useSelector(state => state.hardware);
  const timeline = useSelector(state => state.timeline);
  const currentUser = useSelector(state => state.auth.user);
  
  const [hasGivenDailyBriefing, setHasGivenDailyBriefing] = useState(false);
  const lastWaterCheckRef = useRef(Date.now());
  const activeTaskIdRef = useRef(null);

  useEffect(() => {
    const tick = setInterval(() => {
      const now = Date.now();
      const currentHour = new Date().getHours();

      const activeTask = timeline.schedule?.find(t => t.status === 'active');
      if (activeTask && activeTask.id !== activeTaskIdRef.current) {
        dispatch(showNotification({
          title: `Objective Update: ${activeTask.title}`,
          message: `Initiating ${activeTask.subtitle}. Enter flow state.`,
          type: 'system',
          duration: 8000
        }));
        activeTaskIdRef.current = activeTask.id;
      }

      const hoursSinceWaterCheck = (now - lastWaterCheckRef.current) / (1000 * 60 * 60);
      if (hoursSinceWaterCheck >= 2 && currentHour >= 8 && currentHour < 22) {
        if (hardware.waterIntake < 8) {
          dispatch(showNotification({
            title: "System Maintenance",
            message: "Hydration levels dropping. Consume H2O to maintain neural conductivity.",
            type: 'water',
            duration: 10000
          }));
        }
        lastWaterCheckRef.current = now;
      }
    }, 60000);

    return () => clearInterval(tick);
  }, [hardware, timeline, dispatch]);

  useEffect(() => {
    if (!currentUser || hasGivenDailyBriefing) return;

    const fetchDailyDirective = async () => {
      try {
        const todayStr = new Date().toDateString();
        const docRef = doc(db, 'users', currentUser.uid, 'system_logs', 'daily_briefing');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists() && docSnap.data().date === todayStr) {
          setHasGivenDailyBriefing(true);
          return;
        }

        const prompt = `
          Provide a single, brutal, 2-sentence notification for a highly disciplined software engineer.
          Sentence 1: Mention a highly relevant, bleeding-edge trending skill or framework in Web Dev or AI.
          Sentence 2: Give a harsh neurobiological reminder to stay disciplined today.
          Do not use quotes or pleasantries.
        `;

        let directiveText = "";
        try {
          directiveText = (await generateContent(prompt)).trim();
        } catch (apiError) {
          const randomIndex = Math.floor(Math.random() * FALLBACK_DIRECTIVES.length);
          directiveText = FALLBACK_DIRECTIVES[randomIndex];
        }

        dispatch(showNotification({
          title: "The Oracle Directive",
          message: directiveText,
          type: 'oracle',
          duration: 15000
        }));

        setHasGivenDailyBriefing(true);
        await setDoc(docRef, { date: todayStr, text: directiveText }, { merge: true });
      } catch (error) {
        console.error("Briefing System Failure:", error);
      }
    };

    const timer = setTimeout(() => fetchDailyDirective(), 5000);
    return () => clearTimeout(timer);
  }, [currentUser, hasGivenDailyBriefing, dispatch]);

  return null;
}