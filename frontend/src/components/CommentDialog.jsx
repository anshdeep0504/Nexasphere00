import React, { useEffect, useState } from "react";
import { Dialog, DialogContent } from "./ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Link } from "react-router-dom";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { MoreHorizontal, Send } from "lucide-react";
import { Button } from "./ui/button";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { toast } from "sonner";
import { setPosts, setSelectedPost } from "@/redux/Slices/postSlice";
import axiosWithAuth from '../lib/axiosWithAuth';


const CommentDialog = ({ open, setOpen }) => {
  const [text, setText] = useState("");
  const { selectedPost, posts } = useSelector((store) => store.post);
  const [comment, setComment] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    if (selectedPost) setComment(selectedPost?.comments || []);
  }, [selectedPost]);

  const changeEventHandler = (e) => {
    const inputText = e.target.value;
    setText(inputText.trim() ? inputText : "");
  };

  const sendMessageHandler = async () => {
    try {
      const api = axiosWithAuth();
      const res = await api.post(
        `/api/v1/post/${selectedPost?._id}/comment`,
        { text },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (res.data.success) {
        const updatedCommentData = [...comment, res.data.comment];
        setComment(updatedCommentData);

        const updatedPostData = posts.map((p) =>
          p._id === selectedPost._id
            ? { ...p, comments: updatedCommentData }
            : p
        );

        dispatch(setPosts(updatedPostData));
        dispatch(
          setSelectedPost({
            ...selectedPost,
            comments: updatedCommentData,
          })
        );
        toast.success(res.data.message);
        setText("");
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    }
  };

  

  return (
    <Dialog open={open}>
      <DialogContent
        onInteractOutside={() => setOpen(false)}
        className="bg-white dark:bg-[#23232b] rounded-xl shadow font-sans max-w-lg w-full p-0 overflow-hidden flex flex-col md:flex-row text-gray-900 dark:text-gray-100"
      >
        <div className="flex w-full flex-col md:flex-row">
          {/* Left: Image */}
          <div className="w-full md:w-1/2 bg-black flex items-center justify-center">
            <img
              src={selectedPost?.image}
              alt="post_img"
              className="w-full h-full object-contain bg-black max-h-60 md:max-h-none"
            />
          </div>
          {/* Right: Comments and Actions */}
          <div className="w-full md:w-1/2 flex flex-col bg-white text-black dark:bg-[#23232b] dark:text-gray-100">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b">
              <div className="flex items-center gap-3">
                <Link to={`/profile/${selectedPost?.author?._id}`}> 
                  <Avatar>
                    <AvatarImage src={selectedPost?.author?.profilePicture} />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                </Link>
                <Link
                  to={`/profile/${selectedPost?.author?._id}`}
                  className="font-semibold text-sm"
                >
                  {selectedPost?.author?.userName}
                </Link>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <MoreHorizontal className="cursor-pointer text-gray-600" />
                </DialogTrigger>
                <DialogContent className="flex flex-col gap-3 text-sm">
                  <div className="cursor-pointer text-red-600 font-semibold">
                    Unfollow
                  </div>
                  <div className="cursor-pointer">Add to favorites</div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Comments */}
            <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3">
              {comment.map((comment) => (
                <div key={comment._id} className="flex items-start gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={comment?.author?.profilePicture} />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <p className="text-sm">
                    <span className="font-semibold mr-1">
                      {comment?.author?.userName}
                    </span>
                    {comment?.text}
                  </p>
                </div>
              ))}
            </div>

            {/* Comment Input */}
            <div className="px-4 py-2 border-t bg-white text-black dark:bg-[#23232b] dark:text-gray-100">
              <div className="flex items-center gap-2 w-full">
                <input
                  type="text"
                  value={text}
                  onChange={changeEventHandler}
                  placeholder="Add a comment..."
                  className="flex-1 bg-gray-100 text-gray-900 placeholder-gray-400 p-2 rounded-full border-none outline-none text-sm dark:bg-[#23232b] dark:text-gray-100 dark:placeholder-gray-400"
                  onKeyDown={e => {
                    if (e.key === 'Enter' && text.trim()) {
                      sendMessageHandler();
                    }
                  }}
                />
                <Button
                  disabled={!text.trim()}
                  onClick={sendMessageHandler}
                  variant="ghost"
                  className="ml-2 px-4 py-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 border-none transition disabled:opacity-60 text-sm"
                >
                  Post
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CommentDialog;
