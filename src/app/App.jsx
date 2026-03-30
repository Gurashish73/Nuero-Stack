import React, { useState } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { Home, Brain, BookOpen, Activity, Map as MapIcon, Shield, MessageSquare, LogOut, Copy, Check} from 'lucide-react';
import { useSelector } from 'react-redux';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';

//Pages and Components
import LandingPage from '../features/landing/LandingPage';
import Login from '../features/auth/Login';
import Dashboard from '../features/dashboard/Dashboard';
import HardwareLog from '../features/hardwareLog/HardwareLog';
import NeuroGym from '../features/neuroGym/NeuroGym';
import KnowledgeVault from '../features/vault/KnowledgeVault';
import SkillTree from '../features/journey/SkillTree';
import TheGuild from '../features/guild/TheGuild';
import TheOracle from '../features/oracle/TheOracle';

// Sync Engine
import DataSyncManager from '../components/DataSyncManager';
import NotificationManager from '../components/NotificationManager';
import ToastContainer from '../components/ToastContainer';
import DayCycleEngine from '../components/DayCycleEngine';

export default function App() {
  const location = useLocation();
  const isPublicPage = location.pathname === '/' || location.pathname === '/login';

  const { isAuthenticated, user } = useSelector(state => state.auth);
  const [copied, setCopied] = useState(false);

  const navItems = [
    { name: 'Command Center', path: '/dashboard', icon: <Home className="w-5 h-5" /> },
    { name: 'Neuro-Gym', path: '/gym', icon: <Brain className="w-5 h-5" /> },
    { name: 'Knowledge Vault', path: '/vault', icon: <BookOpen className="w-5 h-5" /> },
    { name: 'Hardware Log', path: '/hardware', icon: <Activity className="w-5 h-5" /> },
    { name: 'The Journey', path: '/journey', icon: <MapIcon className="w-5 h-5" /> },
    { name: 'The Guild', path: '/guild', icon: <Shield className="w-5 h-5" /> },
    { name: 'The Oracle', path: '/oracle', icon: <MessageSquare className="w-5 h-5" /> },
  ];

  const handleLogout = () => {
    signOut(auth);
  };
  const copyNeuralId = () => {
    if (user?.uid) {
      navigator.clipboard.writeText(user.uid);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    }
  };

  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  return (
    <DataSyncManager>
      {isAuthenticated && (
        <>
          <NotificationManager />
          <DayCycleEngine />
          <ToastContainer />
        </>
      )}
    <div className="flex h-screen w-full bg-[#0f0f11] text-gray-100 overflow-hidden">
      
      {!isPublicPage && (
        <nav className="w-72 bg-[#161618] border-r border-gray-800 flex flex-col p-6 shadow-2xl z-20 shrink-0">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-purple-600 text-white rounded-lg flex items-center justify-center font-bold shadow-lg">
              NS
            </div>
            <h1 className="text-xl font-extrabold tracking-tight text-white">The Neuro-Stack</h1>
          </div>
          
          <div className="flex flex-col space-y-1.5 overflow-y-auto pr-2 custom-scrollbar">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link 
                  key={item.name}
                  to={item.path} 
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium border ${
                    isActive 
                      ? 'bg-gray-800/50 border-gray-700 text-white shadow-sm' 
                      : 'border-transparent text-gray-400 hover:bg-gray-800/30 hover:text-gray-200'
                  }`}
                >
                  <span className={isActive ? 'text-blue-400' : 'text-gray-500'}>
                    {item.icon}
                  </span>
                  {item.name}
                </Link>
              );
            })}
          </div>
          
          <div className="mt-auto pt-6 border-t border-gray-800 px-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 rounded-full bg-gray-800 border-2 border-gray-700 flex items-center justify-center text-sm font-bold text-gray-300 uppercase shrink-0">
                  {user?.name ? user.name.charAt(0) : 'U'}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-bold text-gray-200 truncate">{user?.name || 'Limitless User'}</p>
                  <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Operator</p>
                </div>
              </div>
              
              <button 
                onClick={handleLogout} 
                className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                title="Disconnect Neural Link (Log Out)"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            <button 
                onClick={copyNeuralId}
                className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg border text-xs font-bold uppercase tracking-widest transition-all ${
                  copied
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                    : 'bg-[#0a0a0a] border-gray-700 text-gray-400 hover:text-white hover:border-gray-500'
                }`}
                title="Copy ID to share with friends"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'ID Copied!' : 'Copy Neural ID'}
            </button>
          </div>
        </nav>
      )}


      <main className="flex-1 overflow-y-auto relative bg-[#0a0a0a]">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Auth Route*/}
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />} />
          
          {/* Protected OS Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/gym" element={<ProtectedRoute><NeuroGym /></ProtectedRoute>} />
          <Route path="/vault" element={<ProtectedRoute><KnowledgeVault /></ProtectedRoute>} />
          <Route path="/hardware" element={<ProtectedRoute><HardwareLog /></ProtectedRoute>} />
          <Route path="/journey" element={<ProtectedRoute><SkillTree /></ProtectedRoute>} />
          <Route path="/guild" element={<ProtectedRoute><TheGuild /></ProtectedRoute>} />
          <Route path="/oracle" element={<ProtectedRoute><TheOracle /></ProtectedRoute>} />
        </Routes>
      </main>

    </div>
    </DataSyncManager>
    
  
  );
}