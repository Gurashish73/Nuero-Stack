import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Network, Plus } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { addNode } from './journeySlice';

export default function AddNodeModal({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const existingNodes = useSelector(state => state.journey.nodes);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('frontend');
  const [parentId, setParentId] = useState('none');
  
  // Start the new node right in the middle of the screen
  const [posX, setPosX] = useState(50);
  const [posY, setPosY] = useState(50);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    dispatch(addNode({
      title,
      description,
      category,
      position: { x: posX, y: posY },
      parentId
    }));

    // Reset and close
    setTitle('');
    setDescription('');
    setPosX(50);
    setPosY(50);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-[#111113] border border-cyan-500/30 rounded-3xl shadow-[0_0_50px_rgba(6,182,212,0.1)] z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-[#0a0a0a]">
              <div className="flex items-center gap-3">
                <Network className="w-6 h-6 text-cyan-500" />
                <h2 className="text-xl font-bold text-white tracking-wide">Architect Mode: <span className="text-cyan-500">New Node</span></h2>
              </div>
              <button onClick={onClose} className="p-2 text-gray-500 hover:text-white bg-gray-900 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              
              {/* Basic Info */}
              <div>
                <label className="block text-xs font-bold text-cyan-500 uppercase tracking-widest mb-2">Skill Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Python Basics"
                  className="w-full bg-[#0a0a0a] border border-gray-800 rounded-xl p-3 text-white focus:border-cyan-500 outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-cyan-500 uppercase tracking-widest mb-2">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What will you master here?"
                  className="w-full bg-[#0a0a0a] border border-gray-800 rounded-xl p-3 text-gray-300 focus:border-cyan-500 outline-none h-20 resize-none"
                />
              </div>

              {/* Topology Positioning */}
              <div className="grid grid-cols-2 gap-6 bg-[#0a0a0a] p-4 rounded-xl border border-gray-800">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                    X-Axis (Left to Right): <span className="text-white">{posX}%</span>
                  </label>
                  <input 
                    type="range" min="5" max="95" value={posX} onChange={(e) => setPosX(Number(e.target.value))}
                    className="w-full accent-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                    Y-Axis (Top to Bottom): <span className="text-white">{posY}%</span>
                  </label>
                  <input 
                    type="range" min="5" max="95" value={posY} onChange={(e) => setPosY(Number(e.target.value))}
                    className="w-full accent-purple-500"
                  />
                </div>
              </div>

              {/* Neural Wiring */}
              <div>
                <label className="block text-xs font-bold text-cyan-500 uppercase tracking-widest mb-2">Connect To (Parent Node)</label>
                <select 
                  value={parentId} 
                  onChange={(e) => setParentId(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-gray-800 rounded-xl p-3 text-white focus:border-cyan-500 outline-none appearance-none cursor-pointer"
                >
                  <option value="none">Standalone Node (No Parent)</option>
                  {existingNodes.map(node => (
                    <option key={node.id} value={node.id}>{node.title}</option>
                  ))}
                </select>
                <p className="text-[10px] text-gray-500 mt-2">Selecting a parent will draw a neural pathway from that node to this new one.</p>
              </div>

              <button
                type="submit"
                disabled={!title.trim()}
                className="w-full flex items-center justify-center gap-2 py-4 mt-4 bg-cyan-600 text-black rounded-xl font-black hover:bg-cyan-500 disabled:opacity-50 transition-colors uppercase tracking-widest"
              >
                <Plus className="w-5 h-5" /> Inject Node
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}