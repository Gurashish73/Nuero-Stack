import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { Lock, Check, ChevronRight, Activity, X, Plus, Sparkles } from 'lucide-react';
import { completeNode, dismissCrossTraining } from './journeySlice';
import AddNodeModal from './AddNodeModal';
import AIGeneratorModal from './AIGeneratorModal';

export default function SkillTree() {
  const dispatch = useDispatch();
  const { nodes, crossTrainingActive, crossTrainingMessage } = useSelector((state) => state.journey);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [isArchitectMode, setIsArchitectMode] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  const getNodeStyles = (status) => {
    switch (status) {
      case 'completed':
        return {
          bg: 'bg-cyan-500/10',
          border: 'border-cyan-500',
          text: 'text-cyan-400',
          shadow: 'shadow-[0_0_20px_rgba(6,182,212,0.4)]',
          icon: <Check className="w-6 h-6 text-cyan-400" />
        };
      case 'unlocked':
        return {
          bg: 'bg-purple-500/10',
          border: 'border-purple-500',
          text: 'text-purple-400',
          shadow: 'shadow-[0_0_25px_rgba(168,85,247,0.6)]',
          icon: <Activity className="w-6 h-6 text-purple-400 animate-pulse" />
        };
      default: 
        return {
          bg: 'bg-[#161618]',
          border: 'border-gray-800',
          text: 'text-gray-600',
          shadow: 'shadow-none',
          icon: <Lock className="w-5 h-5 text-gray-700" />
        };
    }
  };

  const handleComplete = () => {
    if (selectedNode && selectedNode.status === 'unlocked') {
      dispatch(completeNode(selectedNode.id));
    }
  };

  return (
    <div className="h-screen bg-[#0a0a0a] text-white p-8 flex flex-col relative overflow-hidden">
      
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#333_1px,transparent_1px)] bg-size-[32px_32px] opacity-30 z-0"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 blur-[120px] rounded-full pointer-events-none z-0"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/10 blur-[120px] rounded-full pointer-events-none z-0"></div>

      {/* Header */}
      <header className="relative z-10 mb-6 max-w-6xl mx-auto w-full shrink-0 flex items-center justify-between">
        <div>
          {/* ... existing title text ... */}
        </div>
        
        <div className="flex gap-4">
          {/* AI GENERATOR BUTTON */}
          <button 
            onClick={() => setIsAIModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-purple-600/10 border border-purple-500/50 text-purple-400 font-bold rounded-xl hover:bg-purple-600/20 hover:border-purple-400 transition-all shadow-[0_0_15px_rgba(168,85,247,0.2)]"
          >
            <Sparkles className="w-5 h-5" /> AI Auto-Route
          </button>

          {/* Architect Button */}
          <button 
            onClick={() => setIsArchitectMode(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gray-900 border border-cyan-500/30 text-cyan-400 font-bold rounded-xl hover:bg-cyan-500/10 hover:border-cyan-500 transition-all shadow-[0_0_15px_rgba(6,182,212,0.1)]"
          >
            <Plus className="w-5 h-5" /> Add Node
          </button>
        </div>
      </header>

      {/* Tree Canvas */}
      <div className="relative flex-1 max-w-6xl mx-auto w-full bg-[#111113]/80 backdrop-blur-md border border-gray-800 rounded-3xl shadow-2xl overflow-hidden z-10 mb-4 min-h-112.5">
        
        {/* SAFE ZONE WRAPPER */}
        <div className="absolute top-12 bottom-16 left-12 right-12">
          
          {/* Connection Lines (SVG) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            {nodes.map(node => (
              node.unlocks.map(targetId => {
                const targetNode = nodes.find(n => n.id === targetId);
                if (!targetNode) return null;
                
                const isPathActive = node.status === 'completed' && targetNode.status !== 'locked';
                const isPathCompleted = targetNode.status === 'completed';

                return (
                  <motion.line
                    key={`${node.id}-${targetId}`}
                    x1={`${node.position.x}%`}
                    y1={`${node.position.y}%`}
                    x2={`${targetNode.position.x}%`}
                    y2={`${targetNode.position.y}%`}
                    stroke={isPathCompleted ? '#06b6d4' : isPathActive ? '#a855f7' : '#333'}
                    strokeWidth="3"
                    strokeDasharray={isPathActive && !isPathCompleted ? "8 8" : "none"}
                    className={isPathActive && !isPathCompleted ? "animate-[dash_20s_linear_infinite]" : ""}
                  />
                );
              })
            ))}
          </svg>

          {/* Nodes */}
          {nodes.map(node => {
            const styles = getNodeStyles(node.status);
            const isSelected = selectedNodeId === node.id;

            return (
              <motion.button
                key={node.id}
                onClick={() => setSelectedNodeId(node.id)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className={`absolute w-14 h-14 -ml-7 -mt-7 rounded-2xl flex items-center justify-center border-2 transition-all duration-300 z-10 cursor-pointer
                  ${styles.bg} ${styles.border} ${styles.shadow}
                  ${isSelected ? 'ring-4 ring-white/20 scale-110' : ''}
                `}
                style={{ top: `${node.position.y}%`, left: `${node.position.x}%` }}
              >
                {node.status === 'unlocked' && (
                  <motion.div 
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute inset-0 rounded-2xl bg-purple-500 opacity-30"
                  />
                )}
                <div className="relative z-10">{styles.icon}</div>
                
                {/* Mini Label */}
                <div className="absolute top-full mt-4 left-1/2 -translate-x-1/2 w-40 text-center pointer-events-none">
                  <span className={`text-[10px] font-bold uppercase tracking-wider bg-[#0a0a0a]/80 backdrop-blur-sm px-2 py-1 rounded-md border border-gray-800 ${styles.text}`}>
                    {node.title}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Selected Node Command Panel */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl bg-[#161618]/95 backdrop-blur-xl border border-gray-700 rounded-3xl p-6 shadow-2xl z-40 flex items-center gap-6"
          >
            <div className={`w-16 h-16 rounded-2xl border-2 flex items-center justify-center shrink-0 ${getNodeStyles(selectedNode.status).bg} ${getNodeStyles(selectedNode.status).border}`}>
               {getNodeStyles(selectedNode.status).icon}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-xl font-bold text-white">{selectedNode.title}</h3>
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${getNodeStyles(selectedNode.status).border} ${getNodeStyles(selectedNode.status).text} bg-black/50`}>
                  {selectedNode.status}
                </span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">{selectedNode.description}</p>
            </div>

            {selectedNode.status === 'unlocked' && (
              <button 
                onClick={handleComplete}
                className="shrink-0 flex items-center gap-2 px-6 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-500 transition-colors shadow-[0_0_20px_rgba(168,85,247,0.4)]"
              >
                Engage Node <ChevronRight className="w-5 h-5" />
              </button>
            )}
            
            <button 
              onClick={() => setSelectedNodeId(null)}
              className="absolute top-4 right-4 p-1 text-gray-500 hover:text-white bg-black/20 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cross-Training Enforcer Modal */}
      <AnimatePresence>
        {crossTrainingActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#111113] border border-cyan-500/50 rounded-4xl p-10 max-w-lg text-center shadow-[0_0_50px_rgba(6,182,212,0.15)] relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-cyan-500 to-purple-500"></div>
              
              <Activity className="w-16 h-16 text-cyan-400 mx-auto mb-6" />
              <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-4">Cross-Training Enforced</h2>
              <p className="text-gray-400 leading-relaxed mb-8">
                {crossTrainingMessage}
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => dispatch(dismissCrossTraining())}
                  className="py-3 border border-gray-700 text-gray-300 font-bold rounded-xl hover:bg-gray-800 transition-colors"
                >
                  Skip Recovery
                </button>
                <button 
                  onClick={() => dispatch(dismissCrossTraining())}
                  className="py-3 bg-cyan-500 text-black font-bold rounded-xl hover:bg-cyan-400 transition-colors shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                >
                  Acknowledge
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes dash {
          to { stroke-dashoffset: -100; }
        }
      `}} />
      
      <AddNodeModal isOpen={isArchitectMode} onClose={() => setIsArchitectMode(false)} />
      <AIGeneratorModal isOpen={isAIModalOpen} onClose={() => setIsAIModalOpen(false)} />  
    </div>
  );
}