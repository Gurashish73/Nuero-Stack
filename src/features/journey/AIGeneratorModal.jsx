import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Loader2 } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { injectAITree } from './journeySlice';
import { GoogleGenerativeAI } from '@google/generative-ai';

export default function AIGeneratorModal({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;
    
    setIsGenerating(true);
    setError('');

    try {
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        generationConfig: { responseMimeType: "application/json" }
      });

      const prompt = `
        You are an expert learning architect. Create a 5-step learning roadmap for a student wanting to master: "${topic}".
        
        Respond ONLY with a JSON array of 5 objects. Each object must represent a node on a left-to-right visual map.
        
        Each object MUST have exactly these keys:
        - "id": A unique string (e.g., "node-1").
        - "title": The skill title.
        - "description": A short, punchy description of what is learned.
        - "status": The FIRST node must be "unlocked". The remaining four must be "locked".
        - "category": A relevant 1-word category (e.g., "fundamentals", "theory", "practice").
        - "position": An object with "x" and "y" properties. "x" must progress from left to right (e.g., 15, 35, 50, 75, 90). "y" should be between 20 and 80 to create a diamond/branching visual shape.
        - "unlocks": An array of strings containing the "id" of the nodes that this current node connects to. Ensure they link together logically from start to finish.
      `;

      //Callinge API
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      
      //Parse and Inject
      const generatedNodes = JSON.parse(responseText);
      dispatch(injectAITree(generatedNodes));
      
      // Cleanup
      setTopic('');
      onClose();
    } catch (err) {
      console.error(err);
      setError('Neural link failed. Check your API key or try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={!isGenerating ? onClose : null} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40" />
          
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-[#111113] border border-purple-500/30 rounded-3xl shadow-[0_0_50px_rgba(168,85,247,0.15)] z-50 overflow-hidden">
            
            {/* Animated Gradient Border Top */}
            <div className="h-1 w-full bg-linear-to-r from-cyan-500 via-purple-500 to-pink-500 animate-pulse" />

            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-purple-500" />
                  <h2 className="text-2xl font-black text-white tracking-tight">AI Auto-Router</h2>
                </div>
                {!isGenerating && (
                  <button onClick={onClose} className="p-2 text-gray-500 hover:text-white bg-gray-900 rounded-full">
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              <p className="text-gray-400 mb-6 leading-relaxed">
                Enter any skill, concept, or discipline. The AI will instantly architect a 5-step neural topology to guide your mastery.
              </p>

              <form onSubmit={handleGenerate} className="space-y-4">
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Quantum Physics, Next.js, or Video Editing..."
                  disabled={isGenerating}
                  className="w-full bg-[#0a0a0a] border border-gray-800 rounded-xl p-4 text-white text-lg focus:border-purple-500 outline-none disabled:opacity-50"
                  autoFocus
                />
                
                {error && <p className="text-red-500 text-sm font-bold">{error}</p>}

                <button
                  type="submit"
                  disabled={!topic.trim() || isGenerating}
                  className="w-full flex items-center justify-center gap-3 py-4 bg-purple-600 text-white rounded-xl font-black hover:bg-purple-500 disabled:opacity-50 transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)] uppercase tracking-widest mt-4"
                >
                  {isGenerating ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Architecting Topology...</>
                  ) : (
                    <><Sparkles className="w-5 h-5" /> Generate Roadmap</>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}