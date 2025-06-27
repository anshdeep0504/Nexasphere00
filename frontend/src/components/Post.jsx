import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Dialog, DialogContent } from "./ui/dialog";
import { DialogTrigger } from "@radix-ui/react-dialog";
import {
  Bookmark,
  BookMarked,
  MessageCircle,
  MoreHorizontal,
  Send,
  Flag,
  Share2,
} from "lucide-react";
import { Button } from "./ui/button";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import CommentDialog from "./CommentDialog";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import axios from "axios";
import { setPosts, setSelectedPost } from "@/redux/Slices/postSlice";
import { Badge } from "./ui/badge";
import { setAuthUser } from "@/redux/Slices/authSlice";
import ShareDialog from "./ShareDialog";
import { motion, AnimatePresence } from "framer-motion";
import { Popover, PopoverContent } from "./ui/popover";
import { PopoverTrigger } from "@radix-ui/react-popover";
import { Link } from "react-router-dom";
import axiosWithAuth from '../lib/axiosWithAuth';

const Post = ({ post }) => {
  if (!post || !post.author) {
    return null;
  }
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const { user } = useSelector((store) => store.auth);
  const [liked, setLiked] = useState(post.likes.includes(user?._id) || false);
  const [postLike, setPostLike] = useState(post.likes.length);
  const [comment, setComment] = useState(post.comments);
  const { posts } = useSelector((store) => store.post);
  const dispatch = useDispatch();
  const [shareOpen, setShareOpen] = useState(false);
  const [showActions, setShowActions] = useState(false);

  // Detect mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  const api = axiosWithAuth();

  // Close actions on scroll or click outside
  useEffect(() => {
    if (!showActions) return;
    const close = () => setShowActions(false);
    window.addEventListener('scroll', close);
    window.addEventListener('click', close);
    return () => {
      window.removeEventListener('scroll', close);
      window.removeEventListener('click', close);
    };
  }, [showActions]);

  const changeEventHandler = (e) => {
    const inputText = e.target.value;
    setText(inputText.trim() ? inputText : "");
  };

  const likeOrDislikeHandler = async () => {
    try {
      const action = liked ? "dislike" : "like";
      const res = await api.get(`/api/v1/post/${post._id}/${action}`
      );

      if (res.data.success) {
        const updatedLikes = liked ? postLike - 1 : postLike + 1;
        setPostLike(updatedLikes);
        setLiked(!liked);

        const updatedPostData = posts.map((p) =>
          p._id == post._id
            ? {
                ...p,
                likes: liked
                  ? p.likes.filter((id) => id != user._id)
                  : [...p.likes, user._id],
              }
            : p
        );

        dispatch(setPosts(updatedPostData));
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(
        error?.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    }
  };

  const commentPostHandler = async () => {
    try {
      const res = await api.post(
        `/api/v1/post/${post?._id}/comment`,
        { text }
      );

      if (res.data.success) {
        const updatedCommentData = [...comment, res.data.comment];
        setComment(updatedCommentData);

        const updatedPostData = posts.map((p) =>
          p._id === post._id
            ? {
                ...p,
                comments: updatedCommentData,
              }
            : p
        );

        console.log(updatedPostData);
        dispatch(setPosts(updatedPostData));
        toast.success(res.data.message);
        setText("");
      }
    } catch (error) {
      console.log(error);
      toast.error(
        error?.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    }
  };

  const handleDelete = async (postId) => {
    let reason = undefined;
    if (user.role === 'admin') {
      reason = prompt('Enter moderation reason for deleting this post:');
      if (reason === null) return; // Cancelled
    }
    try {
      await api.delete(
        `/api/v1/post/delete/${postId}`,
        {
          data: user.role === 'admin' ? { reason } : {},
        }
      );
      toast.success('Post deleted successfully');
      dispatch(setPosts(posts.filter((p) => p._id !== postId)));
      // Optionally close the dialog/modal here
    } catch (error) {
      toast.error('Failed to delete post');
    }
  };

  const handleFollowUnfollow = async () => {
    try {
      const isFollowing = user.following.includes(post.author._id);
      const api = axiosWithAuth();
      const res = await api.get(
        `/api/v1/user/followOrUnfollow/${post.author._id}`,
        
      );

      if (res.data.success) {
        const updatedFollowing = isFollowing
          ? user.following.filter((id) => id !== post.author._id)
          : [...user.following, post.author._id];

        dispatch(setAuthUser({ ...user, following: updatedFollowing }));
        toast.success(
          `${isFollowing ? "Unfollowed" : "Followed"} ${post.author.userName}`
        );
      }
    } catch (error) {
      console.log(error);
      toast.error(
        error?.response?.data?.message || "Action failed. Try again later."
      );
    }
  };

  const savePostHandler = async () => {
    try {
      const res = await api.get(
        `/api/v1/post/save/${post?._id}`,
        
      );

      if (res.data.success) {
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(
        error?.response?.data?.message || "Action failed. Try again later."
      );
    }
  };

  return (
    <motion.div
      whileHover={!isMobile ? { scale: 1.05, boxShadow: "0 8px 32px rgba(0,0,0,0.15)" } : {}}
      className="bg-white dark:bg-black rounded-xl shadow font-sans p-0 my-6 w-full max-w-md mx-auto border border-gray-200 dark:border-[#262626] text-black dark:text-white transition-transform duration-200 relative group"
      onMouseEnter={() => !isMobile && setShowActions(true)}
      onMouseLeave={() => !isMobile && setShowActions(false)}
    >
      {/* (Removed Save, Share, Flag icons from top right; only three dots remain) */}
      {/* Show quick actions button on mobile (absolute top right, only mobile) */}
      <div className="absolute top-4 right-4 z-10 md:hidden">
        {isMobile && (
          <Button size="icon" variant="ghost" onClick={e => { e.stopPropagation(); setShowActions(v => !v); }}>
            <MoreHorizontal className="w-6 h-6" />
          </Button>
        )}
      </div>
      <div className="flex items-center gap-3 px-4 py-3">
        <Avatar className="w-8 h-8">
          <AvatarImage src={post.author?.profilePicture} />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <Link to={`/profile/${post.author?._id}`} className="font-semibold text-sm hover:underline transition-colors">
            {post.author?.userName}
          </Link>
          {user && user._id === post.author?._id && (
            <Badge variant="secondary" className="ml-1 text-xs">Author</Badge>
          )}
        </div>
        <div className="ml-auto">
          <Dialog>
            <DialogTrigger asChild>
              <MoreHorizontal className="cursor-pointer" />
            </DialogTrigger>
            <DialogContent className="flex flex-col items-center text-sm text-center">
              <Button
                variant="ghost"
                className="cursor-pointer w-fit text-[#ED4956] font-bold"
              >
                Report
              </Button>

              {user && user._id !== post.author._id && (
                <Button
                  onClick={handleFollowUnfollow}
                  variant="ghost"
                  className="cursor-pointer w-fit text-[#ED4956] font-bold"
                >
                  {user.following.includes(post.author._id)
                    ? "Unfollow"
                    : "Follow"}
                </Button>
              )}

              <Button variant="ghost" className="cursor-pointer w-fit">
                Add to favorites
              </Button>

              {(user._id === post.author._id || user.role === 'admin') && (
                <Button
                  onClick={() => handleDelete(post._id)}
                  variant="ghost"
                  className="cursor-pointer w-fit text-[#ED4956] font-bold"
                >
                  Delete
                </Button>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <img
        className="w-full h-auto object-cover rounded-none max-h-96 border-t border-b border-gray-100"
        src={post.image}
        alt="post"
      />
      {/* Location Tag (if exists) */}
      {post.location && post.location.name && (
        <div className="px-4 pt-2 pb-0">
          <span className="text-gray-500 text-sm">{post.location.name}</span>
        </div>
      )}
      <div className="px-4 py-2">
        <div className="flex items-center gap-4 mb-2">
          {liked ? (
            <FaHeart
              onClick={likeOrDislikeHandler}
              size={22}
              className="cursor-pointer text-red-500 hover:text-red-600 transition-all"
            />
          ) : (
            <FaRegHeart
              onClick={likeOrDislikeHandler}
              size={22}
              className="cursor-pointer hover:text-gray-600 transition-all"
            />
          )}
          <MessageCircle
            onClick={() => {
              dispatch(setSelectedPost(post));
              setOpen(true);
            }}
            className="cursor-pointer hover:text-gray-600"
            size={22}
          />
          {/* Share icon only on desktop, never absolute */}
          <Send
            className="cursor-pointer hover:text-gray-600 hidden md:block"
            onClick={() => setShareOpen(true)}
            size={22}
          />
          <Bookmark
            onClick={savePostHandler}
            className="cursor-pointer hover:text-gray-600 ml-auto"
            size={22}
          />
        </div>
        <span className="font-semibold text-sm block mb-1 cursor-pointer">
          {postLike ?? 0} {postLike === 1 ? "like" : "likes"}
        </span>
        <p className="text-sm mb-1">
          <Link to={`/profile/${post.author?._id}`} className="font-semibold mr-2 hover:underline transition-colors">
            {post.author?.userName}
          </Link>
          {post.caption}
        </p>
        {comment.length > 0 && (
          <span
            className="cursor-pointer text-xs text-gray-400"
            onClick={() => {
              dispatch(setSelectedPost(post));
              setOpen(true);
            }}
          >
            View all {comment.length} {comment.length === 1 ? "comment" : "comments"}
          </span>
        )}
        <div className="flex items-center justify-between mt-2">
          <input
            type="text"
            placeholder="Add a comment..."
            value={text}
            onChange={changeEventHandler}
            className="outline-none text-xs w-full text-gray-700 bg-gray-50 rounded-full px-3 py-2 border border-gray-200"
            maxLength={300}
          />
          {text && (
            <span
              onClick={commentPostHandler}
              className="cursor-pointer text-blue-500 ml-2 text-xs font-semibold"
            >
              Post
            </span>
          )}
        </div>
        <div className={`text-xs mt-1 text-right ${text.length > 300 ? 'text-red-500' : 'text-gray-400'}`}>{text.length}/300</div>
      </div>
      <CommentDialog post={post} open={open} setOpen={setOpen} />
      <ShareDialog open={shareOpen} setOpen={setShareOpen} post={post} />
    </motion.div>
  );
};

export default Post;
