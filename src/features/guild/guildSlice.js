import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  deepWorkMode: true,
  squads: [],
  leaderboard: [
    { rank: 1, name: 'Sanjam', score: 2450, isUser: false },
    { rank: 2, name: 'Ansh', score: 2310, isUser: false },
    { rank: 3, name: 'Gurashish', score: 2180, isUser: true },
    { rank: 4, name: 'CipherGhost', score: 1940, isUser: false },
  ]
};

const guildSlice = createSlice({
  name: 'guild',
  initialState,
  reducers: {
    toggleDeepWork: (state) => {
      state.deepWorkMode = !state.deepWorkMode;
    },
    setSquads: (state, action) => {
      state.squads = action.payload;
    }
  }
});

export const { toggleDeepWork, setSquads } = guildSlice.actions;
export default guildSlice.reducer;