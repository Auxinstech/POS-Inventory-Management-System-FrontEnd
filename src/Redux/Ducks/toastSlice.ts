// src/redux/toastSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { produce } from "immer";

export interface IToastState {
    message: string;
    type: 'success' | 'error' | 'info' | 'warning' | '';
}

const initialState: IToastState = {
    message: '',
    type: '', // Default state has no message or type
};

const toastSlice = createSlice({
    name: 'toast',
    initialState,
    reducers: {
        // Set the toast message and type
        setToast(state, action: PayloadAction<{ message: string; type: 'success' | 'error' | 'info' | 'warning' }>) {
            return produce(state, (draftState) => {
                draftState.message = action.payload.message;
                draftState.type = action.payload.type;
            });
        },
        // Clear the toast message and reset the type
        clearToast: (state) => {
            state.message = '';
            state.type = '';
        },
    },
});

export const { setToast, clearToast } = toastSlice.actions;

export default toastSlice.reducer;
