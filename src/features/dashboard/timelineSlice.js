import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  schedule: [
    { id: 't1', time: '8:00 AM', title: 'Aerobic BDNF Spike', subtitle: 'Hardware Maintained', status: 'upcoming', dotColor: 'bg-gray-800', startHour: 0, endHour: 10 },
    { id: 't2', time: '10:00 AM', title: '90-Min Deep Focus', subtitle: 'Career Journey Integration', status: 'upcoming', dotColor: 'bg-gray-800', startHour: 10, endHour: 14 },
    { id: 't3', time: '2:00 PM', title: 'Neuro-Gym', subtitle: 'Dual N-Back Session', status: 'upcoming', dotColor: 'bg-gray-800', startHour: 14, endHour: 18 },
    { id: 't4', time: '6:00 PM', title: 'Hemisphere Switch', subtitle: 'Creative task (Music/Art)', status: 'upcoming', dotColor: 'bg-gray-800', startHour: 18, endHour: 24 },
  ]
};

const timelineSlice = createSlice({
  name: 'timeline',
  initialState,
  reducers: {
    completeTask: (state, action) => {
      const taskId = action.payload;
      const task = state.schedule.find(t => t.id === taskId);
      
      if (task && task.status !== 'completed') {
        task.status = 'completed';
        task.dotColor = 'bg-green-500';
      }
    },
    
    toggleTask: (state, action) => {
      const taskId = action.payload;
      const task = state.schedule.find(t => t.id === taskId);
      
      if (task) {
        // Toggle status
        const isNowCompleted = task.status !== 'completed';
        task.status = isNowCompleted ? 'completed' : 'upcoming';
        task.dotColor = isNowCompleted ? 'bg-green-500' : 'bg-gray-800';
      }
    },
    setSchedule: (state, action) => {
    state.schedule = action.payload;
    },
    hydrateTimeline: (state, action) => {
      return { ...state, ...action.payload };
    },
    
    updateActiveTask: (state) => {
      const currentHour = new Date().getHours();
      
      //Reset all non-completed tasks to 'upcoming'
      state.schedule.forEach(task => {
        if (task.status !== 'completed') {
          task.status = 'upcoming';
          task.dotColor = 'bg-gray-800';
        }
      });

      let activeTask = state.schedule.find(
        t => t.status !== 'completed' && currentHour >= t.startHour && currentHour < t.endHour
      );

      if (!activeTask) {
         activeTask = state.schedule.find(t => t.status !== 'completed');
      }

      // 4. Activate it
      if (activeTask) {
        activeTask.status = 'active';
        activeTask.dotColor = 'bg-blue-500';
      }
    }
  }
});

export const { completeTask, updateActiveTask, hydrateTimeline, toggleTask, setSchedule } = timelineSlice.actions;
export default timelineSlice.reducer;