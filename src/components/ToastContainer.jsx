import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Activity, Droplet, Bell } from 'lucide-react';
import { hideNotification } from '../features/ui/uiSlice';

const Toast = ({ notification }) => {
  const dispatch = useDispatch();

  //Auto-dismiss
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(hideNotification(notification.id));
    }, notification.duration);
    return () => clearTimeout(timer);
  }, [dispatch, notification]);

  const getTypeStyles = (type) => {
    switch (type) {
      case 'oracle':
        return { icon: <Zap className="w-5 h-5 text-purple-400" />, border: 'border-purple-500/50', bg: 'bg-purple-500/10' };
      case 'alert':
        return { icon: <Activity className="w-5 h-5 text-red-400" />, border: 'border-red-500/50', bg: 'bg-red-500/10' };
      case 'water':
        return { icon: <Droplet className="w-5 h-5 text-cyan-400" />, border: 'border-cyan-500/50', bg: 'bg-cyan-500/10' };
      default: // system
        return { icon: <Bell className="w-5 h-5 text-blue-400" />, border: 'border-blue-500/50', bg: 'bg-blue-500/10' };
    }
  };

  const styles = getTypeStyles(notification.type);

  return (
    <motion.div
      initial={{ opacity: 0, x: 50, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={`relative w-80 bg-[#111113] border ${styles.border} shadow-2xl rounded-2xl p-4 overflow-hidden mb-3 pointer-events-auto`}
    >
      <div className={`absolute top-0 left-0 w-1 h-full ${styles.bg.replace('/10', '')}`}></div>
      
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-xl ${styles.bg} shrink-0`}>
          {styles.icon}
        </div>
        <div className="flex-1 min-w-0 pt-0.5">
          <h4 className="text-sm font-bold text-white tracking-wide truncate">{notification.title}</h4>
          <p className="text-xs text-gray-400 mt-1 leading-relaxed">{notification.message}</p>
        </div>
        <button 
          onClick={() => dispatch(hideNotification(notification.id))}
          className="text-gray-500 hover:text-white transition-colors p-1 shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

export default function ToastContainer() {
  const notifications = useSelector((state) => state.ui.notifications);

  return (
    <div className="fixed bottom-6 right-6 z-100 flex flex-col items-end pointer-events-none">
      <AnimatePresence>
        {notifications.map((notif) => (
          <Toast key={notif.id} notification={notif} />
        ))}
      </AnimatePresence>
    </div>
  );
}