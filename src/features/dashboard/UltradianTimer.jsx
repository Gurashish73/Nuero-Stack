import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Brain } from 'lucide-react';
import { useSelector } from 'react-redux';
import { awardNeuralPower } from '../../utils/scoring'; 

export default function UltradianTimer() {
  const INITIAL_TIME = 5400; // 90 Minutes
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);
  const [isActive, setIsActive] = useState(false);

  const currentUser = useSelector(state => state.auth?.user);

  useEffect(() => {
    const savedEndTime = localStorage.getItem('ultradian_end_time');
    const savedIsActive = localStorage.getItem('ultradian_is_active') === 'true';
    const savedTimeLeft = localStorage.getItem('ultradian_time_left');

    if (savedIsActive && savedEndTime) {
      const now = Date.now();
      const remaining = Math.floor((parseInt(savedEndTime) - now) / 1000);
      
      if (remaining > 0) {
        setTimeLeft(remaining);
        setIsActive(true);
      } else {
        setTimeLeft(0);
        setIsActive(false);
        localStorage.removeItem('ultradian_end_time');
        localStorage.removeItem('ultradian_is_active');
      }
    } else if (savedTimeLeft) {
      setTimeLeft(parseInt(savedTimeLeft));
    }

    const handleAutoStart = () => {
      setTimeLeft(INITIAL_TIME);
      setIsActive(true);
      
      const endTime = Date.now() + (INITIAL_TIME * 1000);
      localStorage.setItem('ultradian_end_time', endTime.toString());
      localStorage.setItem('ultradian_is_active', 'true');
    };

    window.addEventListener('START_ULTRADIAN_TIMER', handleAutoStart);
    return () => window.removeEventListener('START_ULTRADIAN_TIMER', handleAutoStart);
  }, []);

  useEffect(() => {
    let interval = null;
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => {
          const newTime = time - 1;
          localStorage.setItem('ultradian_time_left', newTime.toString());
          return newTime;
        });
      }, 1000);
    } else if (isActive && timeLeft <= 0) {
      setIsActive(false);
      setTimeLeft(0);
      clearInterval(interval);
      
      localStorage.removeItem('ultradian_end_time');
      localStorage.removeItem('ultradian_is_active');
      localStorage.setItem('ultradian_time_left', '0');
      
      // INJECT 50 POINTS
      if (currentUser?.uid) {
        awardNeuralPower('ultradian_sprint'); // NEW: Backend action routing
      }

      if (Notification.permission === "granted") {
        new Notification("Sprint Complete", {
          body: "90-Minute Ultradian Cycle finished. Initiate 20-minute decompression protocol.",
          icon: "/favicon.ico"
        });
      }
    }
    
    return () => clearInterval(interval);
  }, [isActive, timeLeft, currentUser?.uid]);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    if (!isActive && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
    
    const newActiveState = !isActive;
    setIsActive(newActiveState);
    localStorage.setItem('ultradian_is_active', newActiveState.toString());
    
    if (newActiveState) {
      const endTime = Date.now() + (timeLeft * 1000);
      localStorage.setItem('ultradian_end_time', endTime.toString());
    } else {
      localStorage.setItem('ultradian_time_left', timeLeft.toString());
    }
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(INITIAL_TIME);
    
    localStorage.removeItem('ultradian_end_time');
    localStorage.removeItem('ultradian_is_active');
    localStorage.setItem('ultradian_time_left', INITIAL_TIME.toString());
  };

  return (
    <div className="bg-[#111113] border border-gray-800 rounded-3xl p-6 shadow-xl h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-blue-600 to-purple-600"></div>
      <div className="flex flex-col items-center justify-center flex-1 py-4">
        <Brain className="w-8 h-8 text-blue-500 mb-4" />
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Ultradian Focus</h3>
        <div className="text-6xl font-black text-white tracking-tighter mb-8 font-mono shadow-sm">
          {formatTime(timeLeft)}
        </div>
        <div className="flex items-center gap-3 w-full">
          <button onClick={toggleTimer} className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-black uppercase tracking-widest transition-all ${isActive ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-white text-black hover:bg-gray-200 shadow-[0_0_30px_rgba(255,255,255,0.1)]'}`}>
            {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-black" />}
            {isActive ? 'Pause' : 'Start'}
          </button>
          <button onClick={resetTimer} className="p-4 bg-[#161618] border border-gray-800 rounded-xl text-gray-400 hover:text-white hover:border-gray-500 transition-all" title="Reset Protocol">
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}