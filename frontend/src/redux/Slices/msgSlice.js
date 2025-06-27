import { createSlice } from '@reduxjs/toolkit';

const msgSlice = createSlice({
  name: 'realTimeMsgNotification',
  initialState: {
    msgNotification: [],
  },
  reducers: {
    setMsgNotification: (state, action) => {
      state.msgNotification.push(action.payload);
    },
    removeMsgNotification: (state, action) => {
      state.msgNotification = state.msgNotification.filter(
        (notif) => notif.userId !== action.payload
      );
    },
    clearAllMsgNotifications: (state) => {
      state.msgNotification = [];
    }
  },
});

export const { setMsgNotification, removeMsgNotification, clearAllMsgNotifications } =
  msgSlice.actions;

export default msgSlice.reducer;
