import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  mindProgress: 0,     
  bodyProgress: 0,     
  journeyProgress: 0,  
  currentStreak: 0,    
  limitlessLevel: 1,   
  shieldActive: false,
  lastActiveDate: null,
};

const streakSlice = createSlice({
  name: 'streak',
  initialState,
  reducers: {
    addMindProgress: (state, action) => {
      state.mindProgress = Math.min(100, state.mindProgress + action.payload);
    },
    addBodyProgress: (state, action) => {
      state.bodyProgress = Math.min(100, state.bodyProgress + action.payload);
    },
    addJourneyProgress: (state, action) => {
      state.journeyProgress = Math.min(100, state.journeyProgress + action.payload);
    },
    incrementStreak: (state) => {
      state.currentStreak += 1;
    },
    resetStreak: (state) => {
      state.currentStreak = 1;
    },
    setInitialStreak: (state, action) => {
      state.currentStreak = action.payload;
    },
    updateLastActiveDate: (state, action) => {
      state.lastActiveDate = action.payload;
    },
    hydrateStreak: (state, action) => {
      return { ...state, ...action.payload };
    },
  }
});

export const { 
  addMindProgress, 
  addBodyProgress, 
  addJourneyProgress, 
  incrementStreak, 
  resetStreak, 
  setInitialStreak, 
  updateLastActiveDate, 
  hydrateStreak 
} = streakSlice.actions;

export default streakSlice.reducer;