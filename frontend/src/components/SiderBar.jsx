import {
  Heart,
  Home,
  LogOut,
  MessageCircle,
  PlusSquare,
  Search,
  Moon,
  Sun,
  PlusCircle,
  User,
} from "lucide-react";
import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { toast } from "sonner";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setAuthUser, setSelectedUser } from "@/redux/Slices/authSlice";
import CreatePost from "./CreatePost";
import { Button } from "./ui/button";
import axiosWithAuth from "@/lib/axiosWithAuth";

const SiderBar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((store) => store.auth);
  const [open, setOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => document.body.classList.contains('dark'));

  const logoutHandler = async () => {
    try {
      const api = axiosWithAuth();
      const res = await api.get(`/api/v1/user/logout`, {
      });
      if (res.data.success) {
        dispatch(setAuthUser(null));
        navigate("/login");
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    }
  };

  const toggleDarkMode = () => {
    document.body.classList.toggle('dark');
    setDarkMode(document.body.classList.contains('dark'));
  };

  return (
    <>
      {/* Desktop Sidebar (never shows on mobile) */}
      <div className="group hidden md:flex flex-col justify-between fixed top-0 left-0 h-screen w-20 hover:w-56 bg-black border-r border-gray-800 z-20 transition-all duration-200 ease-in-out">
        {/* Logo */}
        <div className="flex items-center justify-center h-24">
          <div className="rounded-full bg-black shadow p-3 flex items-center justify-center transition-all">
            <span className="text-4xl font-extrabold text-red-600">N</span>
          </div>
          <span className="ml-4 text-2xl font-bold text-white hidden group-hover:inline transition-all">Nexasphere</span>
        </div>
        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-2 items-center md:items-start px-2 mt-2 justify-center group-hover:justify-start">
          <div className="flex flex-col items-center w-full">
            <button onClick={() => navigate('/')} className="flex items-center justify-center gap-3 py-3 w-full hover:bg-gray-800 rounded-xl transition-colors text-white">
              <Home size={26} />
              <span className="hidden group-hover:inline text-base font-medium">Home</span>
            </button>
            <button onClick={() => navigate('/search')} className="flex items-center justify-center gap-3 py-3 w-full hover:bg-gray-800 rounded-xl transition-colors text-white">
              <Search size={26} />
              <span className="hidden group-hover:inline text-base font-medium">Search</span>
            </button>
            <button onClick={() => setOpen(true)} className="flex items-center justify-center gap-3 py-3 w-full hover:bg-gray-800 rounded-xl transition-colors text-white">
              <PlusSquare size={26} />
              <span className="hidden group-hover:inline text-base font-medium">Create</span>
            </button>
            <button onClick={() => navigate('/chat')} className="flex items-center justify-center gap-3 py-3 w-full hover:bg-gray-800 rounded-xl transition-colors text-white">
              <MessageCircle size={26} />
              <span className="hidden group-hover:inline text-base font-medium">DMs</span>
            </button>
          </div>
        </nav>
        {/* Profile & Logout */}
        <div className="mb-6 flex flex-col items-center md:items-start px-2 gap-1">
          <button onClick={() => navigate(`/profile/${user?._id}`)} className="flex items-center justify-center gap-3 py-3 w-full hover:bg-gray-800 rounded-xl transition-colors text-white">
            <Avatar className="w-7 h-7">
              <AvatarImage src={user?.profilePicture} />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <span className="hidden group-hover:inline text-base font-medium">Profile</span>
          </button>
          <Button
            variant="ghost"
            className="flex items-center justify-center gap-2 w-full text-white hover:text-blue-500"
            onClick={toggleDarkMode}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            <span className="hidden group-hover:inline text-base font-medium">Theme</span>
          </Button>
          <button onClick={logoutHandler} className="flex items-center justify-center gap-3 py-3 w-full hover:bg-gray-800 rounded-xl transition-colors text-white">
            <LogOut size={26} />
            <span className="hidden group-hover:inline text-base font-medium">Logout</span>
          </button>
        </div>
        <CreatePost user={user} open={open} setOpen={setOpen} />
      </div>
      {/* Mobile Bottom Nav: always visible, full width, icons only */}
      <div className="fixed bottom-0 left-0 w-full bg-white/90 dark:bg-[#23232b]/90 border-t border-gray-200 dark:border-gray-700 flex md:hidden justify-between items-center px-6 py-2 z-50">
        <Link to="/" className="flex flex-col items-center text-xs text-gray-700 dark:text-gray-200"><Home size={22} /></Link>
        <Link to="/search" className="flex flex-col items-center text-xs text-gray-700 dark:text-gray-200"><Search size={22} /></Link>
        <button onClick={() => setOpen(true)} className="flex flex-col items-center text-xs text-gray-700 dark:text-gray-200"><PlusCircle size={22} /></button>
        <Link to="/chat" className="flex flex-col items-center text-xs text-gray-700 dark:text-gray-200"><MessageCircle size={22} /></Link>
        <Link to={`/profile/${user?._id}`} className="flex flex-col items-center text-xs text-gray-700 dark:text-gray-200"><User size={22} /></Link>
      </div>
      {/* Mobile CreatePost modal trigger */}
      <CreatePost user={user} open={open} setOpen={setOpen} />
    </>
  );
};

export default SiderBar;
