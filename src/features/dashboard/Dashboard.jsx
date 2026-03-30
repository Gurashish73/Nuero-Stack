import React from 'react';
import { Shield, Brain, Activity, Map as MapIcon, Zap, Flame, CheckCircle, Plus } from 'lucide-react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import UltradianTimer from './UltradianTimer';
import TrifectaRings from './TrifectaRings';
import NoveltyPrompt from './NoveltyPrompt';
import MasterTimeline from './MasterTimeline';

export default function Dashboard() {
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });

  const dueCardsCount = useSelector(state => 
    state.vault?.cards?.filter(c => c.nextReview <= Date.now()).length || 0
  );
  
  const activeNode = useSelector(state => 
    state.journey?.nodes?.find(n => n.status === 'unlocked')
  );

  const { limitlessLevel, currentStreak, shieldActive } = useSelector(state => state.streak) || { limitlessLevel: 1, currentStreak: 0, shieldActive: false };

  const squads = useSelector(state => state.guild?.squads) || [];
  
  const calculateGlobalSync = () => {
    if (squads.length === 0) return 0;
    let totalMembers = 0;
    let checkedIn = 0;
    squads.forEach(squad => {
      if (squad.members) {
        totalMembers += squad.members.length;
        checkedIn += squad.members.filter(m => m.checkedIn).length;
      }
    });
    return totalMembers === 0 ? 0 : Math.round((checkedIn / totalMembers) * 100);
  };

  const neuroSync = calculateGlobalSync();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8">
      
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Command Center</h1>
            <p className="text-gray-400 mt-1">{today} — Optimize your neural symphony.</p>
          </div>
          
          <div className="flex items-center gap-4 bg-[#161618] border border-gray-800 px-5 py-3 rounded-2xl shadow-lg">
            <div className="flex flex-col items-end">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Limitless Level</span>
              <span className="text-lg font-bold text-blue-400">{limitlessLevel}: Cognitive Architect</span>
            </div>
            
            {shieldActive && (
              <>
                <div className="h-8 w-px bg-gray-800 mx-2"></div>
                <div className="flex items-center gap-2 text-amber-400 tooltip" title={`${currentStreak}-Day Streak Achieved: Rest Day Shield Active`}>
                  <Shield className="w-6 h-6 fill-amber-400/20" />
                  <span className="font-bold">Active</span>
                </div>
              </>
            )}
          </div>
        </header>

        {/* QUICK STATS BAR */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          {/* 1. Vault Tracker */}
          <Link to="/vault" className="bg-[#161618] border border-gray-800 p-5 rounded-2xl flex items-center gap-4 hover:border-purple-500/50 transition-all shadow-lg hover:shadow-purple-500/10 group">
            <div className="bg-purple-500/10 p-3 rounded-xl group-hover:scale-110 transition-transform">
              <Brain className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Vault Memory Due</p>
              <p className="text-2xl font-black text-white">
                {dueCardsCount} <span className="text-sm text-gray-400 font-medium">Cards</span>
              </p>
            </div>
          </Link>

          {/* 2. Active Journey Goal */}
          <Link to="/journey" className="bg-[#161618] border border-gray-800 p-5 rounded-2xl flex items-center gap-4 hover:border-cyan-500/50 transition-all shadow-lg hover:shadow-cyan-500/10 group">
            <div className="bg-cyan-500/10 p-3 rounded-xl group-hover:scale-110 transition-transform">
              <MapIcon className="w-6 h-6 text-cyan-500" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Active Neural Objective</p>
              <p className="text-xl font-black text-white truncate">
                {activeNode ? activeNode.title : "All Nodes Cleared"}
              </p>
            </div>
          </Link>

          {/* 3. Neuro-Sync Progress */}
          <Link to="/guild" className="bg-[#161618] border border-gray-800 p-5 rounded-2xl flex items-center gap-4 hover:border-amber-500/50 transition-all shadow-lg hover:shadow-amber-500/10 group">
            <div className="bg-amber-500/10 p-3 rounded-xl group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6 text-amber-500" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-end mb-1">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Global Neuro-Sync</p>
                <span className="text-sm font-bold text-amber-500">{neuroSync}%</span>
              </div>
              <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full relative transition-all duration-1000" style={{ width: `${neuroSync}%` }}>
                  {neuroSync > 0 && <div className="absolute inset-0 bg-white/20 animate-pulse"></div>}
                </div>
              </div>
            </div>
          </Link>
          
        </div>

        {/* MAIN GRID LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <TrifectaRings />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <UltradianTimer />
              <NoveltyPrompt />
            </div>
          </div>

          <div className="lg:col-span-1">
            <MasterTimeline />
          </div>
        </div>
      </div>
    </div>
  );
}