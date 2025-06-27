import { createSlice } from '@reduxjs/toolkit'

const chatSlice = createSlice({
    name: 'chat',
    initialState: {
        onlineUsers: [],
        messages:[],
        typingUser: null,
    },
    reducers: {
        setOnlineUsers:(state,action) => {
            state.onlineUsers = action.payload;
        },
        setMessages:(state,action) => {
            state.messages = action.payload;
        },
        setTypingUser: (state, action) => {
            state.typingUser = action.payload;
        },
        setMessageRead: (state, action) => {
            const msg = state.messages.find(m => m._id === action.payload.messageId);
            if (msg) msg.read = true;
        },
        removeMessage: (state, action) => {
            state.messages = state.messages.filter(m => m._id !== action.payload.messageId);
        },
    }
});

export const {setOnlineUsers, setMessages, setTypingUser, setMessageRead, removeMessage} = chatSlice.actions;
export default chatSlice.reducer;