import React from 'react';
import { Microscope, Dna, Target, Activity } from 'lucide-react';

export default function TheScience() {
  return (

    <div className="w-full bg-[#0a0a0a] text-gray-100 pb-24">
      {/* Header */}
      <header className="w-full bg-[#121212] border-y border-gray-800 py-16 text-center px-4">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-white">The Science of Neuro-Optimization</h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          We don't rely on the "10% brain myth." We rely on neuroplasticity, spaced repetition, and BDNF synthesis. Here is how it works.
        </p>
      </header>

      <main className="max-w-4xl mx-auto px-6 mt-16 space-y-24">
        
        {/* Section 1: The Problem */}
        <section className="flex flex-col md:flex-row gap-8 items-start">
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-full shrink-0">
            <Activity className="w-8 h-8 text-red-400" />
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-4 text-white">Why It's Necessary</h2>
            <p className="text-lg text-gray-400 leading-relaxed mb-4">
              Modern conveniences—like GPS, calculators, and spellcheck—are causing our problem-solving neural pathways to atrophy. The brain is an energy hog, consuming 20% of your body's calories. If you don't actively force it into complex, uncomfortable tasks, it defaults to "autopilot" to save energy. 
            </p>
            <p className="text-lg text-gray-400 leading-relaxed">
              You are already using 100% of your brain. The goal isn't unlocking dormant tissue; it's upgrading the speed, density, and efficiency of your existing neural networks.
            </p>
          </div>
        </section>

        {/* Section 2: The Research */}
        <section className="flex flex-col md:flex-row gap-8 items-start">
          <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-full shrink-0">
            <Microscope className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-4 text-white">What The Research Says</h2>
            <ul className="space-y-6 text-lg text-gray-400">
              <li>
                <strong className="text-gray-200">Neuroplasticity:</strong> The brain reorganizes itself by forming new neural connections throughout life. Learning completely novel, frustrating skills forces bi-hemispheric engagement.
              </li>
              <li>
                <strong className="text-gray-200">BDNF (Brain Fertilizer):</strong> Aerobic exercise triggers the release of Brain-Derived Neurotrophic Factor, a protein that literally grows new synapses. You cannot optimize the software without maintaining the hardware.
              </li>
              <li>
                <strong className="text-gray-200">Ultradian Rhythms:</strong> The human brain operates on 90-minute high-alertness cycles. Multitasking is a myth; the brain simply rapidly switches attention, draining cognitive energy.
              </li>
            </ul>
          </div>
        </section>

        {/* Section 3: How It Works & What We Provide */}
        <section className="flex flex-col md:flex-row gap-8 items-start">
          <div className="bg-purple-500/10 border border-purple-500/20 p-4 rounded-full shrink-0">
            <Target className="w-8 h-8 text-purple-400" />
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-4 text-white">How The Neuro-Stack Works</h2>
            <p className="text-lg text-gray-400 leading-relaxed mb-6">
              The Neuro-Stack acts as your cognitive architect. It weaves physical maintenance, cognitive stressors, and career learning into a single, scientifically balanced daily timeline.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#161618] p-6 rounded-xl border border-gray-800 shadow-sm hover:border-gray-700 transition-colors">
                <h3 className="font-bold text-xl mb-2 text-white">🧠 The Neuro-Gym</h3>
                <p className="text-gray-400">Built-in stressors like Dual N-Back and "Analog Mode" to specifically target working memory in the Prefrontal Cortex.</p>
              </div>
              <div className="bg-[#161618] p-6 rounded-xl border border-gray-800 shadow-sm hover:border-gray-700 transition-colors">
                <h3 className="font-bold text-xl mb-2 text-white">📚 Knowledge Vault</h3>
                <p className="text-gray-400">A spaced-repetition engine that intercepts the Hippocampus's forgetting curve to make new tech-stack skills permanent.</p>
              </div>
              <div className="bg-[#161618] p-6 rounded-xl border border-gray-800 shadow-sm hover:border-gray-700 transition-colors">
                <h3 className="font-bold text-xl mb-2 text-white">🏃‍♂️ Hardware Log</h3>
                <p className="text-gray-400">Tracks the non-negotiables: 7-9 hours of sleep for neurotoxin clearance, and BDNF-triggering exercise.</p>
              </div>
              <div className="bg-[#161618] p-6 rounded-xl border border-gray-800 shadow-sm hover:border-gray-700 transition-colors">
                <h3 className="font-bold text-xl mb-2 text-white">⏱️ Ultradian Scheduler</h3>
                <p className="text-gray-400">Blocks your day into 90-minute deep-focus sprints followed by mandatory 20-minute cognitive decompression.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}