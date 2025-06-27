import React, { useState, useCallback } from "react";
import axios from "axios";
import debounce from "lodash.debounce";
import { Link } from "react-router-dom";
import { Dialog, DialogContent } from "./ui/dialog";
import { Heart, MessageCircle } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import axiosWithAuth from '../lib/axiosWithAuth';

const SearchPage = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({ users: [] });
  const [loading, setLoading] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [error, setError] = useState("");

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (q) => {
      if (!q) {
        setResults({ users: [] });
        setError("");
        return;
      }
      setLoading(true);
      setError("");
      try {
        const api = axiosWithAuth();
        const res = await api.get(`/api/v1/search?q=${encodeURIComponent(q)}`);
        setResults({ users: res.data.users || [] });
      } catch (e) {
        setResults({ users: [] });
        setError("Could not connect to the search service. Please try again later.");
      }
      setLoading(false);
    }, 300),
    []
  );

  const handleChange = (e) => {
    setQuery(e.target.value);
    debouncedSearch(e.target.value);
  };

  const safeUsers = Array.isArray(results.users) ? results.users : [];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-[#121212] text-black dark:text-white pt-10">
      <h1 className="text-2xl font-bold mb-4">Search</h1>
      <input
        value={query}
        onChange={handleChange}
        placeholder="Search for users..."
        className="w-full max-w-md px-4 py-2 rounded-full border border-gray-300 dark:border-[#262626] bg-gray-50 dark:bg-[#23232b] text-black dark:text-white"
      />
      {loading && <div className="text-center py-2">Searching...</div>}
      {error && <div className="text-red-500 text-center py-2">{error}</div>}
      {safeUsers.length > 0 ? (
        <div className="bg-white dark:bg-[#23232b] rounded shadow mt-6 p-4 w-full max-w-md">
          <h4 className="font-bold mb-2">Users</h4>
          {safeUsers.length === 0 && <div className="text-gray-400">No users found.</div>}
          {safeUsers.map(u => (
            <Link to={`/profile/${u._id}`} key={u._id} className="flex items-center gap-2 py-1 hover:underline">
              <Avatar className="w-8 h-8">
                <AvatarImage src={u.profilePicture} />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <span>{u.userName}</span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-8 text-gray-400 dark:text-gray-500">Search results will appear here.</div>
      )}
      {/* Post Modal */}
      {selectedPost && (
        <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
          <DialogContent className="max-w-2xl w-full flex flex-col md:flex-row p-0">
            <div className="w-full md:w-1/2 bg-black flex items-center justify-center">
              <img src={selectedPost.image || '/default-post.png'} alt="post_img" className="w-full h-full object-contain bg-black max-h-60 md:max-h-none" />
            </div>
            <div className="w-full md:w-1/2 flex flex-col bg-white text-black dark:bg-[#23232b] dark:text-gray-100">
              <div className="flex items-center gap-3 px-4 py-2 border-b">
                <img src={selectedPost.author?.profilePicture || '/default-avatar.png'} alt="" className="w-8 h-8 rounded-full object-cover" />
                <span className="font-semibold">{selectedPost.author?.userName}</span>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-2">
                <div className="mb-2 text-sm">{selectedPost.caption}</div>
                <div className="flex items-center gap-4 mt-2">
                  <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                  <span>{selectedPost.likes?.length || 0}</span>
                  <MessageCircle className="w-5 h-5 fill-gray-400 text-gray-400" />
                  <span>{selectedPost.comments?.length || 0}</span>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default SearchPage; 