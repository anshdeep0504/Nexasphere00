import React, { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader } from "./ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { getFileAsDataURL } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setPosts } from "@/redux/Slices/postSlice";
import { FiImage } from "react-icons/fi";
import axiosWithAuth from '../lib/axiosWithAuth';

const CreatePost = ({ user, open, setOpen }) => {
  const imageRef = useRef();
  const [file, setFile] = useState("");
  const [caption, setCaption] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const { posts } = useSelector((store) => store.post);
  const dispatch = useDispatch();
  const [location, setLocation] = useState({ name: "", lat: "", lng: "" });

  useEffect(() => {
    if (!open) {
      // Reset form values when dialog closes
      setCaption("");
      setFile("");
      setImagePreview("");
    }
  }, [open]);

  const getFileHandler = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      const dataUrl = await getFileAsDataURL(file);
      setImagePreview(dataUrl);
    }
  };

  const createPostHandler = async () => {
    const formData = new FormData();
    formData.append("caption", caption);
    if (imagePreview) formData.append("image", file);
    formData.append("location", JSON.stringify(location));
    try {
      setLoading(true);
      const api = axiosWithAuth();
      const response = await api.post(
      `/api/v1/post/addpost`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },

        }
      );
      if (response.data.success) {
        dispatch(setPosts([response.data.post, ...posts]));
        toast.success(response.data.message);
        setOpen(false);
      }
    } catch (error) {
      console.log(error);
      toast.error(
        error?.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl w-full p-0 overflow-hidden rounded-3xl bg-[#18181b]/80 backdrop-blur-xl shadow-2xl border border-[#23232b]/60 text-white transition-all duration-300">
        <DialogHeader className="text-center font-extrabold text-2xl py-5 border-b border-[#23232b]/60 bg-transparent tracking-tight">Create new post</DialogHeader>
        <div className="flex flex-col md:flex-row w-full">
          {/* Left: Image Upload/Preview */}
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#121212]/70 min-h-[340px] border-r border-[#23232b]/40">
            {!imagePreview ? (
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center w-full h-64 min-h-[16rem] border-2 border-dashed border-blue-400/40 rounded-2xl cursor-pointer transition-all duration-200 hover:border-blue-500/80 focus-within:border-blue-500/80 bg-[#23232b]/40 backdrop-blur-md group shadow-lg text-center"
                tabIndex={0}
                aria-label="Upload image"
              >
                <FiImage className="w-14 h-14 text-blue-400/70 mb-3 group-hover:scale-110 transition-transform duration-200" />
                <span className="text-gray-300 font-medium text-base flex items-center justify-center w-full">Drag & drop or click to select an image</span>
                <input
                  id="file-upload"
                  ref={imageRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={getFileHandler}
                />
              </label>
            ) : (
              <div className="relative w-full flex flex-col items-center">
                <img
                  src={imagePreview}
                  alt="post preview"
                  className="w-full max-h-64 object-contain rounded-2xl border border-blue-400/30 bg-black shadow-md"
                />
                <Button
                  type="button"
                  variant="secondary"
                  className="mt-4 w-full bg-[#23232b]/80 text-white hover:bg-[#23232b]/90 border border-blue-400/30 shadow-sm font-semibold rounded-xl"
                  onClick={() => { setImagePreview(""); setFile(""); imageRef.current.value = null; }}
                >
                  Change Image
                </Button>
              </div>
            )}
          </div>
          {/* Right: Form Fields */}
          <div className="flex-1 flex flex-col justify-between p-8 gap-8 bg-[#18181b]/80">
            {/* User Info */}
            <div className="flex items-center gap-4 mb-2 border-b border-[#23232b]/40 pb-4">
              <Avatar className="w-14 h-14 shadow-md">
                <AvatarImage src={user?.profilePicture} alt="img" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="font-bold text-lg leading-tight">{user?.userName}</h1>
                <span className="text-gray-400 text-xs font-medium">{user?.bio}</span>
              </div>
            </div>
            {/* Caption */}
            <div>
              <Textarea
                className="resize-none focus-visible:ring-2 focus-visible:ring-blue-400/80 border border-[#23232b]/60 rounded-2xl text-base bg-[#23232b]/70 text-white placeholder-gray-400 min-h-[80px] shadow-sm focus:shadow-blue-400/10 transition-all"
                placeholder="Write a caption..."
                aria-label="Caption"
                maxLength={2200}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
              />
              <div className={`text-xs mt-1 text-right ${caption.length > 2200 ? 'text-red-400' : 'text-gray-400'}`}>{caption.length}/2200</div>
            </div>
            {/* Location */}
            <div>
              <label className="block text-xs font-semibold mb-1 text-gray-300 tracking-wide" htmlFor="location-input">Location Name</label>
              <input
                id="location-input"
                type="text"
                className="w-full border border-[#23232b]/60 rounded-2xl px-3 py-2 text-base bg-[#23232b]/70 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-400/80 outline-none shadow-sm focus:shadow-blue-400/10 transition-all"
                placeholder="e.g. New York"
                value={location.name}
                onChange={e => setLocation({ ...location, name: e.target.value })}
                aria-label="Location Name"
              />
            </div>
            {/* Actions */}
            <div className="flex flex-col gap-3 mt-4">
              {!imagePreview && (
                <Button
                  onClick={() => imageRef.current.click()}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-bold rounded-2xl py-3 shadow-lg transition-all duration-200 focus:ring-2 focus:ring-blue-400/80 focus:outline-none"
                  aria-label="Select image from computer"
                  style={{boxShadow: '0 4px 24px 0 rgba(0,0,0,0.10)'}}
                >
                  Select from Computer
                </Button>
              )}
              {imagePreview && (
                loading ? (
                  <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold rounded-2xl py-3 shadow-lg" disabled>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Please wait...
                  </Button>
                ) : (
                  <Button
                    onClick={createPostHandler}
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-extrabold rounded-2xl py-3 text-lg shadow-xl transition-all duration-200 focus:ring-2 focus:ring-blue-400/80 focus:outline-none"
                    disabled={!imagePreview || !caption.trim()}
                    aria-label="Post"
                    style={{boxShadow: '0 6px 32px 0 rgba(0,100,255,0.10)'}}
                  >
                    Post
                  </Button>
                )
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePost;
