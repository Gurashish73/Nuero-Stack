import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Plus, Save, UserMinus, Search, User, UserCheck } from 'lucide-react';
import { useSelector } from 'react-redux';
import { collection, addDoc, updateDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

export default function SquadModal({ isOpen, onClose, initialData = null }) {
  const currentUser = useSelector(state => state.auth.user);

  const [name, setName] = useState('');
  const [focus, setFocus] = useState('');
  const [status, setStatus] = useState('Planning');
  
  const [members, setMembers] = useState([]); 

  const [searchUid, setSearchUid] = useState('');
  const [guestName, setGuestName] = useState('');
  const [searchError, setSearchError] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setFocus(initialData.focus);
      setStatus(initialData.status);
      setMembers(initialData.members);
    } else {
      setName('');
      setFocus('');
      setStatus('Planning');
      setMembers(currentUser ? [{ uid: currentUser.uid, name: currentUser.name || 'Creator', checkedIn: false }] : []);
    }
  }, [initialData, isOpen, currentUser]);

  // SEARCH FIREBASE FOR REGISTERED USER
  const handleAddRegisteredUser = async (e) => {
    e.preventDefault();
    setSearchError('');
    
    const cleanUid = searchUid.trim();
    if (!cleanUid) return;

    if (members.some(m => m.uid === cleanUid)) {
      setSearchError('User already in squad.');
      return;
    }

    try {
      const directoryDoc = await getDoc(doc(db, 'directory', cleanUid));
      
      if (directoryDoc.exists()) {
        const directoryData = directoryDoc.data();
        
        const newMember = { 
          uid: cleanUid, 
          name: directoryData.name || `Agent ${cleanUid.substring(0,4)}`, 
          checkedIn: false 
        };
        
        setMembers([...members, newMember]);
        setSearchUid('');
      } else {
        setSearchError('User ID not found in the Directory. Ask them to log in once.');
      }
    } catch (error) {
      console.error("Directory Search Error:", error);
      setSearchError('Search failed. Check connection.');
    }
  };

  // ADD GUEST (No Account)
  const handleAddGuest = (e) => {
    e.preventDefault();
    if (!guestName.trim()) return;
    setMembers([...members, { uid: null, name: `${guestName} (Guest)`, checkedIn: false }]);
    setGuestName('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !focus.trim() || members.length === 0) return;

    // Isolate flat user IDs for Firestore security rules
    const memberIds = members.filter(m => m.uid).map(m => m.uid);
    if (!memberIds.includes(currentUser.uid)) memberIds.push(currentUser.uid);

    try {
      if (initialData) {
        const squadRef = doc(db, 'squads', initialData.id);
        await updateDoc(squadRef, { name, focus, status, members, memberIds });
      } else {
        await addDoc(collection(db, 'squads'), {
          name, 
          focus, 
          status, 
          members, 
          memberIds, // Save the flat array alongside the object array
          arsenal: [],
          ownerId: currentUser.uid
        });
      }
      onClose();
    } catch (error) {
      console.error("Firebase Error: ", error);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40" />
          
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-[#111113] border border-emerald-500/30 rounded-3xl shadow-[0_0_50px_rgba(16,185,129,0.15)] z-50 overflow-hidden max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-[#0a0a0a] sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-emerald-500" />
                <h2 className="text-xl font-bold text-white tracking-wide">
                  {initialData ? 'Update Squad Specs' : 'Initialize New Squad'}
                </h2>
              </div>
              <button onClick={onClose} className="p-2 text-gray-500 hover:text-white bg-gray-900 rounded-full"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-emerald-500 uppercase tracking-widest mb-2">Squad Designation</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-[#0a0a0a] border border-gray-800 rounded-xl p-3 text-white focus:border-emerald-500 outline-none" autoFocus />
              </div>
              <div>
                <label className="block text-xs font-bold text-emerald-500 uppercase tracking-widest mb-2">Primary Objective</label>
                <input type="text" value={focus} onChange={(e) => setFocus(e.target.value)} className="w-full bg-[#0a0a0a] border border-gray-800 rounded-xl p-3 text-white focus:border-emerald-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-emerald-500 uppercase tracking-widest mb-2">Current Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full bg-[#0a0a0a] border border-gray-800 rounded-xl p-3 text-white focus:border-emerald-500 outline-none appearance-none">
                  <option value="Planning">Planning</option>
                  <option value="Deep Work">Deep Work</option>
                  <option value="Hacking">Hacking</option>
                  <option value="Deployment">Deployment</option>
                </select>
              </div>

              {/* OPERATIVE MANAGEMENT */}
              <div className="border-t border-gray-800 pt-5 space-y-4">
                <label className="block text-xs font-bold text-emerald-500 uppercase tracking-widest">Co-op Operatives</label>
                
                {/* Active Members List */}
                <div className="space-y-2">
                  {members.map((member, index) => (
                    <div key={index} className="flex justify-between items-center bg-[#0a0a0a] border border-gray-800 p-3 rounded-xl">
                      <div className="flex items-center gap-2">
                        {member.uid ? <UserCheck className="w-4 h-4 text-emerald-500" /> : <User className="w-4 h-4 text-gray-500" />}
                        <span className="text-sm font-bold text-white">{member.name}</span>
                        {member.uid === currentUser?.uid && <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full uppercase tracking-widest">You</span>}
                      </div>
                      {member.uid !== currentUser?.uid && (
                         <button onClick={() => setMembers(members.filter((_, i) => i !== index))} className="text-gray-500 hover:text-red-500 transition-colors"><UserMinus className="w-4 h-4" /></button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Add Registered User */}
                <form onSubmit={handleAddRegisteredUser} className="flex gap-2">
                  <input type="text" placeholder="Enter User ID..." value={searchUid} onChange={(e) => setSearchUid(e.target.value)} className="flex-1 bg-[#0a0a0a] border border-gray-800 rounded-xl p-3 text-xs text-white focus:border-emerald-500 outline-none" />
                  <button type="submit" disabled={!searchUid.trim()} className="px-4 bg-emerald-600/20 text-emerald-400 rounded-xl border border-emerald-500/30 hover:bg-emerald-500/30 disabled:opacity-50 flex items-center gap-2 text-xs font-bold"><Search className="w-3 h-3"/> Add ID</button>
                </form>
                {searchError && <p className="text-red-500 text-[10px] font-bold">{searchError}</p>}

                {/* Add Guest User */}
                <form onSubmit={handleAddGuest} className="flex gap-2">
                  <input type="text" placeholder="Or add guest name..." value={guestName} onChange={(e) => setGuestName(e.target.value)} className="flex-1 bg-[#0a0a0a] border border-gray-800 rounded-xl p-3 text-xs text-white focus:border-gray-500 outline-none" />
                  <button type="submit" disabled={!guestName.trim()} className="px-4 bg-gray-800 text-gray-300 rounded-xl hover:bg-gray-700 disabled:opacity-50 text-xs font-bold flex items-center gap-2"><Plus className="w-3 h-3"/> Guest</button>
                </form>
              </div>

              <button onClick={handleSubmit} disabled={!name.trim() || !focus.trim() || members.length === 0} className="w-full flex items-center justify-center gap-2 py-4 mt-6 bg-emerald-600 text-black rounded-xl font-black hover:bg-emerald-500 disabled:opacity-50 uppercase shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                {initialData ? <><Save className="w-5 h-5" /> Save Specs</> : <><Users className="w-5 h-5" /> Initialize Squad</>}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}