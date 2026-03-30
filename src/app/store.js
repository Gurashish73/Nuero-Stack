import { configureStore } from '@reduxjs/toolkit';
import hardwareReducer from '../features/hardwareLog/hardwareSlice';
import streakReducer from '../features/dashboard/streakSlice';
import timelineReducer from '../features/dashboard/timelineSlice';
import vaultReducer from '../features/vault/vaultSlice'
import journeyReducer from '../features/journey/journeySlice';
import guildReducer from '../features/guild/guildSlice';
import authReducer from '../features/auth/authSlice';
import uiReducer from '../features/ui/uiSlice'
import oracleReducer from '../features/oracle/oracleSlice';

const loadState = () => {
  try {
    const serializedState = localStorage.getItem('neuroStackState');
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (err) {
    return undefined;
  }
};

const preloadedState = loadState();

export const store = configureStore({
  reducer: {
    hardware: hardwareReducer,
    streak: streakReducer,
    timeline: timelineReducer,
    vault: vaultReducer,
    journey: journeyReducer,
    guild: guildReducer,
    auth: authReducer,
    ui: uiReducer,
    oracle: oracleReducer,
  },
  preloadedState, 
});

store.subscribe(() => {
  try {
    const state = store.getState();
    const serializedState = JSON.stringify(state);
    localStorage.setItem('neuroStackState', serializedState);
  } catch (err) {
  }
});
