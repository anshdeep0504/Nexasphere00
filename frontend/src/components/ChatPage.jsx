import React, { useEffect, useState, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { setSelectedUser } from "@/redux/Slices/authSlice";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { RiMessengerLine } from "react-icons/ri"; // Remix Icon
import { MessageCircle } from "lucide-react";
import Messages from "./Messages";
import axios from "axios";
import { toast } from "sonner";
import { setMessages, setTypingUser, setMessageRead } from "@/redux/Slices/chatSlice";
import { SocketContext } from '../context/SocketContext';
import axiosWithAuth from '../lib/axiosWithAuth';
import { useParams } from "react-router-dom";

const ChatPage = () => {
  const [message, setMessage] = useState("");
  const { user, suggestedUsers, selectedUser } = useSelector(
    (store) => store.auth
  );
  const [search, setSearch] = useState("");
  const { onlineUsers, messages } = useSelector((store) => store.chat);
  const socket = useContext(SocketContext);
  const dispatch = useDispatch();
  const { id } = useParams();

  const isMobile = window.innerWidth < 768;

  useEffect(() => {
    return () => {
      dispatch(setSelectedUser(null));
    };
  }, []);

  useEffect(() => {
    if (!selectedUser || !user) return;
    (async () => {
      try {
        const token = localStorage.getItem('token');
  
        await api.patch(`/api/v1/message/read/${selectedUser._id}`,);
      } catch (e) { /* ignore */ }
    })();
  }, [selectedUser, user]);

  useEffect(() => {
    if (!socket || !selectedUser) return;
    const handleTyping = (data) => {
      if (data.senderId === selectedUser._id) {
        dispatch(setTypingUser(selectedUser.userName));
        setTimeout(() => dispatch(setTypingUser(null)), 2000);
      }
    };
    const handleMessageRead = (data) => {
      if (data.readerId === selectedUser._id) {
        messages.forEach(msg => {
          if (msg.senderId === user._id && msg.receiverId === selectedUser._id && !msg.read) {
            dispatch(setMessageRead({ messageId: msg._id }));
          }
        });
      }
    };
    socket.on("typing", handleTyping);
    socket.on("messageRead", handleMessageRead);
    return () => {
      socket.off("typing", handleTyping);
      socket.off("messageRead", handleMessageRead);
    };
  }, [socket, selectedUser, dispatch, messages, user]);

  useEffect(() => {
    if (!selectedUser || !user) return;
    const fetchMessages = async () => {
      try {
        const api = axiosWithAuth();
        const res = await api.get(`/api/v1/message/getmessage/${selectedUser._id}`);
        dispatch(setMessages(res.data.messages || []));
      } catch (error) {
        if (error?.response?.status === 401) {
          toast.error("Session expired. Please log in again.");
        } else if (error?.response?.status >= 500) {
          toast.error("Server error. Please try again later.");
        }
        dispatch(setMessages([]));
      }
    };
    fetchMessages();
  }, [selectedUser, user, dispatch]);

  const api = axiosWithAuth();
  const sendMessageHandler = async (receiverId) => {
    try {
      const res = await api.post(
        `/api/v1/message/send/${receiverId}`,
        { message }
      );
      if (res.data.success) {
        dispatch(setMessages([...messages, res.data.newMessage]));
        setMessage("");
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    }
  };

  const followingUsers = suggestedUsers.filter((u) =>
    user.following.includes(u._id)
  );

  const handleLogout = () => {
    localStorage.removeItem('token');
    // Optionally, redirect to login or home page
    // navigate('/login');
    // Optionally, clear user state in Redux
  };

  return (
    <div className="flex md:ml-[16%] h-screen">
      {/* Chat List (show on desktop, or on mobile if no user selected) */}
      {(!isMobile || !selectedUser) && (
        <section className="w-full md:w-1/4 border-r border-r-gray-700 bg-[#18181b] dark:bg-[#18181b]">
          <h1 className="font-bold px-7 py-3.5 text-xl ">{user?.userName}</h1>
          <div className="px-4 pb-2">Add commentMore actions
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search users..."
              className="w-full px-3 py-2 rounded-lg bg-[#23232b] text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <hr className="mb-2 border-gray-700" />
          <div className="overflow-y-auto h-[75vh] pr-2">
            {followingUsers.map((u) => {
              const isOnline = onlineUsers.includes(u?._id);
              return (
                <div
                  key={u._id}
                  onClick={() => dispatch(setSelectedUser(u))}
                  className="flex gap-3 items-center p-3 hover:bg-gray-100 dark:hover:bg-[#23232b] cursor-pointer"
                >
                  <div className="relative">
                    <Avatar>
                      <AvatarImage src={u?.profilePicture} />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    {isOnline && (
                      <span className="absolute bottom-0 right-0 block w-3 h-3 bg-green-500 border-2 border-white dark:border-[#23232b] rounded-full"></span>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium">{u?.userName}</span>
                    <span
                      className={`text-xs font-bold ${
                        isOnline ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {isOnline ? "online" : "offline"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
      {/* Chat Window (show on desktop, or on mobile if user selected) */}
      {(!isMobile || selectedUser) && (
        selectedUser ? (
          <section className="flex-1 flex flex-col h-full bg-black">
            <div className="flex gap-3 items-center px-3 py-3 border-b border-gray-800 sticky top-0 bg-black z-index-10">
              <div className="relative">
                <Avatar>
                  <AvatarImage src={selectedUser?.profilePicture} />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                {onlineUsers.includes(selectedUser?._id) && (
                  <span className="absolute bottom-0 right-0 block w-3 h-3 bg-green-500 border-2 border-black rounded-full"></span>
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-white">{selectedUser?.userName}</span>
              </div>
            </div>

            <Messages selectedUser={selectedUser} />

            <div className="flex items-center justify-end p-3 md:p-5 border-t border-t-gray-800 pb-20 md:pb-8 bg-black">
              <Input
                type="text"
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  if (socket && selectedUser) {
                    socket.emit("typing", {
                      receiverId: selectedUser._id,
                      senderId: user._id,
                    });
                  }
                }}
                className="flex-1 mr-2 focus-visible:ring-transparent bg-gray-900 text-white rounded-full px-4 py-2 border-none"
                placeholder="Message..."
              />
              <Button
                onClick={() => sendMessageHandler(selectedUser?._id)}
                className="bg-blue-500 text-white hover:bg-blue-600 px-4 py-2 rounded-full"
              >
                Send
              </Button>
            </div>
          </section>
        ) : (
          !isMobile && (
            <div className="flex flex-col items-center justify-center mx-auto text-center mt-10 ">
              <div className="relative w-32 h-32 my-4">
                <MessageCircle className="w-full h-full stroke-[1]" />
                <RiMessengerLine className="absolute inset-0 m-auto w-15 h-15" />
              </div>
              <h1 className="font-semibold text-lg">Your Messages</h1>
              <span className="text-gray-600">Send a message to start a chat.</span>
            </div>
          )
        )
      )}
    </div>
  );
};

export default ChatPage;
