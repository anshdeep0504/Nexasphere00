import React from "react";
import { Home, Search, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TopNavBar = () => {
  const navigate = useNavigate();
  return (
    <header className="fixed top-0 left-0 w-full h-14 bg-white shadow z-30 flex items-center justify-between px-4 font-sans">
      <div className="flex items-center gap-2">
        <img src="/logo.png" alt="App Logo" className="w-8 h-8" />
      </div>
      <nav className="flex items-center gap-6">
        <button onClick={() => navigate('/')} className="hover:text-pink-500"><Home size={24} /></button>
        <button onClick={() => navigate('/search')} className="hover:text-pink-500"><Search size={24} /></button>
        <button onClick={() => navigate('/chat')} className="hover:text-pink-500"><MessageCircle size={24} /></button>
      </nav>
    </header>
  );
};

export default TopNavBar; 