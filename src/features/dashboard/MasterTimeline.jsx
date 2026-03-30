import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, CheckCircle2, ArrowRightCircle, Loader2, RefreshCw, Activity, Target, Bell, ExternalLink, Timer, X } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { updateActiveTask, toggleTask, setSchedule } from './timelineSlice'; 
import { useNavigate } from 'react-router-dom';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { awardNeuralPower } from '../../utils/scoring'; 

export default function MasterTimeline() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const isInitializing = useSelector(state => state.auth?.isInitializing);
  const currentUser = useSelector(state => state.auth?.user);
  
  const dailySchedule = useSelector((state) => state.timeline.schedule);
  const hardware = useSelector((state) => state.hardware) || {};
  const vault = useSelector((state) => state.vault) || { cards: [] };
  
  const dueCardsCount = vault.cards?.filter(c => c.nextReview <= Date.now()).length || 0;

  const [isGenerating, setIsGenerating] = useState(false);
  const [dayType, setDayType] = useState("Hyper-Focus Day");
  
  const [showPreFlight, setShowPreFlight] = useState(false);
  const [pendingPath, setPendingPath] = useState(null);

  const prevExercised = useRef(hardware?.exercised);
  const prevVaultClear = useRef(vault?.cards?.length > 0 && dueCardsCount === 0);

  useEffect(() => {
    if (!dailySchedule || dailySchedule.length === 0) return;

    //Sync Aerobic BDNF task
    if (hardware?.exercised !== prevExercised.current) {
      const task = dailySchedule.find(t => t.title.toLowerCase().includes('bdnf') || t.title.toLowerCase().includes('aerobic'));
      
      if (task) {
        const isComplete = task.status === 'completed';
        if (hardware?.exercised && !isComplete) {
          dispatch(toggleTask(task.id));
          dispatch(updateActiveTask());
          awardNeuralPower(currentUser?.uid, 10); 
        } 
        else if (!hardware?.exercised && isComplete) {
          dispatch(toggleTask(task.id));
          dispatch(updateActiveTask());
          awardNeuralPower(currentUser?.uid, -10); 
        }
      }
      prevExercised.current = hardware?.exercised; 
    }

    //Sync Knowledge Vault task
    const isVaultClear = vault?.cards?.length > 0 && dueCardsCount === 0;
    if (isVaultClear !== prevVaultClear.current) {
      const task = dailySchedule.find(t => t.title.toLowerCase().includes('consolidation') || t.title.toLowerCase().includes('vault'));
      
      if (task) {
        const isComplete = task.status === 'completed';
        if (isVaultClear && !isComplete) {
          dispatch(toggleTask(task.id));
          dispatch(updateActiveTask());
          awardNeuralPower(currentUser?.uid, 10);
        } 
        else if (!isVaultClear && isComplete) {
          dispatch(toggleTask(task.id));
          dispatch(updateActiveTask());
          awardNeuralPower(currentUser?.uid, -10);
        }
      }
      prevVaultClear.current = isVaultClear; 
    }

  }, [hardware?.exercised, dueCardsCount, dailySchedule, dispatch, vault?.cards?.length, currentUser?.uid]);

  const getOracleInsight = () => {
    const { sleepHours, exercised, waterIntake, caffeineLogs } = hardware;
    let activeCaffeine = 0;
    if (caffeineLogs && caffeineLogs.length > 0) {
      const now = Date.now();
      caffeineLogs.forEach(log => {
        const elapsedHours = (now - log.timestamp) / (1000 * 60 * 60);
        activeCaffeine += log.amount * Math.pow(0.5, elapsedHours / 5);
      });
    }

    if (sleepHours > 0 && sleepHours < 6) return `Severe sleep debt (${sleepHours}h). Executive function will crash early. I have downgraded today to a Consolidation Day.`;
    if (activeCaffeine > 300) return `High adenosine antagonist saturation (${Math.round(activeCaffeine)}mg). Halt intake to prevent sleep architecture disruption.`;
    if (dueCardsCount > 20) return `Hippocampal overload. ${dueCardsCount} pending neural reviews. Clear the Vault immediately.`;
    return "Biological telemetry is optimal. Systems primed for execution.";
  };

  const preserveProgress = (newSchedule) => {
    if (!dailySchedule || dailySchedule.length === 0) return newSchedule;
    return newSchedule.map(newTask => {
      const existingTask = dailySchedule.find(oldTask => oldTask.id === newTask.id);
      if (existingTask && existingTask.status === 'completed') {
        return { ...newTask, status: 'completed' };
      }
      return newTask;
    });
  };

  const generateAITimeline = async (forceRefresh = false) => {
    const today = new Date().toDateString();
    
    if (!forceRefresh) {
      const cachedDate = localStorage.getItem('timeline_date');
      if (cachedDate === today && dailySchedule && dailySchedule.length > 0) {
        setDayType(localStorage.getItem('timeline_day_type') || "Hyper-Focus Day");
        return; 
      }
    }

    setIsGenerating(true);
    try {
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", generationConfig: { responseMimeType: "application/json" } });

      const prompt = `
        You are the Limitless OS Oracle. 
        User's biological state: ${hardware.sleepHours}h sleep, ${dueCardsCount} flashcards due.
        Step 1: Periodization. Decide if today is a "Hyper-Focus Day" or "Consolidation Day". If sleep < 6, force Consolidation.
        Step 2: Generate a Wake-Anchored timeline (T+0:00, T+2:00) with 4 tasks. Make sure one task is called "90-Min Deep Focus".
        Step 3: Assign a "path" for deep-linking: "/gym", "/vault", "/journey", "/hardware", or null.

        Output ONLY valid JSON:
        { "dayType": "Hyper-Focus Day", "schedule": [ { "id": 1, "time": "T+0:00", "title": "String", "subtitle": "String", "status": "upcoming", "dotColor": "bg-gray-800", "path": "/path" } ] }
      `;

      const result = await model.generateContent(prompt);
      const parsedData = JSON.parse(result.response.text());

      localStorage.setItem('timeline_date', today);
      localStorage.setItem('timeline_day_type', parsedData.dayType);

      setDayType(parsedData.dayType);
      
      const finalSchedule = preserveProgress(parsedData.schedule);
      dispatch(setSchedule(finalSchedule));
      dispatch(updateActiveTask());

    } catch (error) {
      console.error("Oracle Timeline Generation Failed:", error);
      const fallbackSchedule = [
        { id: 1, time: 'T+0:00', title: 'Aerobic BDNF Spike', subtitle: 'Hardware Maintained', status: 'upcoming', dotColor: 'bg-gray-800', path: '/hardware' },
        { id: 2, time: 'T+2:00', title: '90-Min Deep Focus', subtitle: 'Career Journey Integration', status: 'upcoming', dotColor: 'bg-gray-800', path: '/journey' },
        { id: 3, time: 'T+4:30', title: 'Knowledge Consolidation', subtitle: 'Clear Spaced Repetition Due', status: 'upcoming', dotColor: 'bg-gray-800', path: '/vault' },
        { id: 4, time: 'T+8:00', title: 'Hemisphere Switch', subtitle: 'Creative Neuro-Gym task', status: 'upcoming', dotColor: 'bg-gray-800', path: '/gym' }
      ];
      localStorage.setItem('timeline_date', today);
      localStorage.setItem('timeline_day_type', "Hyper-Focus Day");
      setDayType("Hyper-Focus Day");
      
      const finalSchedule = preserveProgress(fallbackSchedule);
      dispatch(setSchedule(finalSchedule));
      dispatch(updateActiveTask());
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (isInitializing) return; 
    if (dailySchedule?.length > 0) {
      setDayType(localStorage.getItem('timeline_day_type') || "Hyper-Focus Day");
      return; 
    }
    generateAITimeline();
  }, [isInitializing]); 

  // MANUAL CLICK HANDLERS WITH STRICT MATH LOCK
  const handleToggleComplete = (e, taskId) => {
    e.stopPropagation(); 
    
    const task = dailySchedule.find(t => t.id === taskId);
    if (!task) return;

    // STRICT MATH LOCK: If currently checked, we are un-checking it (-10).
    const isCurrentlyChecked = task.status === 'completed';
    const pointsToAward = isCurrentlyChecked ? -10 : 10;

    console.log(`[TIMELINE] Target: ${task.title}. Currently Checked? ${isCurrentlyChecked}. Modifying Score by: ${pointsToAward}`);

    // Inject Points
    awardNeuralPower(currentUser?.uid, pointsToAward);

    // Dispatch the Redux state flip
    dispatch(toggleTask(taskId));      
    dispatch(updateActiveTask());      
  };

  const handleNavigate = (task) => {
    let finalPath = task.path;
    if (!finalPath || finalPath === 'null') {
      const t = task.title.toLowerCase();
      if (t.includes('vault') || t.includes('consolidation')) finalPath = '/vault';
      else if (t.includes('gym') || t.includes('hemisphere') || t.includes('switch')) finalPath = '/gym';
      else if (t.includes('focus') || t.includes('deep') || t.includes('journey')) finalPath = '/journey';
      else if (t.includes('aerobic') || t.includes('bdnf') || t.includes('hardware')) finalPath = '/hardware';
    }

    if (task.title.includes('90-Min') || task.title.includes('Focus')) {
      if (Notification.permission !== "granted") {
        setPendingPath(finalPath); 
        setShowPreFlight(true);    
        return; 
      } else {
        window.dispatchEvent(new CustomEvent('START_ULTRADIAN_TIMER'));
      }
    }

    if (finalPath && finalPath !== 'null') {
      navigate(finalPath);
    }
  };

  const executePreFlight = () => {
    Notification.requestPermission().then(() => {
      window.dispatchEvent(new CustomEvent('START_ULTRADIAN_TIMER'));
      setShowPreFlight(false);
      if (pendingPath && pendingPath !== 'null') {
        navigate(pendingPath);
      }
    });
  };

  const isHyperFocus = dayType.includes("Hyper");

  return (
    <>
      <div className="bg-[#111113] border border-gray-800 rounded-3xl p-6 shadow-xl h-full flex flex-col relative overflow-hidden">
        <div className="flex items-start justify-between mb-8 relative z-10">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">The Master Timeline</h2>
            <div className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${isHyperFocus ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'}`}>
              {isHyperFocus ? <Target className="w-3 h-3" /> : <Activity className="w-3 h-3" />}{dayType}
            </div>
          </div>
          <button onClick={() => generateAITimeline(true)} disabled={isGenerating} className="p-2 bg-gray-900 border border-gray-700 rounded-xl text-gray-400 hover:text-white hover:border-gray-500 transition-all disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="flex-1 relative z-10">
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center h-40 text-blue-500/50"><Loader2 className="w-8 h-8 animate-spin mb-3" /><p className="text-[10px] font-bold uppercase tracking-widest">Oracle Computing...</p></div>
          ) : (
            <>
              <div className="absolute left-3 top-2 bottom-4 w-px bg-gray-800"></div>
              <div className="space-y-6">
                {dailySchedule?.map((task) => {
                  const isCompleted = task.status === 'completed';
                  const isActive = task.status === 'active';

                  return (
                    <div key={task.id} className={`flex gap-4 items-start group transition-all duration-300 ${isCompleted ? 'opacity-40' : ''}`}>
                      <div className="relative mt-1 bg-[#111113] py-1 z-10 cursor-pointer" onClick={(e) => handleToggleComplete(e, task.id)} title="Mark Task Complete">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 border-[#111113] transition-all duration-300 ${isCompleted ? 'bg-emerald-500/20 text-emerald-500' : task.dotColor} ${isActive ? 'shadow-[0_0_15px_rgba(59,130,246,0.5)] ring-2 ring-blue-500/50 ring-offset-2 ring-offset-[#111113]' : ''}`}>
                          {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : isActive ? <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div> : <div className="w-1.5 h-1.5 bg-gray-500 rounded-full opacity-50 hover:bg-white transition-colors"></div>}
                        </div>
                      </div>

                      <div className="pt-1.5 flex-1 cursor-pointer hover:translate-x-1 transition-transform" onClick={() => handleNavigate(task)} title="Execute Protocol">
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] font-bold text-gray-500 mb-0.5">{task.time}</p>
                          {(task.path || isActive) && (
                             <span className="flex items-center gap-1 text-[9px] text-blue-400 uppercase tracking-widest font-bold opacity-0 group-hover:opacity-100 transition-opacity">Execute <ArrowRightCircle className="w-3 h-3" /></span>
                          )}
                        </div>
                        <h3 className={`text-sm font-bold transition-colors ${isCompleted ? 'text-gray-500 line-through' : isActive ? 'text-blue-400' : 'text-white group-hover:text-gray-200'}`}>{task.title}</h3>
                        <p className="text-[10px] text-gray-500 mt-1">{task.subtitle}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <div className="mt-8 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-5 relative z-10">
          <div className="flex items-center gap-2 mb-3"><Zap className="w-4 h-4 text-indigo-400" /><h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Live Diagnostics</h4></div>
          <p className="text-xs text-indigo-200 leading-relaxed font-medium">{getOracleInsight()}</p>
        </div>
      </div>

      <AnimatePresence>
        {showPreFlight && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" onClick={() => setShowPreFlight(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-[#111113] border border-blue-500/30 rounded-3xl shadow-[0_0_50px_rgba(59,130,246,0.15)] z-50 overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-[#0a0a0a]">
                <div className="flex items-center gap-3"><Target className="w-6 h-6 text-blue-500" /><h2 className="text-lg font-bold text-white tracking-wide uppercase">Pre-Flight Briefing</h2></div>
                <button onClick={() => setShowPreFlight(false)} className="text-gray-500 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-8 space-y-6 text-gray-300">
                <p className="text-sm leading-relaxed border-l-2 border-blue-500 pl-4">You are about to initiate a Deep Focus Sprint. Here is how the ecosystem connects:</p>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3"><Bell className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" /><span className="text-sm">1. The browser will pop up asking for Notification Permissions (Click <strong>"Allow"</strong>).</span></li>
                  <li className="flex items-start gap-3"><ExternalLink className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" /><span className="text-sm">2. You will be immediately redirected to The Journey / Skill Tree to execute your work.</span></li>
                  <li className="flex items-start gap-3"><Timer className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" /><span className="text-sm">3. If you navigate back to the Command Center, you will see your Ultradian Timer has <strong>automatically started counting down</strong> from 90:00!</span></li>
                  <li className="flex items-start gap-3"><Zap className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" /><span className="text-sm">4. When the timer hits 00:00, a native system notification will pop up on your screen.</span></li>
                </ul>
                <button onClick={executePreFlight} className="w-full mt-4 flex items-center justify-center gap-2 py-4 bg-blue-600 text-white rounded-xl font-black hover:bg-blue-500 uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                  <CheckCircle2 className="w-5 h-5" /> Acknowledge & Execute
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}