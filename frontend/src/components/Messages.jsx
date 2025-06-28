import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { useSelector, useDispatch } from "react-redux";
import useGetAllMessages from "@/hooks/useGetallMessages";
import useGetRTM from "@/hooks/useGetRTM";
import { removeMessage, setMessages } from "@/redux/Slices/chatSlice";
import axios from "axios";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { useState } from "react";
import axiosWithAuth from '../lib/axiosWithAuth';

const Messages = ({ selectedUser}) => {
  useGetRTM();
  useGetAllMessages();
  const {messages} = useSelector(store => store.chat);
  const {user}= useSelector(store => store.auth);
  const { typingUser } = useSelector(store => store.chat);
  const dispatch = useDispatch();
  const [openMenuId, setOpenMenuId] = useState(null);
 

  // Delete message handler
  const handleDelete = async (msg, forEveryone = false) => {
    try {
      const api = axiosWithAuth();
      const res = await api.delete(`/api/v1/message/delete/${msg._id}`, {
        data: { forEveryone },
      });
      if (res.data.success) {
        if (forEveryone) {
          dispatch(removeMessage({ messageId: msg._id }));
          dispatch(setMessages(messages.map(m => m._id === msg._id ? { ...m, isDeletedForEveryone: true } : m)));
        } else {
          // For just me: update message in Redux to add my userId to deletedFor
          dispatch(setMessages(messages.map(m => m._id === msg._id ? { ...m, deletedFor: [...(m.deletedFor || []), user._id] } : m)));
        }
      }
    } catch (e) {
      // Optionally show error
    }
  };

  return (
    <div className="overflow-y-auto flex-1 p-4 bg-black">
      <div className="flex justify-center">
        <section className="flex flex-col items-center justify-center text-center text-white mt-10">
          <Avatar className="w-15 h-15 ">
            <AvatarImage
              src={selectedUser?.profilePicture}
              alt="User Avatar"
              className="object-cover"
            />
            <AvatarFallback className="bg-gray-700 dark:bg-gray-800 text-gray-900">
              CN
            </AvatarFallback>
          </Avatar>

          <h2 className="text-lg font-bold text-white dark:text-white">
            {selectedUser?.userName}
          </h2>
          <p className="text-gray-400 mb-3">
            {selectedUser?.userName} · Instagram
          </p>

          <Button variant='secondary' className="text-center rounded-l-lg rounded-r-lg bg-gray-600 dark:bg-gray-700 hover:bg-gray-500 dark:hover:bg-gray-600 text-white font-medium px-3 py-1 mb-3">
            <Link to={`/profile/${selectedUser._id}`}><span className="text-center text-sm">View profile</span></Link>
          </Button>

          <p className="text-gray-500 text-xs">
            {new Date().toLocaleDateString()} ·{" "}
            {new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </section>
      </div>

      <div className="flex flex-col gap-3">
        {typingUser && typingUser === selectedUser?.userName && (
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-gray-400 animate-pulse">{typingUser} is typing...</span>
          </div>
        )}
        {messages && messages.map((msg, idx) => {
         const isSender = msg.senderId === user?._id;
         const isHtml = /<img|<div|<br|<span|<p|<b|<i|<strong|<em|<a|<table|<tr|<td|<th|<ul|<ol|<li|<h[1-6]/i.test(msg.message);

          const isLastSent = isSender && idx === messages.length - 1;

          // Hide if deleted for me
          if (msg.deletedFor && msg.deletedFor.includes(user._id)) return null;

          // If message is deleted for everyone (i.e., not found in Redux because sender deleted for everyone), show a placeholder
          if (msg.isDeletedForEveryone) {
            return (
              <div key={msg._id} className="flex justify-center my-2">
                <div className="flex items-center gap-2 px-4 py-2 rounded-2xl text-xs italic text-gray-400 bg-gray-800 dark:bg-gray-900">
                  <Trash2 size={16} className="text-gray-400" />
                  Deleted for everyone
                </div>
              </div>
            );
          }

          return (
            <React.Fragment key={msg._id}>
              <div
                className={`flex ${isSender ? "justify-end" : "justify-start"}`}
              >
                {!msg.isDeletedForEveryone && (
                  <div className="relative flex items-center group">
                    <div
                      className={`max-w-xs px-4 py-2 rounded-2xl text-sm break-words shadow-md ${
                        isSender
                          ? "bg-blue-500 text-white rounded-br-none dark:bg-blue-600"
                          : "bg-gray-800 text-white rounded-bl-none dark:bg-gray-900"
                      }`}
                    >
                      {isHtml ? (
                        <span dangerouslySetInnerHTML={{ __html: msg.message }} />
                      ) : (
                        msg.message
                      )}
                    </div>
                    <button
                      className="ml-1 opacity-60 hover:opacity-100 focus:outline-none"
                      onClick={() => setOpenMenuId(openMenuId === msg._id ? null : msg._id)}
                      tabIndex={0}
                    >
                      <MoreHorizontal size={18} />
                    </button>
                    {openMenuId === msg._id && (
                      <div className="absolute z-10 right-0 top-7 bg-gray-900 border border-gray-700 rounded shadow-md min-w-[140px] flex flex-col text-sm">
                        <button
                          className="px-4 py-2 hover:bg-gray-800 text-left text-white"
                          onClick={() => { handleDelete(msg, false); setOpenMenuId(null); }}
                        >
                          Delete for me
                        </button>
                        {isSender && (
                          <button
                            className="px-4 py-2 hover:bg-gray-800 text-left text-red-400"
                            onClick={() => { handleDelete(msg, true); setOpenMenuId(null); }}
                          >
                            Delete for everyone
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
              {isLastSent && (
                <div className="flex justify-end mt-1">
                  <span className={`text-xs font-semibold ${msg.read ? 'text-green-400' : 'text-gray-400'}`}>{msg.read ? 'Seen' : 'Delivered'}</span>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default Messages;
