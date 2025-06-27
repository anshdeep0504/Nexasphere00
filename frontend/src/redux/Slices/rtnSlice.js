import { createSlice } from '@reduxjs/toolkit';

const rtnSlice = createSlice({
  name: 'realTimeNotification',
  initialState: {
    likeNotification: [],
  },
  reducers: {
    setLikeNotification: (state, action) => {
      if (action.payload.type === 'like') {
        state.likeNotification.push(action.payload);
      } else if (action.payload.type === 'dislike') {
        state.likeNotification = state.likeNotification.filter(
          (item) => item.userId !== action.payload.userId
        );
      }
    },
    removeLikeNotification: (state, action) => {
      state.likeNotification = state.likeNotification.filter(
        (notif) => notif._id !== action.payload
      );
    },
  },
});

// ✅ Export actions including removeLikeNotification
export const { setLikeNotification, removeLikeNotification } = rtnSlice.actions;

export default rtnSlice.reducer;
