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
      <DialogContent className="max-w-2xl w-full p-0 overflow-hidden rounded-3xl bg-[#18181b]/80 backdrop-blur-xl shadow-2xl border border-[#23232b]/60 text-white transition-all duration-300 min-h-[420px]">
        <DialogHeader className="flex justify-center items-center font-extrabold text-2xl py-3 border-b border-[#23232b]/60 bg-transparent tracking-tight">
          <span className="mx-auto">Create new post</span>
        </DialogHeader>
        <div className="flex flex-col md:flex-row w-full">
          {/* Left: Image Upload/Preview */}
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#121212]/70 border-r border-[#23232b]/40">
            {!imagePreview ? (
              <div className="flex flex-col items-center justify-center w-full gap-8">
                <FiImage className="w-16 h-16 text-gray-300 mb-8" />
                <div className="text-base font-normal text-gray-400 mb-8 text-center">Select a photo or video to share</div>
                <input
                  id="file-upload"
                  ref={imageRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={getFileHandler}
                />
                <Button
                  onClick={() => imageRef.current.click()}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-full py-3 text-base transition-all duration-200 focus:ring-2 focus:ring-blue-400/80 focus:outline-none"
                  aria-label="Select image from computer"
                >
                  Select from Computer
                </Button>
              </div>
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
          <div className="flex-1 flex flex-col justify-center p-8 gap-6 bg-[#18181b]/80 mx-auto">
            {/* User Info */}
            <div className="flex items-center gap-4 mb-2 border-b border-[#23232b]/40 pb-4">
              <Avatar className="w-14 h-14 shadow-md">
                <AvatarImage src={user?.profilePicture} alt="img" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="font-bold text-lg leading-tight">{user?.userName}</h1>
              </div>
            </div>
            {/* Caption */}
            <div className="flex justify-center w-full">
              <Textarea
                className="w-full h-44 resize-none px-4 py-3 focus-visible:ring-2 focus-visible:ring-blue-400/80 border border-[#23232b]/60 rounded-2xl text-base bg-[#23232b]/70 text-white placeholder-gray-400 shadow-sm focus:shadow-blue-400/10 transition-all overflow-y-auto whitespace-pre-line"
                placeholder="Write a caption..."
                aria-label="Caption"
                maxLength={2200}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                wrap="hard"
                spellCheck={false}
              />
            </div>
            <div className={`text-xs mt-1 text-right ${caption.length > 2200 ? 'text-red-400' : 'text-gray-400'}`}>{caption.length}/2200</div>
            {/* Location */}
            <div>
              <label className="block text-xs font-semibold mb-1 text-gray-300 tracking-wide" htmlFor="location-input">Location Name</label>
              <input
                id="location-input"
                type="text"
                className="w-full border border-[#23232b]/60 rounded-2xl px-4 py-3 text-base bg-[#23232b]/70 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-400/80 outline-none shadow-sm focus:shadow-blue-400/10 transition-all"
                placeholder="e.g. New York"
                value={location.name}
                onChange={e => setLocation({ ...location, name: e.target.value })}
                aria-label="Location Name"
              />
            </div>
            {/* Actions */}
            <div className="flex flex-col gap-3 mt-4">
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
