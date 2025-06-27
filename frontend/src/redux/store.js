import { combineReducers, configureStore } from "@reduxjs/toolkit";
import authSlice from './Slices/authSlice.js';
import postSlice from './Slices/postSlice.js'
import socketSlice from './Slices/socketSlice.js'
import chatSlice from './Slices/chatSlice.js'
import rtnSlice from './Slices/rtnSlice.js'
import msgSlice from './Slices/msgSlice.js'

import {
    persistReducer,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";



const persistConfig = {
    key: "root",
    version: 1,
    storage,
}

const rootReducer = combineReducers({
    auth: authSlice,
    post: postSlice,
    socketio: socketSlice,
    chat: chatSlice,
    realTimeNotification: rtnSlice,
    realTimeMsgNotification: msgSlice,
})

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
});

export default store;