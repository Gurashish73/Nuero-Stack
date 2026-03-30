import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share2, Users, Loader2, BrainCircuit } from 'lucide-react';
import { useSelector } from 'react-redux';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../config/firebase';

export default function TeachBackModal({ isOpen, onClose, card }) {
  const currentUser = useSelector(state => state.auth.user);
  const squads = useSelector(state => state.guild.squads) || [];
  
  const [selectedSquadId, setSelectedSquadId] = useState('');
  const [explanation, setExplanation] = useState('');
  const [isTransmitting, setIsTransmitting] = useState(false);

  if (!card) return null;

  const handleTransmit = async (e) => {
    e.preventDefault();
    if (!selectedSquadId || !explanation.trim() || !currentUser) return;

    setIsTransmitting(true);
    try {
      const squadRef = doc(db, 'squads', selectedSquadId);
      
      const logMessage = `🧠 ${currentUser.name} executed a Teach-Back on: "${card.front}"`;
      
      //Drop the concept into the Arsenal
      const arsenalDrop = {
        id: Date.now(),
        title: `🧠 ${currentUser.name}'s Synthesis: ${card.front}`,
        url: `https://www.google.com/search?q=${encodeURIComponent(card.front)}`, // Option A: Google Redirect
        description: explanation, // Option B: Your actual written synthesis
        type: 'teach-back'
      };

      await updateDoc(squadRef, {
        logs: arrayUnion({ message: logMessage, time: Date.now() }),
        arsenal: arrayUnion(arsenalDrop)
      });

      // Clear the form and close
      setExplanation('');
      setSelectedSquadId('');
      onClose();
    } catch (error) {
      console.error("Transmission Failed:", error);
      alert("Neural link severed. Failed to transmit to squad.");
    } finally {
      setIsTransmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={!isTransmitting ? onClose : undefined} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40" />
          
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-[#111113] border border-emerald-500/30 rounded-3xl shadow-[0_0_50px_rgba(16,185,129,0.15)] z-50 overflow-hidden">
            
            <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-[#0a0a0a]">
              <div className="flex items-center gap-3">
                <Share2 className="w-6 h-6 text-emerald-500" />
                <h2 className="text-xl font-bold text-white tracking-wide">Teach-Back Protocol</h2>
              </div>
              {!isTransmitting && <button onClick={onClose} className="p-2 text-gray-500 hover:text-white bg-gray-900 rounded-full"><X className="w-5 h-5" /></button>}
            </div>

            <form onSubmit={handleTransmit} className="p-6 space-y-6">
              
              {/* Concept Overview */}
              <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-4">
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1 flex items-center gap-2"><BrainCircuit className="w-3 h-3"/> Target Concept</p>
                <p className="text-sm font-bold text-white mb-2">{card.front}</p>
                <p className="text-xs text-gray-400 border-t border-gray-800/50 pt-2">{card.back}</p>
              </div>

              {/* Squad Selection */}
              <div>
                <label className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-3 flex items-center gap-2"><Users className="w-4 h-4"/> Select Receiving Node</label>
                {squads.length === 0 ? (
                  <div className="text-xs text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20">You are not integrated into any Squads. Join The Guild first.</div>
                ) : (
                  <select value={selectedSquadId} onChange={(e) => setSelectedSquadId(e.target.value)} className="w-full bg-[#0a0a0a] border border-gray-800 rounded-xl p-3 text-sm text-white focus:border-emerald-500 outline-none appearance-none cursor-pointer">
                    <option value="" disabled>-- Select a Squad --</option>
                    {squads.map(squad => (
                      <option key={squad.id} value={squad.id}>{squad.name}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Explanation */}
              <div>
                <label className="block text-xs font-bold text-emerald-500 uppercase tracking-widest mb-3">Your Synthesis</label>
                <p className="text-xs text-gray-500 mb-2 leading-relaxed">Explain this concept in your own words using an analogy. This forces hippocampal encoding.</p>
                <textarea 
                  value={explanation} 
                  onChange={(e) => setExplanation(e.target.value)} 
                  placeholder="e.g., 'Neuroplasticity is like clearing a path in a dense forest. The more you walk it, the easier it gets to navigate...'" 
                  className="w-full bg-[#0a0a0a] border border-gray-800 rounded-xl p-4 text-sm text-white focus:border-emerald-500 outline-none resize-none h-24" 
                />
              </div>

              <button type="submit" disabled={!selectedSquadId || !explanation.trim() || isTransmitting} className="w-full flex items-center justify-center gap-2 py-4 bg-emerald-600 text-black rounded-xl font-black hover:bg-emerald-500 disabled:opacity-50 uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                {isTransmitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Transmitting...</> : <><Share2 className="w-5 h-5" /> Execute Teach-Back</>}
              </button>

            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}