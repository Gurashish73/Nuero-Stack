import React from 'react';
import { Cpu, Zap, Lock } from 'lucide-react';
import { signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../../config/firebase';

export default function Login() {
  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      if (user && user.uid) {
        const userRef = doc(db, 'directory', user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          await setDoc(userRef, {
            name: user.displayName || `Agent ${user.uid.substring(0, 4)}`,
            email: user.email || '',
            score: 0,
            createdAt: Date.now()
          });
          console.log(`[SYSTEM] Initialized new operative: ${user.uid} with 0 Power.`);
        }
      }

    } catch (error) {
      console.error("Neural Link Failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-8 relative overflow-hidden text-white">
      <div className="absolute inset-0 bg-[radial-gradient(#333_1px,transparent_1px)] bg-size-[32px_32px] opacity-20"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-purple-600/20 blur-[150px] rounded-full pointer-events-none"></div>

      <div className="relative z-10 flex flex-col items-center max-w-md w-full text-center">
        <div className="w-24 h-24 bg-[#0a0a0a] border border-gray-800 rounded-3xl flex items-center justify-center shadow-[0_0_50px_rgba(168,85,247,0.2)] mb-8">
          <Cpu className="w-12 h-12 text-purple-500" />
        </div>
        
        <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">Limitless OS</h1>
        <p className="text-gray-400 font-mono text-sm mb-12 flex items-center gap-2 justify-center">
          <Lock className="w-4 h-4 text-emerald-500" /> Encrypted Biological Telemetry
        </p>

        <button 
          onClick={handleLogin}
          className="w-full py-4 bg-white text-black rounded-xl font-black uppercase tracking-widest hover:bg-gray-200 transition-all flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(255,255,255,0.1)]"
        >
          <Zap className="w-5 h-5 fill-black" /> Establish Neural Link (Google)
        </button>
      </div>
    </div>
  );
}