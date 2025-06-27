import { setMessages } from "@/redux/Slices/chatSlice";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from 'axios';
import axiosWithAuth from '../lib/axiosWithAuth';

const useGetRTM = () => {
  const { socket } = useSelector((store) => store.socketio);
  const { messages } = useSelector((store) => store.chat);
  const dispatch = useDispatch();

  // Listen for new messages via socket
  useEffect(() => {
    socket?.on("newMessage", (newMessage) => {
      dispatch(setMessages([...messages, newMessage]));
    });

    return () => {
      socket?.off('newMessage');
    };
  }, [messages, dispatch, socket]);

  // Fetch RTM messages on mount
  useEffect(() => {
    const fetchRTMMessages = async () => {
      try {
        const api = axiosWithAuth();
        const res = await api.get('/api/v1/message/rtm');
        if (res.data && Array.isArray(res.data.messages)) {
          dispatch(setMessages(res.data.messages));
        }
      } catch (error) {
        // Optionally handle error
        console.error("Failed to fetch RTM messages:", error);
      }
    };

    fetchRTMMessages();
  }, [dispatch]);
};

export default useGetRTM;
