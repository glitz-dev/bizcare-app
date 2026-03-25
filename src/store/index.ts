import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import procurementReducer from './features/inventory/procurement/procurementSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    procurement: procurementReducer,
  },
});

// TypeScript helpers
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;