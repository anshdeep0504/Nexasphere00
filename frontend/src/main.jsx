import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Toaster } from "./components/ui/sonner";
import { Provider } from "react-redux";
import store from "./redux/store.js";
import { PersistGate } from "redux-persist/integration/react";
import { persistStore } from "redux-persist";
import { SocketContext } from './context/SocketContext';
import { io } from 'socket.io-client';

let persistor = persistStore(store);

// Create the socket instance
const socket = io(import.meta.env.VITE_BACKEND_URL);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SocketContext.Provider value={socket}>
          <App />
        </SocketContext.Provider>
        <Toaster />
      </PersistGate>
    </Provider>
  </StrictMode>
);
