import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Moon, Droplets, Coffee, Zap, X, Apple, 
  Activity, Dumbbell, Wind, TreePine, Brain, AlertTriangle
} from 'lucide-react';
import { 
  logSleep, 
  toggleDiet, 
  logWater, 
  addCaffeine, 
  removeCaffeine, 
  setExerciseProtocol, 
  toggleGreenTime 
} from './hardwareSlice';
import { awardNeuralPower } from '../../utils/scoring'; 

export default function HardwareLog() {
  const dispatch = useDispatch();
  const hardware = useSelector((state) => state.hardware) || {};
  const currentUser = useSelector((state) => state.auth?.user); 
  
  const [now, setNow] = useState(Date.now());
  const [customName, setCustomName] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [aiVerdict, setAiVerdict] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60000); 
    return () => clearInterval(interval);
  }, []);

  //Pharmacokinetics Math
  const calculateActiveCaffeine = () => {
    if (!hardware.caffeineLogs || hardware.caffeineLogs.length === 0) return 0;
    let active = 0;
    hardware.caffeineLogs.forEach(log => {
      const elapsedHours = (now - log.timestamp) / (1000 * 60 * 60);
      const remaining = log.amount * Math.pow(0.5, elapsedHours / 5); 
      if (remaining > 1) active += remaining;
    });
    return Math.round(active);
  };

  const activeCaffeine = calculateActiveCaffeine();
  const TOXICITY_LIMIT = 1000;
  const isToxicLockdown = activeCaffeine >= TOXICITY_LIMIT;

  //CAFFEINE PENALTY ENGINE
  const prevCaffeineState = useRef(activeCaffeine > 400);
  useEffect(() => {
    const isHighCaffeine = activeCaffeine > 400;
    if (isHighCaffeine && !prevCaffeineState.current) {
      awardNeuralPower(currentUser?.uid, -20);
      prevCaffeineState.current = true;
    } else if (!isHighCaffeine && prevCaffeineState.current) {
      awardNeuralPower(currentUser?.uid, 20);
      prevCaffeineState.current = false;
    }
  }, [activeCaffeine, currentUser?.uid]);

  //TRIFECTA SCORE INTEGRATION HANDLERS
  
  const handleSleepChange = (newHours) => {
    const currentScore = Math.round(Math.min(20, ((hardware.sleepHours || 0) / 7) * 20));
    const newScore = Math.round(Math.min(20, (newHours / 7) * 20));
    const diff = newScore - currentScore;
    
    if (diff !== 0) awardNeuralPower(currentUser?.uid, diff);
    dispatch(logSleep(newHours));
  };

  const handleToggleDiet = () => {
    const isCurrentlyLogged = hardware.dietLogged;
    awardNeuralPower(currentUser?.uid, isCurrentlyLogged ? -15 : 15);
    dispatch(toggleDiet());
  };

  const handleLogWater = (glass) => {
    const current = hardware.waterIntake || 0;
    if (glass > current) {
      awardNeuralPower(currentUser?.uid, (glass - current) * 5); // +5 per new glass
    } else if (glass < current) {
      awardNeuralPower(currentUser?.uid, -(current - glass) * 5); // -5 per removed glass
    }
    dispatch(logWater(glass));
  };

  const handleToggleGreenTime = () => {
    const isCurrentlyLogged = hardware.greenTime;
    awardNeuralPower(currentUser?.uid, isCurrentlyLogged ? -10 : 10);
    dispatch(toggleGreenTime());
  };

  const handleSetExercise = (protocol) => {
    const currentProtocol = hardware.exerciseProtocol;
    const isCurrentlyExercising = currentProtocol && currentProtocol !== 'none';
    
    // Toggle logic
    const willExercise = protocol !== currentProtocol;

    if (willExercise && !isCurrentlyExercising) {
      awardNeuralPower(currentUser?.uid, 25);
    } else if (!willExercise && isCurrentlyExercising) {
      awardNeuralPower(currentUser?.uid, -25);
    }
    
    dispatch(setExerciseProtocol(willExercise ? protocol : 'none'));
  };

  // Standard Drink Handlers
  const handleAddDrink = (drink) => {
    if (isToxicLockdown) return;
    dispatch(addCaffeine({ name: drink.name, amount: drink.amount }));
  };

  const handleCustomInject = () => {
    if (isToxicLockdown || !customName || !customAmount) return;
    dispatch(addCaffeine({ name: customName, amount: Number(customAmount) }));
    setCustomName(''); setCustomAmount(''); setAiVerdict(null);
  };

  const handleScanAndInject = async () => {
    if (isToxicLockdown || !customName) return; 
    setIsScanning(true); setAiVerdict(null);
    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const currentHour = new Date().getHours();
      let prompt = `I am a high-performance engineer. It is currently hour ${currentHour} (24h format). I already have ${activeCaffeine}mg of active caffeine in my blood. Target sleep time is 23:00. `;
      if (customAmount) {
        prompt += `I want to drink: ${customName} specifically at ${customAmount}mg. Provide a brutal, 1-sentence assessment of whether this dose is biologically safe. Start with either [APPROVED] or [DENIED].`;
      } else {
        prompt += `I want to drink: ${customName}. Calculate my remaining safe caffeine allowance for the day to ensure my active caffeine decays below 50mg by 23:00 (5-hour half-life). Start with [RECOMMENDATION] and state exactly how many mg of ${customName} I can safely consume right now.`;
      }
      const result = await model.generateContent(prompt);
      setAiVerdict(result.response.text().trim());
    } catch (error) {
      setAiVerdict("[WARNING] Neural link severed. Drink at your own risk.");
    } finally {
      setIsScanning(false);
    }
  };

  const bodyScore = Math.max(0, Math.min(100, Math.round(
    (hardware.exerciseProtocol && hardware.exerciseProtocol !== 'none' ? 25 : 0) +
    Math.min(20, (hardware.waterIntake || 0) * 2.5) +
    Math.min(20, ((hardware.sleepHours || 0) / 7) * 20) +
    (hardware.dietLogged ? 15 : 0) + (hardware.greenTime ? 10 : 0) +
    (activeCaffeine <= 400 ? 10 : 10 - Math.min(40, Math.floor((activeCaffeine - 400) / 15)))
  )));

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8 overflow-y-auto relative">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 z-0 pointer-events-none"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        <header className="mb-10 border-b border-gray-800 pb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-3 text-white uppercase"><Activity className="w-8 h-8 text-blue-500" /> Biological Telemetry</h1>
            <p className="text-gray-400 mt-1 text-sm uppercase tracking-widest font-mono">Hardware Maintenance & Neural Priming</p>
          </div>
          <div className="bg-[#111113] border border-gray-800 p-4 rounded-3xl flex items-center gap-5 shadow-lg min-w-60">
            <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#1f2937" strokeWidth="8" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" className={`${bodyScore >= 80 ? 'text-emerald-500' : bodyScore >= 50 ? 'text-amber-500' : 'text-red-500'} transition-all duration-1000 ease-out`} strokeDasharray={251.2} strokeDashoffset={251.2 - (bodyScore / 100) * 251.2} />
              </svg>
              <span className="absolute text-sm font-black text-white">{bodyScore}%</span>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Hardware Status</p>
              <p className={`text-sm font-black uppercase tracking-wide ${bodyScore >= 80 ? 'text-emerald-400' : bodyScore >= 50 ? 'text-amber-400' : 'text-red-400'}`}>{bodyScore >= 80 ? 'Optimized' : bodyScore >= 50 ? 'Degraded' : 'Critical'}</p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-[#111113] border border-gray-800 rounded-3xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                <div className="flex items-center gap-3 mb-6 relative z-10"><Moon className="w-6 h-6 text-indigo-400" /><h3 className="text-lg font-bold text-white tracking-tight">Glymphatic Clearance</h3></div>
                <div className="flex items-center justify-between relative z-10">
                  <button onClick={() => handleSleepChange(Math.max(0, hardware.sleepHours - 0.5))} className="w-12 h-12 rounded-xl bg-[#0a0a0a] border border-gray-800 flex items-center justify-center hover:border-indigo-500 transition-colors">-</button>
                  <div className="text-center"><span className="text-4xl font-black text-indigo-400">{hardware.sleepHours}</span><span className="text-sm text-gray-500 font-bold ml-1">hrs</span></div>
                  <button onClick={() => handleSleepChange(Math.min(12, hardware.sleepHours + 0.5))} className="w-12 h-12 rounded-xl bg-[#0a0a0a] border border-gray-800 flex items-center justify-center hover:border-indigo-500 transition-colors">+</button>
                </div>
              </div>

              <div className="bg-[#111113] border border-gray-800 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between">
                <div className="flex items-center gap-3 mb-4 relative z-10"><Apple className="w-6 h-6 text-rose-400" /><h3 className="text-lg font-bold text-white tracking-tight">Nutritional Baseline</h3></div>
                <button onClick={handleToggleDiet} className={`w-full py-4 rounded-xl border font-black uppercase tracking-widest transition-all ${hardware.dietLogged ? 'bg-rose-500/20 border-rose-500 text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.2)]' : 'bg-[#0a0a0a] border-gray-800 text-gray-500 hover:border-gray-600'}`}>
                  {hardware.dietLogged ? 'Diet Optimized' : 'Log Clean Diet'}
                </button>
              </div>
            </div>

            <div className="bg-[#111113] border border-gray-800 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3"><Droplets className="w-6 h-6 text-cyan-400" /><div><h3 className="text-lg font-bold text-white tracking-tight">Neural Hydration</h3><p className="text-xs text-gray-500 uppercase tracking-widest">Conductivity Maintenance</p></div></div>
                <span className="text-2xl font-black text-cyan-400">{hardware.waterIntake || 0}<span className="text-sm text-gray-500">/8</span></span>
              </div>
              <div className="flex gap-2 justify-between">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((glass) => (
                  <button key={glass} onClick={() => handleLogWater(glass)} className={`flex-1 aspect-square rounded-xl border transition-all ${(hardware.waterIntake || 0) >= glass ? 'bg-cyan-500/20 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'bg-[#0a0a0a] border-gray-800 hover:border-gray-600'}`}>
                    <Droplets className={`w-1/2 h-1/2 mx-auto ${(hardware.waterIntake || 0) >= glass ? 'text-cyan-400' : 'text-gray-700'}`} />
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#111113] border border-gray-800 rounded-3xl p-6">
                <h3 className="text-lg font-bold text-white tracking-tight mb-4">Kinetic Protocol</h3>
                <div className="space-y-3">
                  <button onClick={() => handleSetExercise('aerobic')} className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${hardware.exerciseProtocol === 'aerobic' ? 'bg-blue-500/10 border-blue-500' : 'bg-[#0a0a0a] border-gray-800 hover:border-gray-600'}`}>
                    <div className="flex items-center gap-3"><Activity className={`w-4 h-4 ${hardware.exerciseProtocol === 'aerobic' ? 'text-blue-500' : 'text-gray-500'}`} /><div className="text-left"><p className={`text-xs font-bold ${hardware.exerciseProtocol === 'aerobic' ? 'text-blue-400' : 'text-gray-300'}`}>Aerobic (BDNF)</p></div></div>
                  </button>
                  <button onClick={() => handleSetExercise('resistance')} className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${hardware.exerciseProtocol === 'resistance' ? 'bg-orange-500/10 border-orange-500' : 'bg-[#0a0a0a] border-gray-800 hover:border-gray-600'}`}>
                    <div className="flex items-center gap-3"><Dumbbell className={`w-4 h-4 ${hardware.exerciseProtocol === 'resistance' ? 'text-orange-500' : 'text-gray-500'}`} /><div className="text-left"><p className={`text-xs font-bold ${hardware.exerciseProtocol === 'resistance' ? 'text-orange-400' : 'text-gray-300'}`}>Resistance</p></div></div>
                  </button>
                  <button onClick={() => handleSetExercise('flexibility')} className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${hardware.exerciseProtocol === 'flexibility' ? 'bg-emerald-500/10 border-emerald-500' : 'bg-[#0a0a0a] border-gray-800 hover:border-gray-600'}`}>
                    <div className="flex items-center gap-3"><Wind className={`w-4 h-4 ${hardware.exerciseProtocol === 'flexibility' ? 'text-emerald-500' : 'text-gray-500'}`} /><div className="text-left"><p className={`text-xs font-bold ${hardware.exerciseProtocol === 'flexibility' ? 'text-emerald-400' : 'text-gray-300'}`}>Flexibility (Yoga)</p></div></div>
                  </button>
                </div>
              </div>

              <div className="bg-[#111113] border border-gray-800 rounded-3xl p-6 flex flex-col">
                <h3 className="text-lg font-bold text-white tracking-tight mb-2">Environmental</h3>
                <p className="text-xs text-gray-500 mb-6 flex-1">90-minute nature exposure to reduce subgenual prefrontal cortex rumination.</p>
                <button onClick={handleToggleGreenTime} className={`w-full py-4 rounded-xl border font-black uppercase tracking-widest transition-all text-xs flex items-center justify-center gap-2 ${hardware.greenTime ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-[#0a0a0a] border-gray-800 text-gray-500 hover:border-gray-600'}`}>
                  <TreePine className="w-4 h-4" /> {hardware.greenTime ? 'Green Time Met' : 'Log Nature Exp.'}
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col">
            <div className={`bg-[#111113] border rounded-3xl p-6 flex-1 relative overflow-hidden transition-all duration-500 ${isToxicLockdown ? 'border-red-500/50 shadow-[0_0_50px_rgba(239,68,68,0.15)]' : 'border-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.05)]'}`}>
              <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none ${isToxicLockdown ? 'bg-red-500/10 animate-pulse' : 'bg-amber-500/5'}`}></div>
              
              <div className="flex items-center justify-between mb-8 relative z-10">
                <div>
                  <h3 className={`text-xl font-bold tracking-tight flex items-center gap-2 ${isToxicLockdown ? 'text-red-500' : 'text-white'}`}>
                    {isToxicLockdown ? <AlertTriangle className="w-5 h-5 text-red-500" /> : <Coffee className="w-5 h-5 text-amber-500" />} Pharmacokinetics
                  </h3>
                  <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Caffeine Half-Life Monitor</p>
                </div>
                <div className="text-right">
                  <span className={`text-3xl font-black ${isToxicLockdown ? 'text-red-500 animate-pulse' : activeCaffeine > 400 ? 'text-orange-500' : 'text-amber-500'}`}>{activeCaffeine}</span>
                  <span className="text-sm font-bold text-gray-500 ml-1">mg</span>
                  <p className="text-[10px] uppercase text-gray-600 mt-1 font-bold">Active in Blood</p>
                </div>
              </div>

              {isToxicLockdown && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 relative z-10">
                  <p className="text-xs font-black text-red-500 uppercase tracking-widest text-center">SYSTEM LOCKDOWN</p>
                  <p className="text-xs text-red-400 mt-1 text-center">Lethal toxicity threshold reached (&gt;1000mg). Further stimulants denied until metabolization.</p>
                </div>
              )}

              <div className={`mb-6 relative z-10 ${isToxicLockdown ? 'opacity-50 pointer-events-none' : ''}`}>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2"><Zap className="w-3 h-3 text-amber-500" /> Quick Injectors</p>
                <div className="grid grid-cols-3 gap-3">
                  {hardware.quickDrinks?.map((drink) => (
                    <button key={drink.id} onClick={() => handleAddDrink(drink)} disabled={isToxicLockdown} className="bg-[#0a0a0a] border border-amber-500/20 hover:border-amber-500/50 hover:bg-amber-500/10 rounded-xl p-3 text-center transition-all group disabled:cursor-not-allowed">
                      <p className="text-xs font-bold text-gray-300 group-hover:text-amber-400">{drink.name}</p>
                      <p className="text-[10px] text-gray-600 font-mono mt-1">{drink.amount}mg</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className={`mb-8 relative z-10 bg-[#0a0a0a] border border-amber-500/30 rounded-2xl p-4 shadow-inner ${isToxicLockdown ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="flex items-center justify-between mb-3"><p className="text-xs font-bold text-amber-500 uppercase tracking-widest flex items-center gap-2"><Brain className="w-4 h-4" /> AI Dosimeter</p></div>
                <div className="flex gap-3 mb-3">
                  <input type="text" placeholder="Drink Name" value={customName} onChange={(e) => setCustomName(e.target.value)} disabled={isToxicLockdown} className="flex-1 bg-[#111113] border border-gray-800 rounded-xl p-3 text-sm text-white focus:border-amber-500 outline-none disabled:bg-gray-900" />
                  <input type="number" placeholder="mg (opt)" value={customAmount} onChange={(e) => setCustomAmount(e.target.value)} disabled={isToxicLockdown} className="w-20 bg-[#111113] border border-gray-800 rounded-xl p-3 text-sm text-white focus:border-amber-500 outline-none text-center placeholder:text-gray-600 disabled:bg-gray-900" />
                </div>
                <div className="flex gap-3">
                  <button onClick={handleScanAndInject} disabled={isToxicLockdown || isScanning || !customName} className="flex-1 bg-amber-500/10 text-amber-500 border border-amber-500/30 rounded-xl py-2 text-xs font-bold uppercase tracking-widest hover:bg-amber-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2">{isScanning ? 'Scanning...' : 'Scan Safety'}</button>
                  <button onClick={handleCustomInject} disabled={isToxicLockdown || !customName || !customAmount} className="flex-1 bg-amber-600 text-black rounded-xl py-2 text-xs font-black uppercase tracking-widest hover:bg-amber-500 disabled:opacity-50 transition-all">Inject</button>
                </div>
                {aiVerdict && !isToxicLockdown && (
                  <div className={`mt-4 p-3 rounded-xl border text-xs font-medium leading-relaxed ${aiVerdict.includes('[APPROVED]') || aiVerdict.includes('[RECOMMEND') ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>{aiVerdict}</div>
                )}
              </div>

              <div className="relative z-10">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 border-b border-gray-800 pb-2">Active Metabolism Log</p>
                <div className="space-y-2 max-h-62.5 overflow-y-auto pr-2 custom-scrollbar">
                  {!hardware.caffeineLogs || hardware.caffeineLogs.length === 0 ? (
                    <p className="text-xs text-gray-600 italic text-center py-4">No active stimulants detected.</p>
                  ) : (
                    [...hardware.caffeineLogs].reverse().map(log => {
                      const elapsed = (now - log.timestamp) / (1000 * 60 * 60);
                      const current = Math.round(log.amount * Math.pow(0.5, elapsed / 5));
                      return (
                        <div key={log.id} className="flex items-center justify-between p-3 bg-[#0a0a0a] border border-gray-800 rounded-xl group hover:border-gray-700 transition-colors">
                          <div><p className="text-sm font-bold text-gray-300">{log.name}</p><p className="text-[10px] text-gray-500 font-mono mt-0.5">T+ {elapsed.toFixed(1)} hrs</p></div>
                          <div className="flex items-center gap-4"><span className="text-sm font-black text-amber-500/80">{current}mg</span><button onClick={() => dispatch(removeCaffeine(log.id))} className="text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-4 h-4" /></button></div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}