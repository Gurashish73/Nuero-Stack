import React, { useState, useEffect } from 'react';
import { 
  Brain, Wind, Calculator, Play, RefreshCcw, Activity, 
  CheckCircle2, Paintbrush, Sparkles, Send, Loader2, 
  Crown, Grid3X3, Zap, ArrowUpRight 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { addMindProgress } from '../dashboard/streakSlice';
import { completeTask, updateActiveTask } from '../dashboard/timelineSlice';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { incrementNovelty } from '../hardwareLog/hardwareSlice';
import { awardNeuralPower } from '../../utils/scoring';

export default function NeuroGym() {
  const dispatch = useDispatch();
  
  const currentUser = useSelector((state) => state.auth?.user);
  const timelineSchedule = useSelector((state) => state.timeline?.schedule) || [];

  // DYNAMIC TIMELINE CHECKER

  const completeGymTimelineTask = () => {
    const gymTask = timelineSchedule.find(t => t.title.toLowerCase().includes('gym') || t.title.toLowerCase().includes('hemisphere') || t.title.toLowerCase().includes('switch'));
    if (gymTask && gymTask.status !== 'completed') {
      dispatch(completeTask(gymTask.id)); 
      dispatch(updateActiveTask());
    }
  };

  // 1. MATH SPRINT STATE (Prefrontal Cortex
  const [mathActive, setMathActive] = useState(false);
  const [score, setScore] = useState(0);
  const [question, setQuestion] = useState({ q: 'Press Start', a: 0 });
  const [input, setInput] = useState('');

  const generateMathProblem = () => {
    const num1 = Math.floor(Math.random() * 20) + 1;
    const num2 = Math.floor(Math.random() * 20) + 1;
    const isAddition = Math.random() > 0.5;
    
    if (isAddition) {
      setQuestion({ q: `${num1} + ${num2}`, a: num1 + num2 });
    } else {
      const max = Math.max(num1, num2);
      const min = Math.min(num1, num2);
      setQuestion({ q: `${max} - ${min}`, a: max - min });
    }
    setInput('');
  };

  const startMath = () => {
    setMathActive(true);
    setScore(0);
    generateMathProblem();
  };

  const handleMathSubmit = (e) => {
    e.preventDefault();
    if (parseInt(input) === question.a) {
      const newScore = score + 1;
      setScore(newScore);
      
      if (newScore === 5) {
        setMathActive(false);
        setQuestion({ q: 'Workout Complete!', a: 0 });
        
        dispatch(addMindProgress(25)); 
        // TRIFECTA & LEADERBOARD HOOKS
        dispatch(incrementNovelty());
        awardNeuralPower(currentUser?.uid, 15); // +15 Global Points
        completeGymTimelineTask();
      } else {
        generateMathProblem();
      }
    } else {
      setInput(''); 
    }
  };

  // 2. BREATHING EXERCISE STATE (Amygdala)
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathPhase, setBreathPhase] = useState('Ready'); 
  const [breathTimer, setBreathTimer] = useState(60); 

  useEffect(() => {
    let clockInterval;
    if (isBreathing && breathTimer > 0) {
      clockInterval = setInterval(() => {
        setBreathTimer((prev) => prev - 1);
      }, 1000);
    } else if (breathTimer === 0 && isBreathing) {
      setIsBreathing(false);
      setBreathPhase('Done');
      dispatch(addMindProgress(10)); 

      // TRIFECTA & LEADERBOARD HOOKS 
      dispatch(incrementNovelty()); 
      awardNeuralPower(currentUser?.uid, 10);
    }
    return () => clearInterval(clockInterval);
  }, [isBreathing, breathTimer, dispatch, currentUser?.uid]);

  useEffect(() => {
    let timeout;
    if (isBreathing) {
      if (breathPhase === 'Ready' || breathPhase === 'Done') {
        setBreathPhase('Inhale');
      } else if (breathPhase === 'Inhale') {
        timeout = setTimeout(() => setBreathPhase('Hold'), 4000); 
      } else if (breathPhase === 'Hold') {
        timeout = setTimeout(() => setBreathPhase('Exhale'), 7000); 
      } else if (breathPhase === 'Exhale') {
        timeout = setTimeout(() => setBreathPhase('Inhale'), 8000); 
      }
    } else if (!isBreathing && breathTimer > 0) {
      setBreathPhase('Ready');
    }
    return () => clearTimeout(timeout);
  }, [isBreathing, breathPhase]);

  const resetBreathing = () => {
    setIsBreathing(false);
    setBreathTimer(60);
    setBreathPhase('Ready');
  };

  const getAnimationProps = () => {
    switch (breathPhase) {
      case 'Inhale': return { scale: 1.5, duration: 4 };
      case 'Hold': return { scale: 1.5, duration: 7 }; 
      case 'Exhale': return { scale: 1, duration: 8 };
      default: return { scale: 1, duration: 1 };
    }
  };

  const { scale, duration } = getAnimationProps();

  // 3. HEMISPHERE SWITCH STATE (Right Brain)
  const [creativePrompt, setCreativePrompt] = useState('Awaiting creative directive...');
  const [creativeInput, setCreativeInput] = useState('');
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [isCreativeComplete, setIsCreativeComplete] = useState(false);

  const generateCreativePrompt = async () => {
    setIsGeneratingPrompt(true);
    setIsCreativeComplete(false);
    setCreativeInput('');
    try {
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      
      const prompt = `
        You are a creative director. Your operator is a coder taking a 'Right Hemisphere' break to prevent left-brain burnout. 
        Generate ONE specific, highly inspiring creative prompt. 
        Randomly choose between asking for:
        1) A 4-line Punjabi rap verse about coding, the matrix, or the daily grind.
        2) A 3-scene outline for a suspense/sci-fi short film set in space.
        
        Do not use pleasantries. Just output the raw prompt directly. Keep it under 2 sentences.
      `;
      
      const result = await model.generateContent(prompt);
      setCreativePrompt(result.response.text());
    } catch (err) {
      setCreativePrompt('Neural link failed. Free-write a scene about a rogue AI.');
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  const handleCreativeSubmit = () => {
    if (creativeInput.trim().length > 20) {
      setIsCreativeComplete(true);
      dispatch(addMindProgress(25));
      
      //TRIFECTA & LEADERBOARD HOOKS
      dispatch(incrementNovelty()); 
      awardNeuralPower(currentUser?.uid, 20);
      completeGymTimelineTask(); 
    }
  };

  // 4. EXTERNAL PORTALS STATE (Chess, Sudoku, N-Back)
  const [completedProtocols, setCompletedProtocols] = useState({
    chess: false,
    sudoku: false,
    nback: false
  });

  const handleLogProtocol = (protocol) => {
    if (!completedProtocols[protocol]) {
      setCompletedProtocols(prev => ({ ...prev, [protocol]: true }));
      dispatch(addMindProgress(20)); 

      // TRIFECTA & LEADERBOARD HOOKS
      dispatch(incrementNovelty()); 
      awardNeuralPower(currentUser?.uid, 15);
    }
  };

  // RENDER UI
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8 overflow-y-auto relative">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 z-0 pointer-events-none"></div>

      <div className="max-w-6xl mx-auto space-y-8 pb-12 relative z-10">
        
        {/* HEADER */}
        <header className="mb-8 border-b border-gray-800 pb-6">
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <Brain className="w-8 h-8 text-blue-500" /> 
            The Neuro-Gym
          </h1>
          <p className="text-gray-400 mt-2 text-lg">
            Active cognitive stressors to force neuroplasticity and emotional regulation.
          </p>
        </header>

        {/* SECTION 1: INTERNAL PROTOCOLS (Amygdala & Prefrontal) */}
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Internal Protocols</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* 1. AMYGDALA DECOMPRESSION (Breathing) */}
          <section className="bg-[#161618] border border-gray-800 rounded-3xl p-8 shadow-xl flex flex-col items-center justify-center text-center relative overflow-hidden h-100">
            <div className="absolute top-0 left-0 w-full h-1 bg-pink-500"></div>
            
            <div className="flex items-center justify-between w-full mb-2">
              <div className="flex items-center gap-2">
                <Wind className="w-5 h-5 text-pink-400" />
                <h2 className="text-lg font-bold text-pink-400 uppercase tracking-widest">Amygdala Regulation</h2>
              </div>
              <span className="text-sm font-mono font-bold text-gray-500">{breathTimer}s</span>
            </div>
            
            <p className="text-sm text-gray-400 mb-6">4-7-8 Breathing to activate the parasympathetic nervous system.</p>

            <div className="relative w-40 h-40 flex items-center justify-center mb-6">
              <motion.div 
                className="absolute inset-0 rounded-full bg-pink-500/20 border-2 border-pink-500/50"
                animate={{ scale: scale }}
                transition={{ duration: duration, ease: "easeInOut" }}
              />
              <div className="relative z-10 text-xl font-bold text-white">
                {breathPhase}
              </div>
            </div>

            <div className="flex gap-2 relative z-20">
              <button onClick={() => setIsBreathing(!isBreathing)} disabled={breathTimer === 0} className={`px-6 py-2 rounded-xl font-bold transition-colors ${isBreathing ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-pink-500 text-black hover:bg-pink-400 disabled:opacity-50 disabled:cursor-not-allowed'}`}>
                {isBreathing ? 'Pause' : breathTimer === 0 ? 'Session Complete' : 'Begin Session'}
              </button>
              {breathTimer < 60 && (
                <button onClick={resetBreathing} className="p-2 bg-gray-800 rounded-xl text-gray-400 hover:text-white transition-colors"><RefreshCcw className="w-5 h-5" /></button>
              )}
            </div>

            <AnimatePresence>
              {breathTimer === 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-pink-500/10 backdrop-blur-md flex items-center justify-center p-6 z-30">
                  <div className="text-center bg-[#161618] border border-pink-500 p-6 rounded-2xl shadow-2xl">
                    <CheckCircle2 className="w-12 h-12 text-pink-500 mx-auto mb-3" />
                    <h3 className="text-xl font-bold text-white mb-2">Nervous System Reset</h3>
                    <p className="text-sm text-gray-400 mb-4">+10% Mind Progress</p>
                    <button onClick={resetBreathing} className="px-6 py-2 bg-pink-500 text-black rounded-lg font-bold hover:bg-pink-400 transition-colors">Restart</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* 2. PREFRONTAL CORTEX GYM (Math Sprint) */}
          <section className="bg-[#161618] border border-gray-800 rounded-3xl p-8 shadow-xl flex flex-col relative overflow-hidden h-100">
            <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-blue-400" />
                <h2 className="text-lg font-bold text-blue-400 uppercase tracking-widest">Prefrontal Sprint</h2>
              </div>
              <span className="text-sm font-bold text-gray-500">Score: <span className="text-white">{score}/5</span></span>
            </div>
            <p className="text-sm text-gray-400 mb-8">Rapid mental arithmetic to build working memory and analytical speed.</p>

            <div className="flex-1 flex flex-col items-center justify-center bg-[#0a0a0a] rounded-2xl border border-gray-800 p-6 mb-6">
              <div className="text-5xl font-black text-white tracking-widest mb-6 font-mono">
                {question.q}
              </div>
              
              {mathActive ? (
                <form onSubmit={handleMathSubmit} className="w-full max-w-50">
                  <input type="number" value={input} onChange={(e) => setInput(e.target.value)} className="w-full bg-gray-800 border-2 border-blue-500/50 rounded-xl px-4 py-3 text-center text-2xl font-bold text-white focus:outline-none focus:border-blue-500 transition-colors" placeholder="=" autoFocus />
                  <button type="submit" className="hidden">Submit</button>
                </form>
              ) : (
                <button onClick={startMath} className="flex items-center gap-2 px-8 py-3 bg-blue-500 text-black rounded-xl font-bold hover:bg-blue-400 transition-colors">
                  {score === 5 ? <RefreshCcw className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  {score === 5 ? 'Sprint Again' : 'Start Sprint'}
                </button>
              )}
            </div>

            <AnimatePresence>
              {score === 5 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-blue-500/10 backdrop-blur-md flex items-center justify-center z-30">
                  <div className="bg-[#161618] border border-blue-500 p-6 rounded-2xl text-center shadow-2xl">
                    <Activity className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                    <h3 className="text-xl font-bold text-white mb-2">Sprint Completed!</h3>
                    <p className="text-sm text-gray-400 mb-4">+25% Mind Progress<br/>Timeline Task Crossed Off</p>
                    <button onClick={startMath} className="px-6 py-2 bg-blue-500 text-black rounded-lg font-bold hover:bg-blue-400 transition-colors">Go Again</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

        </div>

        {/* SECTION 2: EXTERNAL PORTALS */}
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4 mt-8">External Portals</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

          {/* CHESS PROTOCOL */}
          <div className="bg-[#111113] border border-gray-800 rounded-3xl p-6 flex flex-col relative overflow-hidden group hover:border-blue-500/50 transition-all shadow-lg">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
            <div className="flex items-center gap-3 mb-4 relative z-10">
              <div className="bg-blue-500/10 p-3 rounded-xl text-blue-500">
                <Crown className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">Strategic Prediction</h3>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">Chess / Frontal Lobe</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 mb-6 flex-1 relative z-10">
              Engages planning, decision-making, pattern recognition, and working memory. Play one rapid 10-minute game.
            </p>
            <div className="flex gap-3 mt-auto relative z-10">
              <a href="https://lichess.org/" target="_blank" rel="noreferrer" className="flex-1 bg-[#0a0a0a] border border-gray-800 text-gray-300 hover:text-white hover:border-blue-500 rounded-xl py-3 text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                Launch Lichess <ArrowUpRight className="w-4 h-4" />
              </a>
              <button onClick={() => handleLogProtocol('chess')} disabled={completedProtocols.chess} className={`w-14 rounded-xl flex items-center justify-center transition-all ${completedProtocols.chess ? 'bg-blue-500/20 text-blue-500 border border-blue-500/30' : 'bg-blue-600 text-white hover:bg-blue-500'}`}>
                {completedProtocols.chess ? <CheckCircle2 className="w-6 h-6" /> : <Zap className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* SUDOKU PROTOCOL */}
          <div className="bg-[#111113] border border-gray-800 rounded-3xl p-6 flex flex-col relative overflow-hidden group hover:border-purple-500/50 transition-all shadow-lg">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
            <div className="flex items-center gap-3 mb-4 relative z-10">
              <div className="bg-purple-500/10 p-3 rounded-xl text-purple-500">
                <Grid3X3 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">Visuospatial Matrix</h3>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">Sudoku / Parietal Lobe</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 mb-6 flex-1 relative z-10">
              Engages logical deduction, memory retrieval, and cross-hemispheric communication. Complete one hard grid.
            </p>
            <div className="flex gap-3 mt-auto relative z-10">
              <a href="https://sudoku.com/" target="_blank" rel="noreferrer" className="flex-1 bg-[#0a0a0a] border border-gray-800 text-gray-300 hover:text-white hover:border-purple-500 rounded-xl py-3 text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                Launch Sudoku <ArrowUpRight className="w-4 h-4" />
              </a>
              <button onClick={() => handleLogProtocol('sudoku')} disabled={completedProtocols.sudoku} className={`w-14 rounded-xl flex items-center justify-center transition-all ${completedProtocols.sudoku ? 'bg-purple-500/20 text-purple-500 border border-purple-500/30' : 'bg-purple-600 text-white hover:bg-purple-500'}`}>
                {completedProtocols.sudoku ? <CheckCircle2 className="w-6 h-6" /> : <Zap className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* DUAL N-BACK PROTOCOL */}
          <div className="bg-[#111113] border border-gray-800 rounded-3xl p-6 flex flex-col relative overflow-hidden group hover:border-emerald-500/50 transition-all shadow-lg">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
            <div className="flex items-center gap-3 mb-4 relative z-10">
              <div className="bg-emerald-500/10 p-3 rounded-xl text-emerald-500">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">Working Memory</h3>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">Dual N-Back / Exec Function</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 mb-6 flex-1 relative z-10">
              The only proven game to increase baseline fluid intelligence. Track audio and visual stimuli simultaneously.
            </p>
            <div className="flex gap-3 mt-auto relative z-10">
              <a href="https://brainscale.net/dual-n-back" target="_blank" rel="noreferrer" className="flex-1 bg-[#0a0a0a] border border-gray-800 text-gray-300 hover:text-white hover:border-emerald-500 rounded-xl py-3 text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                Launch N-Back <ArrowUpRight className="w-4 h-4" />
              </a>
              <button onClick={() => handleLogProtocol('nback')} disabled={completedProtocols.nback} className={`w-14 rounded-xl flex items-center justify-center transition-all ${completedProtocols.nback ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30' : 'bg-emerald-600 text-white hover:bg-emerald-500'}`}>
                {completedProtocols.nback ? <CheckCircle2 className="w-6 h-6" /> : <Zap className="w-5 h-5" />}
              </button>
            </div>
          </div>

        </div>

        {/* SECTION 3: Hemisphere Switch (Right Brain) */}
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4 mt-8">Diffuse Mode</h2>
        <section className="bg-[#111113] border border-purple-500/30 rounded-3xl p-8 shadow-[0_0_40px_rgba(168,85,247,0.1)] flex flex-col relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-purple-500 to-pink-500"></div>
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Paintbrush className="w-6 h-6 text-purple-400" />
              <div>
                <h2 className="text-lg font-bold text-purple-400 uppercase tracking-widest">Hemisphere Switch</h2>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">Diffuse Mode Activation</p>
              </div>
            </div>
            {!isCreativeComplete && (
              <button 
                onClick={generateCreativePrompt} 
                disabled={isGeneratingPrompt}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600/20 text-purple-400 border border-purple-500/30 rounded-xl font-bold text-xs hover:bg-purple-600/30 transition-all disabled:opacity-50"
              >
                {isGeneratingPrompt ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Initialize Creative Director
              </button>
            )}
          </div>
          
          <p className="text-sm text-gray-300 mb-6 leading-relaxed font-mono bg-purple-500/5 p-4 rounded-xl border border-purple-500/20">
            {creativePrompt}
          </p>

          <div className="relative">
            <textarea 
              value={creativeInput}
              onChange={(e) => setCreativeInput(e.target.value)}
              disabled={isCreativeComplete}
              placeholder="Enter your creative flow here..."
              className="w-full bg-[#0a0a0a] border border-gray-800 rounded-2xl p-6 text-gray-300 focus:border-purple-500 outline-none resize-none h-48 custom-scrollbar disabled:opacity-50"
            />
            <div className="absolute bottom-4 right-4 text-[10px] font-mono text-gray-500">
              {creativeInput.trim().split(/\s+/).filter(w => w.length > 0).length} Words
            </div>
          </div>

          {!isCreativeComplete ? (
            <button 
              onClick={handleCreativeSubmit}
              disabled={creativeInput.trim().length < 20}
              className="w-full mt-4 flex items-center justify-center gap-2 py-4 bg-purple-600 text-white rounded-xl font-black hover:bg-purple-500 disabled:opacity-50 disabled:bg-gray-800 uppercase tracking-widest transition-all"
            >
              <Send className="w-5 h-5" /> Consolidate Synapses
            </button>
          ) : (
            <div className="w-full mt-4 flex items-center justify-center gap-2 py-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl font-black uppercase tracking-widest">
              <CheckCircle2 className="w-5 h-5" /> Hemisphere Synchronized
            </div>
          )}

        </section>
      </div>
    </div>
  );
}