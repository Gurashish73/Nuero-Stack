import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain as BrainIcon, Zap, Activity, BookOpen, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import TheScience from './TheScience';
import brainImage from '../../assets/brain.png';
import TheUltimateGuide from './TheUltimateGuide';

const brainRegions = [
  {
    id: 'prefrontal',
    name: 'Prefrontal Cortex',
    icon: <BrainIcon className="w-6 h-6 text-blue-400" />,
    glowColor: 'bg-blue-500',
    borderColor: 'border-blue-500',
    textColor: 'text-blue-400',
    position: { top: '35%', left: '28%' }, 
    description: 'The logic and willpower center. We train this using the Dual N-Back game and complex problem-solving to build cognitive flexibility.',
    appFeature: 'Trained in: The Neuro-Gym'
  },
  {
    id: 'hippocampus',
    name: 'Hippocampus',
    icon: <BookOpen className="w-6 h-6 text-purple-400" />,
    glowColor: 'bg-purple-500',
    borderColor: 'border-purple-500',
    textColor: 'text-purple-400',
    position: { top: '50%', left: '50%' }, 
    description: 'The memory vault. Our Spaced Repetition engine forces this region to convert short-term learnings into permanent, long-term mastery.',
    appFeature: 'Trained in: Knowledge Vault'
  },
  {
    id: 'amygdala',
    name: 'Amygdala',
    icon: <Activity className="w-6 h-6 text-pink-400" />,
    glowColor: 'bg-pink-500',
    borderColor: 'border-pink-500',
    textColor: 'text-pink-400',
    position: { top: '65%', left: '42%' }, 
    description: 'The emotional regulator. We use mindfulness routines and deep-focus pacing to shrink stress responses and maximize clarity.',
    appFeature: 'Trained in: Decompression Zone'
  },
  {
    id: 'cerebellum',
    name: 'Cerebellum & Motor',
    icon: <Zap className="w-6 h-6 text-green-400" />,
    glowColor: 'bg-green-500',
    borderColor: 'border-green-500',
    textColor: 'text-green-400',
    position: { top: '75%', left: '72%' }, 
    description: 'The physical engine. Maintained through targeted aerobic exercise and sleep tracking to release BDNF (Brain Fertilizer).',
    appFeature: 'Maintained in: Hardware Log'
  }
];

export default function LandingPage() {
  const [activeNode, setActiveNode] = useState(brainRegions[0]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center">
      
      {/* Top Navbar */}
      <nav className="w-full max-w-7xl mx-auto px-8 py-6 flex justify-between items-center">
        <h1 className="text-2xl font-extrabold tracking-tighter">The Neuro-Stack.</h1>
        <Link to="/dashboard" className="px-6 py-2 bg-white text-black rounded-full font-medium hover:bg-gray-200 transition-colors">
          Enter Dashboard
        </Link>
      </nav>

      {/* Hero Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        {/* Left Column */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-xl"
        >
          <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-blue-900/30 text-blue-300 border border-blue-800/50 font-semibold text-sm tracking-wide">
            Backed by Neuroscience
          </div>
          <h2 className="text-6xl font-extrabold leading-tight tracking-tight mb-6">
            You don't need a pill. <br/>
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-purple-500">
              You need a system.
            </span>
          </h2>
          <p className="text-xl text-gray-400 mb-10 leading-relaxed">
            The 10% brain myth is a lie. You already use 100% of your brain. 
            The Neuro-Stack uses neuroplasticity, spaced repetition, and 
            ultradian rhythms to rewire your cognitive efficiency.
          </p>
          <div className="flex gap-4">
            <Link to="/dashboard" className="px-8 py-4 bg-white text-black rounded-xl font-bold text-lg hover:bg-gray-200 transition-all shadow-lg hover:shadow-xl flex items-center gap-2">
              Initialize Stack <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>

        {/* Right Column: */}
        <div className="w-full max-w-sm mx-auto flex flex-col gap-3 mt-8 lg:mt-0">
          
          <p className="text-center font-bold text-gray-500 uppercase tracking-widest text-[10px] mb-0">
            Interactive Neural Map
          </p>
          
          {/* TOP SECTION */}
          <div className="relative w-full aspect-square bg-[#121212] rounded-4xl shadow-2xl border border-gray-800 overflow-hidden">
            
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
              <img 
                src={brainImage} 
                alt="Brain Profile" 
                className="w-full h-full object-cover scale-[1.15] mix-blend-screen opacity-100"
              />
            </div>

            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none stroke-white/30 stroke-[0.4] fill-none z-10">
              <path d="M 28 35 Q 40 35 50 50" />
              <path d="M 50 50 Q 60 65 72 75" />
              <path d="M 28 35 Q 35 65 42 65" />
            </svg>

            {/* The Nodes */}
            {brainRegions.map((region) => (
              <motion.button
                key={region.id}
                onClick={() => setActiveNode(region)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className={`absolute w-10 h-10 -ml-5 -mt-5 rounded-full flex items-center justify-center border-[3px] shadow-2xl transition-colors z-20
                  ${activeNode.id === region.id 
                    ? `bg-[#0a0a0a] ${region.borderColor}` 
                    : 'bg-[#161618] border-gray-700 hover:border-gray-500'}`}
                style={{ top: region.position.top, left: region.position.left }}
              >
                {activeNode.id === region.id && (
                  <motion.div 
                    initial={{ scale: 1, opacity: 0.8 }}
                    animate={{ scale: 2.2, opacity: 0 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`absolute -inset-0.75 rounded-full border-2 ${region.borderColor}`}
                  />
                )}
                
                <div className={`w-2.5 h-2.5 rounded-full ${activeNode.id === region.id ? region.glowColor : 'bg-gray-500'} relative z-10`} />
              </motion.button>
            ))}
          </div>

          {/* BOTTOM SECTION: */}
          <div className="h-32">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeNode.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                
                className={`h-full p-4 rounded-3xl border border-gray-800 bg-[#161618] shadow-xl flex flex-col justify-center relative overflow-hidden`}
              >
                <div className={`absolute top-0 left-0 w-full h-1 ${activeNode.glowColor}`} />
                
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="scale-90">{activeNode.icon}</div>
                  <h3 className="text-base font-extrabold text-white">{activeNode.name}</h3>
                </div>
                <p className="text-gray-400 text-xs leading-snug mb-2 flex-1">
                  {activeNode.description}
                </p>
                <p className={`text-[10px] font-bold uppercase tracking-wider ${activeNode.textColor}`}>
                  {activeNode.appFeature}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </main>

      <div className="w-full mt-32">
        <TheScience />
      </div>
      <div className="w-full">
        <TheUltimateGuide />
      </div>

    </div>
  );
}