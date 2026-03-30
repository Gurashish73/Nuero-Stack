import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isAuthenticated: false,
    isInitializing: true,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.isInitializing = false;
    },
    setLoadingComplete: (state) => {
      state.isInitializing = false;
    }
  }
});

export const { setUser, setLoadingComplete } = authSlice.actions;
export default authSlice.reducer;