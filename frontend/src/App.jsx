import Login from "./components/Login";
import Signup from "./components/Signup";
import MainLayout from "./components/MainLayout";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Profile from "./components/Profile";
import Home from "./components/Home";
import EditProfile from "./components/EditProfile";
import ChatPage from "./components/ChatPage";
import PrivateRoute from "./components/PrivateRoute";
import { io } from "socket.io-client";
import { useEffect, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSocket } from "./redux/Slices/socketSlice";
import { setOnlineUsers } from "./redux/Slices/chatSlice";
import { setLikeNotification } from "./redux/Slices/rtnSlice";
import { setMsgNotification } from "./redux/Slices/msgSlice";
import TopNavBar from "./components/TopNavBar";
import StoriesBar from "./components/StoriesBar";
import SearchPage from "./components/SearchPage";
import { SocketContext } from './context/SocketContext';
import axios from 'axios';

const browserRouter = createBrowserRouter([
  {
    path: "/",
    element: (
      <PrivateRoute>
        <MainLayout />
      </PrivateRoute>
    ),
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/profile/:id",
        element: <Profile />,
      },
      {
        path: "/account/edit",
        element: <EditProfile />,
      },
      {
        path: "/chat",
        element: <ChatPage />,
      },
      {
        path: "/search",
        element: <SearchPage />,
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
]);

function App() {
  const { user } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  const socket = useContext(SocketContext);

  useEffect(() => {
    if (user) {
      // listen all events
      socket.on("getOnlineUsers", (onlineUsers) => {
        dispatch(setOnlineUsers(onlineUsers));
      });

      socket.on("notification", (notification) => {
        dispatch(setLikeNotification(notification));
      });

      socket.on("messageNotification", (msgNotification) => {
        dispatch(setMsgNotification(msgNotification));
      });

      return () => {
        socket.close();
      };
    }
  }, [user, dispatch, socket]);

  useEffect(() => {
    if (!document.body.classList.contains('dark')) {
      document.body.classList.add('dark');
    }
  }, []);
  
  return (
    <RouterProvider router={browserRouter} />
  );
}

export default App;
