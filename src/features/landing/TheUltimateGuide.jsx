import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, Terminal, Network, Database, Shield, Crosshair, Zap, ArrowDown } from 'lucide-react';

const guideSteps = [
  {
    phase: 'Phase 01',
    title: 'Initialize Hardware',
    subtitle: 'Biological Telemetry & Maintenance',
    description: 'You cannot run high-performance software on broken hardware. Begin your day by verifying your physical baseline. Log your sleep to ensure neurotoxin clearance, track hydration, and monitor your stimulant intake.',
    color: 'from-emerald-500 to-green-600',
    glow: 'shadow-[0_0_40px_rgba(16,185,129,0.2)]',
    icon: <Cpu className="w-8 h-8 text-emerald-400" />,
    bullets: ['Caffeine Half-Life Tracking', 'Glymphatic Sleep Clearance', 'Kinetic BDNF Synthesis']
  },
  {
    phase: 'Phase 02',
    title: 'Cognitive Priming',
    subtitle: 'The Neuro-Gym',
    description: 'Before deep work, you must boot up the prefrontal cortex and down-regulate the amygdala. Engage in rapid-fire arithmetic to spin up working memory, followed by 4-7-8 breathing to kill cortisol and induce flow state.',
    color: 'from-blue-500 to-cyan-600',
    glow: 'shadow-[0_0_40px_rgba(59,130,246,0.2)]',
    icon: <Terminal className="w-8 h-8 text-blue-400" />,
    bullets: ['Prefrontal Math Sprints', 'Parasympathetic Breathing', 'Hemisphere Switching']
  },
  {
    phase: 'Phase 03',
    title: 'Execute Deep Work',
    subtitle: 'Command Center & The Journey',
    description: 'Enter the isolation protocol. Follow your dynamic Skill Tree to know exactly what to study. The Master Timeline will block your day into 90-minute ultradian sprints, maximizing dopamine while preventing burnout.',
    color: 'from-purple-500 to-indigo-600',
    glow: 'shadow-[0_0_40px_rgba(168,85,247,0.2)]',
    icon: <Crosshair className="w-8 h-8 text-purple-400" />,
    bullets: ['Ultradian Focus Timer', 'Daily Trifecta Rings', 'Node-Based Skill Trees']
  },
  {
    phase: 'Phase 04',
    title: 'Consolidate Memory',
    subtitle: 'The Knowledge Vault',
    description: 'Learning without retention is wasted energy. At the end of your sprint, input your key takeaways into the Vault. The Spaced Repetition Engine will mathematically calculate the exact day you are about to forget it, and force a review.',
    color: 'from-pink-500 to-rose-600',
    glow: 'shadow-[0_0_40px_rgba(236,72,153,0.2)]',
    icon: <Database className="w-8 h-8 text-pink-400" />,
    bullets: ['SM-2 Spaced Repetition', 'Active Recall Forcing', 'AI Flashcard Extraction']
  },
  {
    phase: 'Phase 05',
    title: 'Sync Telemetry',
    subtitle: 'The Guild & The Oracle',
    description: 'Upload your daily telemetry to the Matrix. Check in with your Squad to maintain 100% Global Sync, share resources in the Arsenal, and consult The Oracle (AI) for a clinical audit of your cognitive performance.',
    color: 'from-amber-500 to-orange-600',
    glow: 'shadow-[0_0_40px_rgba(245,158,11,0.2)]',
    icon: <Network className="w-8 h-8 text-amber-400" />,
    bullets: ['Real-Time Squad Sync', 'Role-Based Access Control', 'Gemini AI Executive Audit']
  }
];

export default function TheUltimateGuide() {
  return (
    <div className="w-full bg-[#050505] relative overflow-hidden py-32 border-t border-gray-800">
      
      {/* Background */}
      <div className="absolute top-0 left-1/4 w-125 h-125 bg-purple-600/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-125 h-125 bg-blue-600/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-24"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-900 border border-gray-700 text-gray-300 text-sm font-bold tracking-widest uppercase mb-6">
            <Shield className="w-4 h-4 text-emerald-500" /> Operator's Manual
          </div>
          <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter mb-8">
            The Ultimate Protocol
          </h2>
          
          <div className="max-w-3xl mx-auto relative">
            <div className="absolute -left-6 -top-6 text-6xl text-gray-800 font-serif">"</div>
            <blockquote className="text-2xl md:text-3xl text-gray-400 font-light leading-relaxed italic relative z-10">
              The human brain is a biological computer. You are the operator. Stop letting society run it on default settings. Take manual control.
            </blockquote>
            <div className="absolute -right-6 bottom-0 text-6xl text-gray-800 font-serif">"</div>
          </div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }} 
          transition={{ repeat: Infinity, duration: 2 }}
          className="flex justify-center mb-24"
        >
          <ArrowDown className="w-8 h-8 text-gray-600" />
        </motion.div>

        {/* Zig-Zag Timeline */}
        <div className="space-y-32 relative">
          
          {/* Vertical Connecting Line */}
          <div className="absolute left-[50%] top-0 bottom-0 w-px bg-linear-to-b from-transparent via-gray-800 to-transparent hidden md:block"></div>

          {guideSteps.map((step, index) => {
            const isEven = index % 2 === 0;
            return (
              <div key={step.phase} className={`flex flex-col md:flex-row items-center gap-12 md:gap-24 ${isEven ? '' : 'md:flex-row-reverse'}`}>
                
                {/* Visual Icon Box */}
                <motion.div 
                  initial={{ opacity: 0, x: isEven ? -50 : 50, rotate: isEven ? -5 : 5 }}
                  whileInView={{ opacity: 1, x: 0, rotate: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.7, type: "spring", bounce: 0.4 }}
                  className={`flex-1 w-full flex ${isEven ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`relative w-64 h-64 md:w-80 md:h-80 rounded-3xl bg-[#0a0a0a] border border-gray-800 flex items-center justify-center ${step.glow} group`}>
                    <div className={`absolute inset-0 rounded-3xl bg-linear-to-br ${step.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                    <div className="absolute inset-2 border border-gray-800/50 rounded-2xl"></div>
                    <div className="w-24 h-24 rounded-full bg-[#161618] border border-gray-700 flex items-center justify-center shadow-2xl relative z-10">
                       {step.icon}
                    </div>
                  </div>
                </motion.div>

                {/* Text Content */}
                <motion.div 
                  initial={{ opacity: 0, x: isEven ? 50 : -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.7, delay: 0.2 }}
                  className="flex-1 space-y-6 text-center md:text-left relative z-10"
                >
                  <div className={`inline-block px-3 py-1 rounded-full bg-[#161618] border border-gray-800 text-xs font-black uppercase tracking-widest bg-clip-text text-transparent bg-linear-to-r ${step.color}`}>
                    {step.phase}
                  </div>
                  <h3 className="text-4xl font-black text-white tracking-tight">{step.title}</h3>
                  <h4 className="text-lg font-bold text-gray-500 uppercase tracking-widest">{step.subtitle}</h4>
                  <p className="text-gray-400 text-lg leading-relaxed">
                    {step.description}
                  </p>
                  
                  <ul className="space-y-3 pt-4 inline-block text-left">
                    {step.bullets.map((bullet, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm font-bold text-gray-300">
                        <Zap className="w-4 h-4 text-gray-600" /> {bullet}
                      </li>
                    ))}
                  </ul>
                </motion.div>

              </div>
            );
          })}
        </div>

        {/* Final CTA */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-40 text-center bg-linear-to-b from-[#111113] to-[#050505] border border-gray-800 rounded-3xl p-12 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6 relative z-10">Ready to break the limit?</h2>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto relative z-10">
            The Neuro-Stack is completely operational. Your dashboard, neural networks, and AI protocols are waiting.
          </p>
          <a href="/dashboard" className="relative z-10 inline-flex items-center gap-3 px-10 py-5 bg-white text-black rounded-xl font-black text-lg uppercase tracking-widest hover:bg-gray-200 transition-all shadow-[0_0_40px_rgba(255,255,255,0.2)]">
            <Cpu className="w-6 h-6" /> Boot System
          </a>
        </motion.div>
      </div>
    </div>
  );
}