import React, { useState, useEffect } from 'react';
import { Zap, CheckCircle2, Circle, Loader2, RefreshCw } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { addMindProgress } from './streakSlice';
import { incrementNovelty } from '../hardwareLog/hardwareSlice';
import { generateJSON } from '../../services/gemini'; // NEW: Proxy service

export default function NoveltyPrompt() {
  const dispatch = useDispatch();
  
  const [isLoading, setIsLoading] = useState(true);
  const [prompts, setPrompts] = useState({
    task1: "",
    task2: "",
    task1Done: false,
    task2Done: false,
    date: ""
  });

  const fetchPromptsFromAI = async (forceRefresh = false) => {
    setIsLoading(true);
    const today = new Date().toDateString();

    if (!forceRefresh) {
      const cached = localStorage.getItem('neuroplasticity_prompts');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.date === today) {
          setPrompts(parsed);
          setIsLoading(false);
          return;
        }
      }
    }

    try {
      const prompt = `
        Generate 2 short, highly actionable neuroplasticity exercises for a programmer to do today to build new neural pathways.
        Task 1 (Analog Mode): A task that replaces a digital habit with an analog one.
        Task 2 (Novelty Task): A daily physical routine performed in a novel/uncomfortable way (like non-dominant hand usage).
        
        Respond ONLY with a JSON object:
        {
          "task1": "String description (under 12 words)",
          "task2": "String description (under 12 words)"
        }
      `;

      // NEW: Calls the backend securely instead of using the raw API key
      const parsedData = await generateJSON(prompt);

      const newPrompts = {
        task1: parsedData.task1,
        task2: parsedData.task2,
        task1Done: false,
        task2Done: false,
        date: today
      };
      
      setPrompts(newPrompts);
      localStorage.setItem('neuroplasticity_prompts', JSON.stringify(newPrompts));
    } catch (error) {
      console.error("Neuroplasticity Generation Failed:", error.message);
      
      const fallbackPrompts = {
        task1: "Navigate to your next destination today without using GPS.",
        task2: "Brush your teeth with your non-dominant hand today.",
        task1Done: false,
        task2Done: false,
        date: today
      };
      setPrompts(fallbackPrompts);
      localStorage.setItem('neuroplasticity_prompts', JSON.stringify(fallbackPrompts));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPromptsFromAI();
  }, []);

  const handleTask1Click = () => {
    if (!prompts.task1Done) {
      const updated = { ...prompts, task1Done: true };
      setPrompts(updated);
      localStorage.setItem('neuroplasticity_prompts', JSON.stringify(updated));
      
      dispatch(addMindProgress(15)); 
      dispatch(incrementNovelty());
    }
  };

  const handleTask2Click = () => {
    if (!prompts.task2Done) {
      const updated = { ...prompts, task2Done: true };
      setPrompts(updated);
      localStorage.setItem('neuroplasticity_prompts', JSON.stringify(updated));
      
      dispatch(addMindProgress(15)); 
      dispatch(incrementNovelty());
    }
  };

  return (
    <section className="bg-linear-to-br from-[#161618] to-[#1a1a24] border border-indigo-900/30 rounded-3xl p-6 shadow-xl h-full flex flex-col justify-between min-h-55">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2">
          <Zap className="w-4 h-4" /> Neuroplasticity Push
        </h3>
        <button 
          onClick={() => fetchPromptsFromAI(true)} 
          disabled={isLoading}
          className="text-gray-500 hover:text-indigo-400 transition-colors disabled:opacity-50"
          title="Force generate new prompts"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>
      
      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center text-indigo-500/50">
          <Loader2 className="w-6 h-6 animate-spin mb-2" />
          <p className="text-[10px] font-bold uppercase tracking-widest">Generating Protocols...</p>
        </div>
      ) : (
        <div className="space-y-4 flex-1 flex flex-col justify-center">
          
          {/* Analog Mode Task */}
          <div className={`p-4 rounded-xl border transition-all duration-300 ${prompts.task1Done ? 'bg-indigo-900/20 border-indigo-500/30' : 'bg-[#0a0a0a]/50 border-gray-800 hover:border-gray-600'}`}>
            <div className="flex justify-between items-start gap-4">
              <div>
                <span className={`text-xs font-bold uppercase ${prompts.task1Done ? 'text-indigo-400' : 'text-pink-400'}`}>
                  Analog Mode
                </span>
                <p className={`text-sm mt-1 ${prompts.task1Done ? 'text-gray-500 line-through' : 'text-gray-300'}`}>
                  {prompts.task1}
                </p>
              </div>
              <button 
                onClick={handleTask1Click}
                disabled={prompts.task1Done}
                className="mt-1 text-gray-400 hover:text-pink-400 transition-colors"
              >
                {prompts.task1Done ? <CheckCircle2 className="w-6 h-6 text-indigo-500" /> : <Circle className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Novelty Task */}
          <div className={`p-4 rounded-xl border transition-all duration-300 ${prompts.task2Done ? 'bg-indigo-900/20 border-indigo-500/30' : 'bg-[#0a0a0a]/50 border-gray-800 hover:border-gray-600'}`}>
            <div className="flex justify-between items-start gap-4">
              <div>
                <span className={`text-xs font-bold uppercase ${prompts.task2Done ? 'text-indigo-400' : 'text-emerald-400'}`}>
                  Novelty Task
                </span>
                <p className={`text-sm mt-1 ${prompts.task2Done ? 'text-gray-500 line-through' : 'text-gray-300'}`}>
                  {prompts.task2}
                </p>
              </div>
              <button 
                onClick={handleTask2Click}
                disabled={prompts.task2Done}
                className="mt-1 text-gray-400 hover:text-emerald-400 transition-colors"
              >
                {prompts.task2Done ? <CheckCircle2 className="w-6 h-6 text-indigo-500" /> : <Circle className="w-6 h-6" />}
              </button>
            </div>
          </div>

        </div>
      )}
    </section>
  );
}