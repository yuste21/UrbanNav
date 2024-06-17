import { createSlice } from "@reduxjs/toolkit";

export const initialState = {
    active: false
}

export const helpSlice = createSlice({
    name: 'help',
    initialState,
    reducers: {
        handleCheck: (state, action) => {
            return {
                active: !state.active
            }
        }
    }
})

export const { handleCheck } = helpSlice.actions

export default helpSlice.reducer