import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  sleepHours: 7, 
  waterIntake: 0,
  dietLogged: false,
  caffeineLogs: [], 
  quickDrinks: [
    { id: 'default-1', name: 'Espresso', amount: 64 },
    { id: 'default-2', name: 'Filter', amount: 95 },
    { id: 'default-3', name: 'Pre-Wk', amount: 200 }
  ],
  // Granular Physical Telemetry
  exerciseProtocol: 'none', 
  exercised: false,         // <-- ADDED THIS HERE
  greenTime: false,         
  
  // Novelty Tracker
  noveltyTasksCompleted: 0, 
};

const hardwareSlice = createSlice({
  name: 'hardware',
  initialState,
  reducers: {
    logSleep: (state, action) => {
      state.sleepHours = action.payload;
    },
    toggleDiet: (state) => {
      state.dietLogged = !state.dietLogged;
    },
    logWater: (state, action) => {
      state.waterIntake = action.payload;
    },
    addCaffeine: (state, action) => {
      state.caffeineLogs.push({
        id: Date.now(),
        amount: action.payload.amount,
        name: action.payload.name,
        timestamp: Date.now()
      });
    },
    removeCaffeine: (state, action) => {
      state.caffeineLogs = state.caffeineLogs.filter(log => log.id !== action.payload);
    },
    addQuickDrink: (state, action) => {
      state.quickDrinks.push({
        id: Date.now().toString(),
        name: action.payload.name,
        amount: action.payload.amount
      });
    },
    removeQuickDrink: (state, action) => {
      state.quickDrinks = state.quickDrinks.filter(drink => drink.id !== action.payload);
    },
    
    // Actions to manage specific physical modalities
    setExerciseProtocol: (state, action) => {
      state.exerciseProtocol = action.payload;
      state.exercised = action.payload !== 'none';
    },
    toggleGreenTime: (state) => {
      state.greenTime = !state.greenTime;
    },
    
    // Action to increment Novelty Tasks
    incrementNovelty: (state) => {
      if (state.noveltyTasksCompleted < 2) {
        state.noveltyTasksCompleted += 1;
      }
    },
    
    hydrateHardware: (state, action) => {
      return { ...state, ...action.payload };
    },
    resetDailyHardware: (state) => {
      state.waterIntake = 0;
      state.sleepHours = 0;
      state.dietLogged = false;
      state.caffeineLogs = [];
      state.exerciseProtocol = 'none';
      state.exercised = false;
      state.greenTime = false;
      state.noveltyTasksCompleted = 0;
    },
  }
});

export const { 
  logSleep, 
  toggleDiet, 
  logWater, 
  addCaffeine, 
  removeCaffeine, 
  addQuickDrink, 
  removeQuickDrink, 
  setExerciseProtocol,
  toggleGreenTime,
  incrementNovelty,
  hydrateHardware,
  resetDailyHardware
} = hardwareSlice.actions;

export default hardwareSlice.reducer;