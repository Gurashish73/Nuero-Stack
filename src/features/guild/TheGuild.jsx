import React, { useState, useEffect } from 'react';
import { motion} from 'framer-motion';
import { Users, Shield, Zap, Globe, Lock, Hexagon, Trophy, Edit3, Trash2, CheckCircle, Link as LinkIcon, Plus, ExternalLink, X, Radio, LogOut } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { toggleDeepWork, setSquads } from './guildSlice';
import SquadModal from './SquadModal';

import { collection, onSnapshot, doc, updateDoc, deleteDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../config/firebase';

export default function TheGuild() {
  const dispatch = useDispatch();

  const { deepWorkMode, squads } = useSelector((state) => state.guild);
  const currentUser = useSelector((state) => state.auth.user); 
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [squadToEdit, setSquadToEdit] = useState(null);
  
  const [quickTitle, setQuickTitle] = useState(''); 
  const [quickLink, setQuickLink] = useState(''); 
  const [activeInputSquad, setActiveInputSquad] = useState(null); 

  //LIVE GLOBAL LEADERBOARD STATE
  const [liveLeaderboard, setLiveLeaderboard] = useState([]);

  useEffect(() => {
    if (!currentUser?.uid) return;

    const unsubscribe = onSnapshot(collection(db, 'squads'), (snapshot) => {
      const allSquads = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const mySquads = allSquads.filter(squad => 
        squad.ownerId === currentUser.uid || 
        squad.members?.some(m => m.uid === currentUser.uid)
      );

      dispatch(setSquads(mySquads));
    });

    return () => unsubscribe();
  }, [dispatch, currentUser]);

  //REAL-TIME GLOBAL LEADERBOARD LISTENER
  useEffect(() => {
    const unsubscribeDir = onSnapshot(collection(db, 'directory'), (snapshot) => {
      const usersData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          uid: doc.id,
          name: data.name || `Agent ${doc.id.substring(0,4)}`,
          score: data.score || 0,
          isUser: doc.id === currentUser?.uid
        };
      });
      setLiveLeaderboard(usersData);
    });

    return () => unsubscribeDir();
  }, [currentUser]);

  const sortedLeaderboard = [...liveLeaderboard].sort((a, b) => b.score - a.score);

  const calculateSync = (members) => {
    if (!members || members.length === 0) return 0;
    const checkedInCount = members.filter(m => m.checkedIn).length;
    return Math.round((checkedInCount / members.length) * 100);
  };

  const handleDelete = async (squad) => {
    if (squad.ownerId !== currentUser?.uid) {
      alert("Unauthorized: Only the Squad Commander can disband the squad.");
      return;
    }
    if (window.confirm("Disband this squad? This action is permanent across all devices.")) {
      await deleteDoc(doc(db, 'squads', squad.id));
    }
  };

  const handleLeaveSquad = async (squad) => {
    if (window.confirm("Are you sure you want to desert this squad?")) {
      const updatedMembers = squad.members.filter(m => m.uid !== currentUser?.uid);
      const logMessage = `${currentUser?.name || 'An operative'} deserted the squad.`;

      await updateDoc(doc(db, 'squads', squad.id), { 
        members: updatedMembers,
        logs: arrayUnion({ message: logMessage, time: Date.now() })
      });
    }
  };

  const handleToggleCheckIn = async (squad, member) => {
    const isSelf = member.uid === currentUser?.uid;
    const isOwner = squad.ownerId === currentUser?.uid;
    const isGuest = !member.uid;

    if (!isSelf && !(isOwner && isGuest)) {
      alert("Unauthorized: You can only verify your own protocol, or manage guests if you are the Squad Commander.");
      return;
    }

    const isNowVerified = !member.checkedIn;
    const updatedMembers = squad.members.map(m => 
      m.name === member.name ? { ...m, checkedIn: isNowVerified } : m
    );

    let logMessage = `${member.name} ${isNowVerified ? 'verified their protocol.' : 'revoked verification.'}`;
    if (isOwner && isGuest) {
      logMessage = `Commander verified protocol for guest: ${member.name}.`;
    }

    await updateDoc(doc(db, 'squads', squad.id), { 
      members: updatedMembers,
      logs: arrayUnion({ message: logMessage, time: Date.now() })
    });
  };

  const handleQuickAddLink = async (e, squad) => {
    e.preventDefault();
    if (!quickLink.trim() || !quickTitle.trim()) return;

    const newResource = { id: Date.now(), title: quickTitle, url: quickLink };
    const updatedArsenal = squad.arsenal ? [...squad.arsenal, newResource] : [newResource];
    
    const logMessage = `Dropped new asset: ${quickTitle}`;

    await updateDoc(doc(db, 'squads', squad.id), { 
      arsenal: updatedArsenal,
      logs: arrayUnion({ message: logMessage, time: Date.now() })
    });
    
    setQuickTitle('');
    setQuickLink('');
    setActiveInputSquad(null);
  };

  const handleDeleteResource = async (squad, resourceId) => {
    const updatedArsenal = squad.arsenal.filter(r => r.id !== resourceId);
    await updateDoc(doc(db, 'squads', squad.id), { arsenal: updatedArsenal });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8 overflow-y-auto relative">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 z-0 pointer-events-none"></div>

      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-gray-800 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
              <Users className="w-8 h-8 text-emerald-500" /> The Guild
            </h1>
            <p className="text-gray-400 mt-2 text-lg">Live Multiplayer Sync & Telemetry Active.</p>
          </div>
          <button onClick={() => dispatch(toggleDeepWork())} className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-bold transition-all shadow-lg ${deepWorkMode ? 'bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 'bg-[#161618] border border-gray-700 text-gray-400 hover:border-gray-500'}`}>
            {deepWorkMode ? <Lock className="w-5 h-5" /> : <Globe className="w-5 h-5" />}
            {deepWorkMode ? 'Isolation Protocol Active' : 'Global Comms Open'}
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Hexagon className="w-5 h-5 text-gray-500" />
              <h2 className="text-xl font-bold text-white tracking-widest uppercase">Active Networks</h2>
            </div>

            <div className="grid grid-cols-1 gap-6"> 
              {squads.map((squad) => {
                const syncLevel = calculateSync(squad.members);
                const isPerfectSync = syncLevel === 100;
                
                const latestLog = squad.logs && squad.logs.length > 0 
                  ? [...squad.logs].sort((a,b) => b.time - a.time)[0] 
                  : null;

                const isOwner = squad.ownerId === currentUser?.uid;
                const isMember = squad.members?.some(m => m.uid === currentUser?.uid);

                return (
                  <motion.div key={squad.id} className={`bg-[#111113] border rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col transition-all duration-500 ${isPerfectSync ? 'border-amber-400/50 shadow-[0_0_30px_rgba(251,191,36,0.1)]' : 'border-gray-800'}`}>
                    <div className={`absolute bottom-0 left-0 h-1 transition-all duration-1000 ${isPerfectSync ? 'bg-amber-400' : 'bg-emerald-500/50'}`} style={{ width: `${syncLevel}%` }}></div>

                    <div className="flex justify-between items-start mb-6">
                      <div className="pr-4">
                        <div className="flex items-center gap-3">
                           <h3 className={`text-2xl font-black tracking-tight ${isPerfectSync ? 'text-amber-400' : 'text-emerald-400'}`}>{squad.name}</h3>
                           <span className="text-[10px] font-bold px-3 py-1 rounded-full border bg-gray-900 border-gray-700 text-gray-300 uppercase tracking-widest">{squad.status}</span>
                        </div>
                        <p className="text-sm text-gray-500 uppercase tracking-widest mt-1.5">{squad.focus}</p>
                      </div>
                      
                      <div className="flex gap-2">
                        {isOwner ? (
                          <>
                            <button onClick={() => { setSquadToEdit(squad); setIsModalOpen(true); }} className="p-2.5 bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700 rounded-xl transition-colors" title="Edit Squad Specs"><Edit3 className="w-4 h-4" /></button>
                            <button onClick={() => handleDelete(squad)} className="p-2.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-xl transition-colors" title="Disband Squad"><Trash2 className="w-4 h-4" /></button>
                          </>
                        ) : isMember ? (
                          <button onClick={() => handleLeaveSquad(squad)} className="p-2.5 bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 rounded-xl transition-colors" title="Leave Squad"><LogOut className="w-4 h-4" /></button>
                        ) : null}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 mb-6">
                      <div className="flex flex-col">
                        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-3 border-b border-gray-800/50 pb-2">Daily Protocol Verification</p>
                        <div className="flex flex-col gap-2 flex-1">
                          {Array.isArray(squad.members) && squad.members.map((member, idx) => {
                            const canVerify = member.uid === currentUser?.uid || (!member.uid && squad.ownerId === currentUser?.uid);

                            return (
                              <div key={idx} className="flex justify-between items-center bg-[#161618] border border-gray-800 px-4 py-2.5 rounded-xl">
                                <span className={`text-sm font-bold ${member.checkedIn ? 'text-gray-300' : 'text-gray-500'}`}>
                                  {member.name} {member.uid === currentUser?.uid && '(You)'}
                                </span>
                                <button 
                                  onClick={() => handleToggleCheckIn(squad, member)}
                                  disabled={!canVerify}
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all uppercase tracking-widest 
                                    ${member.checkedIn 
                                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                      : 'bg-transparent text-gray-500 border border-gray-700'} 
                                    ${canVerify ? 'hover:border-emerald-500/50 hover:text-emerald-400 cursor-pointer' : 'opacity-50 cursor-not-allowed'}
                                  `}
                                >
                                  <CheckCircle className="w-3.5 h-3.5" /> {member.checkedIn ? 'Verified' : 'Verify'}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="bg-[#161618] border border-gray-800 rounded-2xl p-4 flex flex-col h-full">
                        <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-3 flex items-center gap-2 border-b border-gray-800/50 pb-2"><LinkIcon className="w-3.5 h-3.5" /> The Arsenal</p>
                        <div className="flex-1 overflow-y-auto space-y-2 mb-4 pr-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                          {(!squad.arsenal || squad.arsenal.length === 0) ? (
                            <p className="text-xs text-gray-600 italic mt-2 text-center">No assets dropped yet.</p>
                          ) : (
                            squad.arsenal.map(link => (
                              <div key={link.id} className="flex flex-col group bg-[#0a0a0a] border border-gray-800 p-3 rounded-xl hover:border-emerald-500/50 transition-colors relative">
                                <div className="flex items-start justify-between mb-1">
                                  <a href={link.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 flex-1 overflow-hidden text-gray-400 hover:text-emerald-400 transition-colors">
                                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                                    <span className="text-sm font-bold truncate">{link.title}</span>
                                  </a>
                                  <button onClick={() => handleDeleteResource(squad, link.id)} className="text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 -mt-1 -mr-1">
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                                
                                {link.description && (
                                  <div className="mt-2 text-xs text-gray-400 italic border-l-2 border-emerald-500/30 pl-3 py-1 bg-[#111113]/50 rounded-r-lg">
                                    "{link.description}"
                                  </div>
                                )}
                              </div>
                            ))
                          )}
                        </div>

                        <form onSubmit={(e) => handleQuickAddLink(e, squad)} className="flex flex-col gap-2 mt-auto pt-3 border-t border-gray-800/50">
                          <input type="text" placeholder="Resource Title..." value={activeInputSquad === squad.id ? quickTitle : ''} onChange={(e) => { setQuickTitle(e.target.value); setActiveInputSquad(squad.id); }} className="w-full bg-[#0a0a0a] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none" required />
                          <div className="flex gap-2">
                            <input type="url" placeholder="https://..." value={activeInputSquad === squad.id ? quickLink : ''} onChange={(e) => { setQuickLink(e.target.value); setActiveInputSquad(squad.id); }} className="flex-1 bg-[#0a0a0a] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none" required />
                            <button type="submit" className="bg-emerald-600/20 text-emerald-400 px-3 py-2 rounded-xl hover:bg-emerald-500/30 transition-colors border border-emerald-500/30"><Plus className="w-4 h-4" /></button>
                          </div>
                        </form>
                      </div>
                    </div>

                    <div className="mt-2 bg-[#0a0a0a] rounded-xl px-4 py-3 border border-gray-800 flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
                        <span className="font-mono">
                          {latestLog ? latestLog.message : "Awaiting squad telemetry..."}
                        </span>
                      </div>
                      <span className={`text-sm font-black ${isPerfectSync ? 'text-amber-400' : 'text-emerald-500'}`}>
                        {syncLevel}% SYNC
                      </span>
                    </div>

                  </motion.div>
                );
              })}

              <button onClick={() => { setSquadToEdit(null); setIsModalOpen(true); }} className="bg-[#111113]/50 border-2 border-dashed border-gray-800 rounded-3xl p-6 flex items-center justify-center gap-3 text-gray-500 hover:text-emerald-400 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all">
                <Users className="w-6 h-6" />
                <span className="font-bold tracking-widest uppercase text-sm">Form New Squad</span>
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {deepWorkMode ? (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-emerald-500/5 border border-emerald-500/30 rounded-3xl p-8 text-center flex flex-col items-center justify-center h-full min-h-100">
                <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6"><Shield className="w-10 h-10 text-emerald-400" /></div>
                <h3 className="text-xl font-bold text-white mb-2">Social Feed Disabled</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-6">Isolation Protocol is active. Global leaderboards are hidden to protect your dopamine baseline.</p>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-[#111113] border border-gray-800 rounded-3xl p-6 shadow-xl h-full">
                <div className="flex items-center gap-2 mb-6 border-b border-gray-800 pb-4">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  <h2 className="text-lg font-bold text-white tracking-widest uppercase">Global Rank</h2>
                </div>
                <div className="space-y-4">
                  {sortedLeaderboard.map((player, index) => (
                    <div key={index} className={`flex items-center justify-between p-3 rounded-xl border ${player.isUser ? 'bg-emerald-500/10 border-emerald-500/50' : 'bg-[#1a1a1c] border-transparent'}`}>
                      <div className="flex items-center gap-4">
                        <span className={`font-black ${index === 0 ? 'text-amber-500' : 'text-gray-500'}`}>#{index + 1}</span>
                        <span className={`font-bold ${player.isUser ? 'text-emerald-400' : 'text-white'}`}>{player.name}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-400"><Zap className="w-3 h-3 text-amber-500" /><span className="font-mono text-sm">{player.score}</span></div>
                    </div>
                  ))}
                  
                  {sortedLeaderboard.length === 0 && (
                    <p className="text-xs text-gray-500 text-center italic mt-4">Matrix empty. Awaiting operative data...</p>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
      <SquadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} initialData={squadToEdit} />
    </div>
  );
}