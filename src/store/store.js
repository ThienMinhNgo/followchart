import { configureStore } from '@reduxjs/toolkit';
import handleReducer from './handleSlice';

export const store = configureStore({
    reducer: {
        handle: handleReducer,
    },
});

export default store;
