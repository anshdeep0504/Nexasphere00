import React, { useEffect, useState, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { setSelectedUser } from "@/redux/Slices/authSlice";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { RiMessengerLine } from "react-icons/ri";
import { MessageCircle } from "lucide-react";
import Messages from "./Messages";
import { toast } from "sonner";
import { setMessages, setTypingUser, setMessageRead } from "@/redux/Slices/chatSlice";
import { SocketContext } from "../context/SocketContext";
import axiosWithAuth from "../lib/axiosWithAuth";
import { useParams } from "react-router-dom";

const ChatPage = () => {
  const [message, setMessage] = useState("");
  const { user, suggestedUsers, selectedUser } = useSelector((store) => store.auth);
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
        const api = axiosWithAuth();
        await api.patch(`/api/v1/message/read/${selectedUser._id}`);
      } catch (e) {
        // silently fail
      }
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
        messages.forEach((msg) => {
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
      const res = await api.post(`/api/v1/message/send/${receiverId}`, { message });
      if (res.data.success) {
        dispatch(setMessages([...messages, res.data.newMessage]));
        setMessage("");
        toast.success(res.data.message);
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        toast.error(error.response.data.message);
      }
      // No fallback toast – silently ignore if no real message
    }
  };

  const followingUsers = suggestedUsers.filter((u) => user.following.includes(u._id));

  return (
    <div className="flex md:ml-[16%] h-screen bg-black text-white">
      {(!isMobile || !selectedUser) && (
        <aside className="w-full md:w-1/4 border-r border-gray-300 dark:border-gray-800 bg-gray-200 dark:bg-[#23232b] text-gray-900 dark:text-gray-100 shadow-lg rounded-r-3xl transition-all duration-300">
          <div className="px-6 py-6 border-b border-gray-300 dark:border-gray-800 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-wide">{user?.userName}</h1>
          </div>

          <div className="overflow-y-auto h-[85vh] custom-scrollbar px-2 py-4 space-y-2">
            {followingUsers.map((u) => {
              const isOnline = onlineUsers.includes(u?._id);
              const isSelected = selectedUser?._id === u._id;
              return (
                <div
                  key={u._id}
                  onClick={() => dispatch(setSelectedUser(u))}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer transition border border-transparent group
                    ${isSelected ? 'bg-gradient-to-r from-blue-400/20 to-pink-400/20 border-l-4 border-blue-400 dark:border-pink-400' : 'hover:bg-gray-300 dark:hover:bg-[#353545]'}
                  `}
                >
                  <div className="relative">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={u?.profilePicture} />
                      <AvatarFallback className="text-gray-900">CN</AvatarFallback>
                    </Avatar>
                    {isOnline && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-black rounded-full"></span>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{u?.userName}</span>
                    <span className={`text-xs ${isOnline ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400"}`}>
                      {isOnline ? "Online" : "Offline"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>
      )}

      {(!isMobile || selectedUser) && (
        selectedUser ? (
          <main className="flex-1 flex flex-col bg-gradient-to-br from-black via-gray-900 to-gray-800 h-full rounded-3xl shadow-2xl m-4 p-4">
            <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-800 sticky top-0 bg-black z-10">
              <div className="relative">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={selectedUser?.profilePicture} />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                {onlineUsers.includes(selectedUser?._id) && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-black rounded-full"></span>
                )}
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-lg">{selectedUser?.userName}</span>
                <span className="text-xs text-gray-500">
                  {onlineUsers.includes(selectedUser?._id) ? "Active now" : "Offline"}
                </span>
              </div>
            </div>

            <Messages selectedUser={selectedUser} />

            <div className="px-4 py-4 border-t border-gray-800 bg-[#0f0f0f] flex items-center gap-3 sticky bottom-0">
              <Input
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
                className="flex-1 bg-[#1f1f1f] text-white border-none rounded-full px-4 py-2 text-sm"
                placeholder="Type a message..."
              />
              <Button
                onClick={() => sendMessageHandler(selectedUser?._id)}
                className="bg-[#3797f0] hover:bg-[#1877f2] text-white rounded-full px-5 py-2 text-sm"
              >
                Send
              </Button>
            </div>
          </main>
        ) : (
          !isMobile && (
            <main className="flex flex-col items-center justify-center flex-1 bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white text-center rounded-3xl shadow-2xl m-4 p-4">
              <div className="relative w-28 h-28 mb-4">
                <MessageCircle className="w-full h-full opacity-30" />
                <RiMessengerLine className="absolute inset-0 w-14 h-14 m-auto text-white opacity-60" />
              </div>
              <h2 className="text-xl font-semibold">Your Messages</h2>
              <p className="text-sm text-gray-500 mt-1">Send a message to start a chat.</p>
            </main>
          )
        )
      )}
    </div>
  );
};

export default ChatPage;
