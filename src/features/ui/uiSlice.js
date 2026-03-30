import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    notifications: [], 
  },
  reducers: {
  
    showNotification: (state, action) => {
      state.notifications.push({
        id: Date.now().toString(36) + Math.random().toString(36).substring(2),
        title: action.payload.title,
        message: action.payload.message,
        type: action.payload.type || 'system',
        duration: action.payload.duration || 6000
      });
    },

    hideNotification: (state, action) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    }
  }
});

export const { showNotification, hideNotification } = uiSlice.actions;
export default uiSlice.reducer;