import React, { useState } from 'react';
import { BookOpen, CheckCircle, RotateCcw, BrainCircuit, X, Sparkles, Network, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { reviewCard } from './vaultSlice';
import AddKnowledgeModal from './AddKnowledgeModal';
import TeachBackModal from './TeachBackModal';
export default function KnowledgeVault() {
  const dispatch = useDispatch();
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTeachBackOpen, setIsTeachBackOpen] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  
  // Redux Data
  const cards = useSelector((state) => state.vault.cards) || [];
  const dueCards = cards.filter(card => card.nextReview <= Date.now());
  const masteredCards = cards.filter(card => card.interval > 21).length; // Cards basically in permanent memory
  
  const activeCard = dueCards[0];

  const handleRate = (quality) => {
  
    setIsFlipped(false);
    
    setTimeout(() => {
      dispatch(reviewCard({ id: activeCard.id, quality }));
    }, 300);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8 overflow-y-auto relative">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 z-0 pointer-events-none"></div>

      <div className="max-w-5xl mx-auto space-y-8 relative z-10">
        
        {/* HEADER */}
        <header className="mb-8 border-b border-gray-800 pb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-purple-500" /> 
              Knowledge Vault
            </h1>
            <p className="text-gray-400 mt-2 text-sm uppercase tracking-widest font-mono">
              Hippocampal Spaced Repetition Engine
            </p>
          </div>
          
          <div className="flex items-center gap-6 bg-[#111113] border border-gray-800 p-4 rounded-2xl shadow-lg">
            <div className="text-center pr-6 border-r border-gray-800">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Due Today</p>
              <p className="text-2xl font-black text-purple-500">{dueCards.length}</p>
            </div>
            <div className="text-center pr-6 border-r border-gray-800">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Total Masters</p>
              <p className="text-2xl font-black text-emerald-500">{masteredCards}</p>
            </div>
            <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-purple-600/20 text-purple-400 border border-purple-500/30 font-bold rounded-xl hover:bg-purple-600/30 transition-all">
              <Sparkles className="w-5 h-5" /> Inject Data
            </button>
          </div>
        </header>

        {/* REVIEW ARENA */}
        <div className="flex flex-col items-center mt-12">
          <AnimatePresence mode="wait">
            {dueCards.length > 0 ? (
              <div className="w-full max-w-3xl flex flex-col items-center">
                
                {/* Topic Breadcrumb */}
                <div className="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-purple-400 bg-purple-500/10 px-4 py-2 rounded-full border border-purple-500/20">
                  <Network className="w-4 h-4" /> Source Node: {activeCard.topic || 'General'}
                </div>

                {/* 3D Flipping Card */}
                <div className="relative w-full h-100 perspective-1000" style={{ perspective: '1000px' }}>
                  <motion.div
                    className="w-full h-full relative preserve-3d cursor-pointer"
                    style={{ transformStyle: 'preserve-3d' }}
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ duration: 0.5, type: "spring", stiffness: 260, damping: 20 }}
                    onClick={() => !isFlipped && setIsFlipped(true)}
                  >
                    
                    {/* FRONT OF CARD */}
                    <div className="absolute inset-0 bg-[#111113] border border-gray-700 rounded-3xl p-10 flex flex-col items-center justify-center text-center shadow-2xl backface-hidden" style={{ backfaceVisibility: 'hidden' }}>
                      <BrainCircuit className="w-12 h-12 text-gray-700 mb-6 absolute top-8" />
                      <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                        {activeCard.front}
                      </h2>
                      <p className="absolute bottom-8 text-xs font-bold text-purple-500/70 uppercase tracking-widest animate-pulse flex items-center gap-2">
                        Click to Reveal Neural Pathway
                      </p>
                    </div>

                    {/* BACK OF CARD */}
                    <div className="absolute inset-0 bg-[#111113] border-2 border-purple-500/50 rounded-3xl p-10 flex flex-col items-center justify-center text-center shadow-[0_0_50px_rgba(168,85,247,0.1)] backface-hidden" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                      <div className="absolute top-8 w-full flex justify-between px-10">
                        <h3 className="text-xs font-bold text-purple-500 uppercase tracking-widest">
                          The Answer
                        </h3>
                        
                        {/* Synaptic Strength Visualizer */}
                        <div className="flex items-center gap-2" title={`SM2 Ease Factor: ${activeCard.easeFactor.toFixed(2)}`}>
                           <span className="text-[10px] text-gray-500 uppercase tracking-widest">Synaptic Strength</span>
                           <div className="flex gap-1">
                             {[1,2,3,4].map(i => (
                               <div key={i} className={`w-2 h-4 rounded-sm ${activeCard.easeFactor >= (1.5 + (i*0.3)) ? 'bg-purple-500' : 'bg-gray-800'}`}></div>
                             ))}
                           </div>
                        </div>
                      </div>
                      
                      <p className="text-2xl text-gray-200 leading-relaxed font-medium">
                        {activeCard.back}
                      </p>

                      {/* TEACH-BACK PROTOCOL TRIGGER */}
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation();
                          setIsTeachBackOpen(true); 
                        }}
                        className="absolute bottom-8 flex items-center gap-2 px-6 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-emerald-500/20 transition-all z-20"
                      >
                        <Share2 className="w-4 h-4" /> Teach-Back Protocol
                      </button>

                    </div>
                  </motion.div>
                </div>

                {/* RATING CONTROLS */}
                <div className="h-24 mt-8 w-full flex justify-center">
                  <AnimatePresence>
                    {isFlipped && (
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex gap-4 w-full max-w-2xl">
                        
                        <button onClick={() => handleRate(1)} className="flex-1 py-4 bg-[#111113] border border-red-500/30 hover:border-red-500 hover:bg-red-500/10 rounded-2xl flex flex-col items-center transition-colors group shadow-lg">
                          <X className="w-5 h-5 text-red-500 mb-1" />
                          <span className="text-sm font-bold text-red-500 uppercase tracking-widest">Again</span>
                          <span className="text-[10px] text-gray-500 mt-1 font-mono">&lt; 1m</span>
                        </button>
                        
                        <button onClick={() => handleRate(2)} className="flex-1 py-4 bg-[#111113] border border-orange-500/30 hover:border-orange-500 hover:bg-orange-500/10 rounded-2xl flex flex-col items-center transition-colors shadow-lg">
                          <RotateCcw className="w-5 h-5 text-orange-500 mb-1" />
                          <span className="text-sm font-bold text-orange-500 uppercase tracking-widest">Hard</span>
                          <span className="text-[10px] text-gray-500 mt-1 font-mono">1d</span>
                        </button>

                        <button onClick={() => handleRate(3)} className="flex-1 py-4 bg-[#111113] border border-emerald-500/30 hover:border-emerald-500 hover:bg-emerald-500/10 rounded-2xl flex flex-col items-center transition-colors shadow-lg">
                          <CheckCircle className="w-5 h-5 text-emerald-500 mb-1" />
                          <span className="text-sm font-bold text-emerald-500 uppercase tracking-widest">Good</span>
                          <span className="text-[10px] text-gray-500 mt-1 font-mono">{Math.max(3, Math.round(activeCard.interval * activeCard.easeFactor))}d</span>
                        </button>

                        <button onClick={() => handleRate(4)} className="flex-1 py-4 bg-[#111113] border border-blue-500/30 hover:border-blue-500 hover:bg-blue-500/10 rounded-2xl flex flex-col items-center transition-colors shadow-lg">
                          <BookOpen className="w-5 h-5 text-blue-500 mb-1" />
                          <span className="text-sm font-bold text-blue-500 uppercase tracking-widest">Easy</span>
                          <span className="text-[10px] text-gray-500 mt-1 font-mono">{Math.max(7, Math.round(activeCard.interval * (activeCard.easeFactor + 0.15)))}d</span>
                        </button>

                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

              </div>
            ) : (
              /* EMPTY STATE */
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#111113] border border-gray-800 rounded-3xl p-12 text-center max-w-lg w-full shadow-2xl">
                <div className="w-24 h-24 bg-purple-500/10 border border-purple-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-purple-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Synaptic Pathways Secure</h2>
                <p className="text-gray-400 mb-8 text-sm leading-relaxed">
                  The Hippocampus is fully consolidated for today. <br/>Use the AI Extractor to build new neural pathways from your active Journey nodes.
                </p>
                <button onClick={() => setIsModalOpen(true)} className="px-8 py-4 bg-purple-600/20 text-purple-400 border border-purple-500/50 font-bold rounded-xl hover:bg-purple-600/30 transition-all uppercase tracking-widest text-sm shadow-[0_0_20px_rgba(168,85,247,0.2)] flex items-center justify-center gap-2 mx-auto">
                  <Sparkles className="w-5 h-5" /> Run Neural Extraction
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* MODALS */}
      <AddKnowledgeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <TeachBackModal isOpen={isTeachBackOpen} onClose={() => setIsTeachBackOpen(false)} card={activeCard} />
      
    </div>
  );
}