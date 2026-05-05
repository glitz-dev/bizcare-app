import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import procurementReducer from './features/inventory/procurement/procurementSlice';
import purchaseOrderReducer from './features/inventory/procurement/purchaseOrderSlice';
import purchaseReducer from './features/inventory/procurement/purchaseSlice';
import purchaseReturnReducer from './features/inventory/procurement/purchaseReturnSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    procurement: procurementReducer,
    purchaseOrder: purchaseOrderReducer,
    purchase: purchaseReducer,
    purchaseReturn: purchaseReturnReducer,

  },
});

// TypeScript helpers
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;