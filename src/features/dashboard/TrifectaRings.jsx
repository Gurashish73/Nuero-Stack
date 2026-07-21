import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Brain, Activity, Map as MapIcon, Flame } from 'lucide-react';
import { awardNeuralPower } from '../../utils/scoring';

const ProgressRing = ({ radius, stroke, progress, colorClass, icon: Icon, title, subtitle }) => {
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center p-4 bg-[#0f0f11] rounded-2xl border border-gray-800/50 relative group transition-all hover:border-gray-700">
      <div className="relative flex items-center justify-center mb-3">
        <svg height={radius * 2} width={radius * 2} className="-rotate-90">
          <circle stroke="#1f2937" fill="transparent" strokeWidth={stroke} r={normalizedRadius} cx={radius} cy={radius} />
          <circle
            className={`transition-all duration-1000 ease-out ${colorClass}`}
            stroke="currentColor" fill="transparent" strokeWidth={stroke}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset }} strokeLinecap="round"
            r={normalizedRadius} cx={radius} cy={radius}
          />
        </svg>
        <div className="absolute flex items-center justify-center">
          <Icon className={`w-6 h-6 ${colorClass.replace('stroke-', 'text-')}`} />
        </div>
      </div>
      
      <span className="font-bold text-lg text-white">{title}</span>
      <span className="text-xs text-gray-500 mt-1 uppercase tracking-widest">{subtitle}</span>
      <span className={`text-xl font-black mt-2 ${colorClass.replace('stroke-', 'text-')}`}>{progress}%</span>
    </div>
  );
};

export default function TrifectaRings() {
  const hardware = useSelector(state => state.hardware) || {};
  const timeline = useSelector(state => state.timeline) || { schedule: [] };
  const vault = useSelector(state => state.vault) || { cards: [] };
  const currentStreak = useSelector((state) => state.streak?.currentStreak) || 0;
  const currentUser = useSelector(state => state.auth?.user);

  //GLOBAL SCORE MONITOR
  
  const prevDiet = useRef(hardware.dietLogged);
  const prevGreen = useRef(hardware.greenTime);
  const prevExercise = useRef(hardware.exerciseProtocol && hardware.exerciseProtocol !== 'none');
  const prevWater = useRef(hardware.waterIntake || 0);
  
  const dueCardsCount = vault.cards?.filter(c => c.nextReview <= Date.now()).length || 0;
  const prevVaultClear = useRef(vault.cards?.length > 0 && dueCardsCount === 0);

  useEffect(() => {
    if (!currentUser?.uid) return;

    //DIET TRACKER (+15 Points)
    if (hardware.dietLogged && !prevDiet.current) { 
      awardNeuralPower('diet_log', 15); // NEW: Backend action routing
      prevDiet.current = true; 
    }
    else if (!hardware.dietLogged && prevDiet.current) { 
      awardNeuralPower('diet_log', -15); // NEW: Backend action routing
      prevDiet.current = false; 
    }

    //GREEN TIME TRACKER (+10 Points)
    if (hardware.greenTime && !prevGreen.current) { 
      awardNeuralPower('green_time', 10); // NEW: Backend action routing
      prevGreen.current = true; 
    }
    else if (!hardware.greenTime && prevGreen.current) { 
      awardNeuralPower('green_time', -10); // NEW: Backend action routing
      prevGreen.current = false; 
    }

    //EXERCISE TRACKER (+25 Points)
    const hasExercised = hardware.exerciseProtocol && hardware.exerciseProtocol !== 'none';
    if (hasExercised && !prevExercise.current) { 
      awardNeuralPower('complete_workout', 25); // NEW: Backend action routing
      prevExercise.current = true; 
    }
    else if (!hasExercised && prevExercise.current) { 
      awardNeuralPower('complete_workout', -25); // NEW: Backend action routing
      prevExercise.current = false; 
    }

    //HYDRATION TRACKER (+5 Points per glass)
    const currentWater = hardware.waterIntake || 0;
    if (currentWater > prevWater.current) {
      const diff = currentWater - prevWater.current;
      awardNeuralPower('water_drink', diff * 5); // NEW: Backend action routing
      prevWater.current = currentWater;
    } else if (currentWater < prevWater.current) {
      const diff = prevWater.current - currentWater;
      awardNeuralPower('water_drink', -(diff * 5)); // NEW: Backend action routing
      prevWater.current = currentWater;
    }

    //VAULT MASTERY TRACKER (+40 Points for reaching inbox zero)
    const isVaultClear = vault.cards?.length > 0 && dueCardsCount === 0;
    if (isVaultClear && !prevVaultClear.current) {
      awardNeuralPower('vault_mastery', 40); // NEW: Backend action routing
      prevVaultClear.current = true;
    } else if (!isVaultClear && prevVaultClear.current) {
      awardNeuralPower('vault_mastery', -40); // NEW: Backend action routing
      prevVaultClear.current = false;
    }

  }, [
    hardware.dietLogged, 
    hardware.greenTime, 
    hardware.exerciseProtocol, 
    hardware.waterIntake, 
    dueCardsCount, 
    vault.cards?.length,
    currentUser?.uid
  ]);


  //MIND SCORE (Max 100)
  const calculateMindScore = () => {
    let score = 0;
    
    // 1. Vault Mastery (40 pts)
    if (dueCardsCount === 0 && vault.cards?.length > 0) score += 40; 
    else if (vault.cards?.length > 0) score += 20; // Partial points if actively learning
    
    // 2. Neuro-Gym Protocol (30 pts): Timeline completion
    const gymTask = timeline.schedule?.find(t => t.title.toLowerCase().includes('gym'));
    if (gymTask && gymTask.status === 'completed') score += 30;

    // 3. Novelty (30 pts): 15 pts per task
    const noveltyDone = hardware.noveltyTasksCompleted || 0;
    score += (noveltyDone * 15);

    return Math.min(100, score);
  };

  //BODY SCORE (Max 100)
  const calculateBodyScore = () => {
    let score = 0;
    
    // 1. Kinetic Exercise (25 pts)
    if (hardware.exerciseProtocol && hardware.exerciseProtocol !== 'none') score += 25;
    // 2. Hydration (20 pts - 2.5 per glass, max 8)
    score += Math.min(20, (hardware.waterIntake || 0) * 2.5);
    // 3. Sleep (20 pts - optimal 7 hours)
    score += Math.min(20, ((hardware.sleepHours || 0) / 7) * 20);
    // 4. Diet (15 pts)
    if (hardware.dietLogged) score += 15;
    // 5. Environmental / Green Time (10 pts)
    if (hardware.greenTime) score += 10;

    // 6. Pharmacokinetics (10 pts), WITH TOXICITY PENALTY
    let activeCaffeine = 0;
    const now = Date.now();
    hardware.caffeineLogs?.forEach(log => {
      const elapsed = (now - log.timestamp) / (1000 * 60 * 60);
      const remaining = log.amount * Math.pow(0.5, elapsed / 5);
      if (remaining > 1) activeCaffeine += remaining;
    });

    if (activeCaffeine <= 400) {
      score += 10; // Safe zone
    } else {
      // DANGER ZONE: Actively subtracts up to 40 points from your total health score
      const excess = activeCaffeine - 400;
      const penalty = Math.min(40, Math.floor(excess / 15)); 
      score += (10 - penalty); 
    }
    
    return Math.max(0, Math.min(100, Math.round(score))); // Keeps score between 0 and 100
  };

  //JOURNEY SCORE (Max 100)
  const calculateJourneyScore = () => {
    if (!timeline.schedule || timeline.schedule.length === 0) return 0;
    const completedTasks = timeline.schedule.filter(t => t.status === 'completed').length;
    const totalTasks = timeline.schedule.length;
    return Math.round((completedTasks / totalTasks) * 100);
  };

  const mindScore = calculateMindScore();
  const bodyScore = calculateBodyScore();
  const journeyScore = calculateJourneyScore();

  //UI RENDERING
  
  return (
    <section className="bg-[#161618] border border-gray-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
      {(mindScore + bodyScore + journeyScore) > 250 && (
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
      )}

      <div className="flex justify-between items-center mb-6 relative z-10">
        <h2 className="text-xl font-black flex items-center gap-2 text-white uppercase tracking-tight">
          <Flame className="w-5 h-5 text-amber-500" /> Daily Trifecta
        </h2>
        <span className="text-xs font-bold text-amber-500/80 uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
          {currentStreak} Day Streak
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
        <ProgressRing 
          radius={45} stroke={6} 
          progress={mindScore} 
          colorClass="text-blue-500 stroke-blue-500" 
          icon={Brain} 
          title="Mind" 
          subtitle="Plasticity Load" 
        />
        <ProgressRing 
          radius={45} stroke={6} 
          progress={bodyScore} 
          colorClass="text-emerald-500 stroke-emerald-500" 
          icon={Activity} 
          title="Body" 
          subtitle="Hardware Check" 
        />
        <ProgressRing 
          radius={45} stroke={6} 
          progress={journeyScore} 
          colorClass="text-purple-500 stroke-purple-500" 
          icon={MapIcon} 
          title="Journey" 
          subtitle="Execution" 
        />
      </div>
    </section>
  );
}