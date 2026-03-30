import { createSlice } from '@reduxjs/toolkit';

const oracleSlice = createSlice({
  name: 'oracle',
  initialState: {
    weeklyHistory: []
  },
  reducers: {
    saveDailySnapshot: (state, action) => {
      state.weeklyHistory.push(action.payload);
      
      if (state.weeklyHistory.length > 7) {
        state.weeklyHistory.shift(); 
      }
    }
  }
});

export const { saveDailySnapshot } = oracleSlice.actions;
export default oracleSlice.reducer;