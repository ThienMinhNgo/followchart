import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    selectedHandle: null,
};

const handleSlice = createSlice({
    name: 'handle',
    initialState,
    reducers: {
        setSelectedHandle: (state, action) => {
            state.selectedHandle = action.payload;
        },
    },
});

export const { setSelectedHandle } = handleSlice.actions;
export default handleSlice.reducer;
