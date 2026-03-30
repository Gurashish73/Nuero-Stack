import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BrainCircuit, Plus, Sparkles, Network, Loader2, Search } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { addCard, injectAICards } from './vaultSlice';
import { GoogleGenerativeAI } from '@google/generative-ai';

export default function AddKnowledgeModal({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const journeyNodes = useSelector(state => state.journey.nodes);
  
  // 3 Modes: 'journey', 'search', or 'manual'
  const [mode, setMode] = useState('journey'); 
  
  // States
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [selectedNodeId, setSelectedNodeId] = useState('');
  const [customTopic, setCustomTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const availableNodes = journeyNodes.filter(n => n.status !== 'locked');

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!front.trim() || !back.trim()) return;
    dispatch(addCard({ front, back, topic: 'Manual Entry' }));
    setFront('');
    setBack('');
    onClose();
  };

  //REUSABLE AI ENGINE
  const generateCardsFromAI = async (promptText, topicLabel) => {
    setIsGenerating(true);
    try {
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        generationConfig: { responseMimeType: "application/json" }
      });

      const result = await model.generateContent(promptText);
      const parsedCards = JSON.parse(result.response.text());

      dispatch(injectAICards({ cards: parsedCards, topic: topicLabel }));
      
      // Reset inputs
      setCustomTopic('');
      setSelectedNodeId('');
      onClose();
    } catch (error) {
      console.error("AI Extraction Failed:", error);
      alert("Neural link failed. Ensure your API key is valid and try a different topic.");
    } finally {
      setIsGenerating(false);
    }
  };

  // PATH 1: Journey Extraction
  const handleJourneyAIGenerate = async (e) => {
    e.preventDefault();
    if (!selectedNodeId) return;

    const node = journeyNodes.find(n => n.id === selectedNodeId);
    if (!node) return;

    const prompt = `
      I am a Computer Science student studying the concept: "${node.title}".
      Description: "${node.description}".

      Generate EXACTLY 5 high-yield spaced repetition flashcards covering the core technical concepts of this topic.
      Make the questions direct and the answers concise but highly accurate.

      Respond ONLY with a raw JSON array of objects, where each object has exactly these keys:
      - "front": The question.
      - "back": The answer.
    `;
    await generateCardsFromAI(prompt, node.title);
  };

  // PATH 2: Custom Deep Search
  const handleCustomSearchAIGenerate = async (e) => {
    e.preventDefault();
    if (!customTopic.trim()) return;

    const prompt = `
      I am a student studying the concept: "${customTopic}".

      Generate EXACTLY 5 high-yield spaced repetition flashcards covering the core technical concepts of this topic.
      Make the questions direct and the answers concise but highly accurate.

      Respond ONLY with a raw JSON array of objects, where each object has exactly these keys:
      - "front": The question.
      - "back": The answer.
    `;
    await generateCardsFromAI(prompt, customTopic);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={!isGenerating ? onClose : undefined} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40" />

          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-[#111113] border border-purple-500/30 rounded-3xl shadow-[0_0_50px_rgba(168,85,247,0.15)] z-50 overflow-hidden">
            
            <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-[#0a0a0a]">
              <div className="flex items-center gap-3">
                <BrainCircuit className="w-6 h-6 text-purple-500" />
                <h2 className="text-xl font-bold text-white tracking-wide">Inject Knowledge</h2>
              </div>
              {!isGenerating && <button onClick={onClose} className="p-2 text-gray-500 hover:text-white bg-gray-900 rounded-full"><X className="w-5 h-5" /></button>}
            </div>

            {/* THREE-WAY TABS */}
            <div className="flex border-b border-gray-800">
              <button onClick={() => setMode('journey')} className={`flex-1 py-3 text-[10px] sm:text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors ${mode === 'journey' ? 'bg-purple-600/10 text-purple-400 border-b-2 border-purple-500' : 'text-gray-500 hover:text-gray-300 hover:bg-[#161618]'}`}>
                <Network className="w-4 h-4" /> Journey
              </button>
              <button onClick={() => setMode('search')} className={`flex-1 py-3 text-[10px] sm:text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors ${mode === 'search' ? 'bg-cyan-600/10 text-cyan-400 border-b-2 border-cyan-500' : 'text-gray-500 hover:text-gray-300 hover:bg-[#161618]'}`}>
                <Search className="w-4 h-4" /> Deep Search
              </button>
              <button onClick={() => setMode('manual')} className={`flex-1 py-3 text-[10px] sm:text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors ${mode === 'manual' ? 'bg-blue-600/10 text-blue-400 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-300 hover:bg-[#161618]'}`}>
                <Plus className="w-4 h-4" /> Manual
              </button>
            </div>

            {/* RENDER CONTENT BASED ON MODE */}
            <div className="p-6">
              
              {/* MODE 1: JOURNEY */}
              {mode === 'journey' && (
                <form onSubmit={handleJourneyAIGenerate} className="space-y-6">
                  <p className="text-sm text-gray-400 mb-2">Extract core concepts directly from your active Journey map.</p>
                  <div>
                    <label className="block text-xs font-bold text-purple-500 uppercase tracking-widest mb-3">Select Target Node</label>
                    {availableNodes.length === 0 ? (
                      <div className="bg-[#0a0a0a] p-4 rounded-xl border border-red-500/30 text-red-400 text-sm font-bold text-center">No nodes unlocked. Go unlock a skill first!</div>
                    ) : (
                      <select 
                        value={selectedNodeId} 
                        onChange={(e) => setSelectedNodeId(e.target.value)}
                        className="w-full bg-[#0a0a0a] border border-gray-800 rounded-xl p-4 text-white focus:border-purple-500 outline-none appearance-none cursor-pointer"
                      >
                        <option value="" disabled>-- Select a Journey Node --</option>
                        {availableNodes.map(node => (
                          <option key={node.id} value={node.id}>{node.title} ({node.status})</option>
                        ))}
                      </select>
                    )}
                  </div>
                  <button type="submit" disabled={!selectedNodeId || isGenerating} className="w-full flex items-center justify-center gap-2 py-4 bg-purple-600 text-white rounded-xl font-black hover:bg-purple-500 disabled:opacity-50 uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                    {isGenerating ? <><Loader2 className="w-5 h-5 animate-spin" /> Mining Matrix...</> : <><Sparkles className="w-5 h-5" /> Generate Deck</>}
                  </button>
                </form>
              )}

              {/* MODE 2: CUSTOM DEEP SEARCH */}
              {mode === 'search' && (
                <form onSubmit={handleCustomSearchAIGenerate} className="space-y-6">
                  <p className="text-sm text-gray-400 mb-2">Curious about something off the path? Let the Oracle extract the knowledge.</p>
                  <div>
                    <label className="block text-xs font-bold text-cyan-500 uppercase tracking-widest mb-3">Custom Topic</label>
                    <input 
                      type="text"
                      value={customTopic}
                      onChange={(e) => setCustomTopic(e.target.value)}
                      placeholder="e.g., Docker Containers, The Krebs Cycle, React Context API..."
                      className="w-full bg-[#0a0a0a] border border-gray-800 rounded-xl p-4 text-white focus:border-cyan-500 outline-none"
                      autoFocus
                    />
                  </div>
                  <button type="submit" disabled={!customTopic.trim() || isGenerating} className="w-full flex items-center justify-center gap-2 py-4 bg-cyan-600 text-black rounded-xl font-black hover:bg-cyan-500 disabled:opacity-50 uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                    {isGenerating ? <><Loader2 className="w-5 h-5 animate-spin" /> Mining Matrix...</> : <><Search className="w-5 h-5" /> Deep Search & Extract</>}
                  </button>
                </form>
              )}

              {/* MODE 3: MANUAL */}
              {mode === 'manual' && (
                <form onSubmit={handleManualSubmit} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-blue-500 uppercase tracking-widest mb-2">The Concept (Front)</label>
                    <textarea value={front} onChange={(e) => setFront(e.target.value)} placeholder="e.g., What is an IIFE?" className="w-full bg-[#0a0a0a] border border-gray-800 rounded-xl p-3 text-white focus:border-blue-500 outline-none resize-none h-20" autoFocus />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-blue-500 uppercase tracking-widest mb-2">The Answer (Back)</label>
                    <textarea value={back} onChange={(e) => setBack(e.target.value)} placeholder="Immediately Invoked Function Expression..." className="w-full bg-[#0a0a0a] border border-gray-800 rounded-xl p-3 text-gray-300 focus:border-blue-500 outline-none resize-none h-24" />
                  </div>
                  <button type="submit" disabled={!front.trim() || !back.trim()} className="w-full flex items-center justify-center gap-2 py-4 bg-blue-600 text-white rounded-xl font-black hover:bg-blue-500 disabled:opacity-50 uppercase tracking-widest transition-colors">
                    <Plus className="w-5 h-5" /> Add to Vault
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}