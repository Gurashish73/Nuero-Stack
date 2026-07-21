import React, { useState } from 'react';
import { Cpu, Activity, Zap, Loader2, Lock, ShieldAlert, Crosshair, Unlock, GitBranch } from 'lucide-react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { generateJSON } from '../../services/gemini';

export default function TheOracle() {
  const currentUser = useSelector((state) => state.auth.user);
  const hardware = useSelector((state) => state.hardware) || {};
  const guild = useSelector((state) => state.guild) || { squads: [] };
  const journey = useSelector((state) => state.journey) || { nodes: [] };
  const vault = useSelector((state) => state.vault) || { cards: [] }; 

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [auditResult, setAuditResult] = useState(null);

  const isSunday = new Date().getDay() === 0;

  const calculateActiveCaffeine = () => {
    if (!hardware.caffeineLogs || hardware.caffeineLogs.length === 0) return 0;
    const now = Date.now();
    let current = 0;
    hardware.caffeineLogs.forEach(log => {
      const elapsedHours = (now - log.timestamp) / (1000 * 60 * 60);
      const remaining = log.amount * Math.pow(0.5, elapsedHours / 5);
      if (remaining > 1) current += remaining; 
    });
    return Math.round(current);
  };

  const getGuildSync = () => {
    if (!guild.squads || guild.squads.length === 0) return 0;
    let totalMembers = 0;
    let checkedIn = 0;
    guild.squads.forEach(squad => {
      if (squad.members) {
        totalMembers += squad.members.length;
        checkedIn += squad.members.filter(m => m.checkedIn).length;
      }
    });
    return totalMembers === 0 ? 0 : Math.round((checkedIn / totalMembers) * 100);
  };

  const handleRunAudit = async () => {
    setIsAnalyzing(true);
    try {
      const activeCaffeine = calculateActiveCaffeine();
      const squadSync = getGuildSync();
      const masteredCards = vault.cards?.filter(c => c.interval > 21).length || 0;
      const totalNodes = journey.nodes?.length || 0;
      const completedNodes = journey.nodes?.filter(n => n.status === 'completed').length || 0;

      const prompt = `
        You are THE ORACLE, the master intelligence governing the Limitless OS. 
        Your user is ${currentUser?.name || 'Operative'}, a high-performing Computer Science Undergrad on a strict dopamine-detox.
        
        Analyze this weekly biological and cognitive snapshot:
        - Average Sleep Logged: ${hardware.sleepHours || 0} hours
        - Active Blood Caffeine (End of Week): ${activeCaffeine} mg
        - Hydration Baseline: ${hardware.waterIntake || 0} glasses
        - BDNF Synthesis (Exercise): ${hardware.exercised ? 'Active' : 'Dormant'}
        - Synaptic Mastery: ${masteredCards} flashcards permanently consolidated.
        - Macro Journey Progress: ${completedNodes}/${totalNodes} skill nodes completed.
        - Co-op Network Sync: ${squadSync}%.

        You are ruthless and highly clinical. Generate a Weekly Neuro-Audit.
        
        Respond EXACTLY with a raw JSON object using these exact keys:
        {
          "brutal_truth": "A ruthless 2-sentence assessment of my discipline and failures this week.",
          "hidden_correlation": "A 2-sentence hypothesis linking one of my biological metrics (like sleep or caffeine) to a cognitive outcome (like flashcard mastery or squad sync).",
          "protocol_adjustment": "One strict, non-negotiable command I must follow next week to optimize performance."
        }
      `;

      const parsedAudit = await generateJSON(prompt);
      setAuditResult(parsedAudit);

      if (currentUser) {
        await setDoc(doc(db, 'users', currentUser.uid, 'weekly_audits', Date.now().toString()), {
          audit: parsedAudit,
          timestamp: Date.now()
        });
      }
    } catch (error) {
      console.error("Audit Failed:", error);
      alert("Neural Link Severed. Unable to process audit.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="h-screen bg-[#0a0a0a] text-white p-8 flex flex-col relative overflow-y-auto">
      <div className="max-w-4xl mx-auto w-full flex flex-col flex-1 relative z-10">
        <header className="flex items-center justify-between border-b border-gray-800 pb-6 mb-12">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-purple-500/10 rounded-2xl border border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.15)]">
              <Cpu className="w-8 h-8 text-purple-500" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-white uppercase">The Oracle</h1>
              <p className="text-purple-400 font-mono text-sm mt-1 flex items-center gap-2">
                <Zap className="w-4 h-4" /> Weekly Macro-Analysis Engine
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">System Status</p>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${isSunday ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
              {isSunday ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
              <span className="text-xs font-bold uppercase tracking-widest">{isSunday ? 'Audit Unlocked' : 'Time-Gated'}</span>
            </div>
          </div>
        </header>

        {!isSunday ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex-1 flex flex-col items-center justify-center text-center max-w-lg mx-auto">
            <div className="w-24 h-24 bg-[#111113] border-2 border-gray-800 rounded-full flex items-center justify-center mb-6">
              <Lock className="w-10 h-10 text-gray-600" />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-widest text-white mb-4">Macro-Analysis Locked</h2>
            <p className="text-gray-400 leading-relaxed">
              The Oracle only processes data on <strong className="text-white">Sundays</strong>. 
              Daily checking breeds neurosis. Execute your daily protocols, trust the system, and return here at the end of the week.
            </p>
          </motion.div>
        ) : (
          <div className="flex-1 flex flex-col">
            {!auditResult ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center text-center max-w-xl mx-auto">
                <div className="w-24 h-24 bg-purple-500/10 border-2 border-purple-500/30 rounded-full flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(168,85,247,0.2)]">
                  <Activity className="w-10 h-10 text-purple-500" />
                </div>
                <h2 className="text-2xl font-black uppercase tracking-widest text-white mb-4">Ready for Synthesis</h2>
                <button 
                  onClick={handleRunAudit} 
                  disabled={isAnalyzing}
                  className="w-full py-5 bg-purple-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-purple-500 transition-all flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(168,85,247,0.3)] disabled:opacity-50"
                >
                  {isAnalyzing ? (
                    <><Loader2 className="w-6 h-6 animate-spin" /> Compressing Telemetry...</>
                  ) : (
                    <><Cpu className="w-6 h-6" /> Initialize Weekly Neuro-Audit</>
                  )}
                </button>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                <div className="bg-[#111113] border border-red-500/30 rounded-3xl p-8 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                  <div className="flex items-center gap-3 mb-4">
                    <ShieldAlert className="w-6 h-6 text-red-500" />
                    <h3 className="text-sm font-bold text-red-500 uppercase tracking-widest">The Brutal Truth</h3>
                  </div>
                  <p className="text-lg text-gray-300 leading-relaxed font-medium">{auditResult.brutal_truth}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-[#111113] border border-cyan-500/30 rounded-3xl p-8 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500"></div>
                    <div className="flex items-center gap-3 mb-4">
                      <GitBranch className="w-6 h-6 text-cyan-500" />
                      <h3 className="text-sm font-bold text-cyan-500 uppercase tracking-widest">Hidden Correlation</h3>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed">{auditResult.hidden_correlation}</p>
                  </div>

                  <div className="bg-[#111113] border border-amber-500/30 rounded-3xl p-8 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
                    <div className="flex items-center gap-3 mb-4">
                      <Crosshair className="w-6 h-6 text-amber-500" />
                      <h3 className="text-sm font-bold text-amber-500 uppercase tracking-widest">Protocol Adjustment</h3>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed font-bold">{auditResult.protocol_adjustment}</p>
                  </div>
                </div>

                <button 
                  onClick={() => setAuditResult(null)} 
                  className="mt-8 px-6 py-3 bg-[#111113] border border-gray-800 text-gray-500 hover:text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all mx-auto flex"
                >
                  Acknowledge & Dismiss
                </button>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}