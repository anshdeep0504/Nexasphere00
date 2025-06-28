import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { AvatarImage } from "@radix-ui/react-avatar";
import { useSelector, useDispatch } from "react-redux";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Heart, MessageCircle, LogOut } from "lucide-react";
import CommentDialog from "./CommentDialog";
import { setSelectedPost } from "@/redux/Slices/postSlice";
import axiosWithAuth from '../lib/axiosWithAuth';
import { toast } from "sonner";

const Profile = () => {
  const { id } = useParams();
  const { user } = useSelector((store) => store.auth);
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("posts");
  const [open, setOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isLoggedInUserProfile = user?._id === id;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const api = axiosWithAuth();
        const res = await api.get(`/api/v1/user/profile/${id}`);
        setProfile(res.data.user);
        if (user) {
          setIsFollowing(user?.following?.includes(res.data.user._id));
        }
      } catch (error) {
        setProfile(null);
      }
    };
    fetchProfile();
  }, [id, user]);

  const followUnfollowHandler = async () => {
    try {
      const api = axiosWithAuth();
      const res = await api.get(`/api/v1/user/followOrUnfollow/${id}`);
      if (res.data.success) {
        toast.success(res.data.message);
        setIsFollowing((prev) => !prev);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong.");
    }
  };

  const messageHandler = () => {
    navigate("/chat");
  };

  const logoutHandler = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (!profile) {
    return <div className="text-center text-red-500 py-10">User not found or has been deleted.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto bg-white dark:bg-[#121212] rounded-xl shadow font-sans p-0 mt-8 text-black dark:text-white">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 px-6 py-8">
        <Avatar className="h-32 w-32">
          <AvatarImage className="h-32 w-32" src={profile?.profilePicture} alt="profilePhoto" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>

        <div className="flex-1 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <span className="font-semibold text-2xl text-black dark:text-white">{profile?.userName}</span>

            {isLoggedInUserProfile ? (
              <>
                <Link to="/account/edit">
                  <Button variant="outline" className="rounded-md border px-4 py-1 text-sm font-semibold text-black dark:text-white border-gray-300 dark:border-[#262626]">Edit Profile</Button>
                </Link>
                <Button
                  onClick={logoutHandler}
                  variant="ghost"
                  className="flex items-center gap-2 px-4 py-1 text-sm font-semibold text-red-600 hover:text-white hover:bg-red-600 border border-red-600 rounded-md transition-colors"
                >
                  <LogOut size={18} />
                  Log out
                </Button>
              </>
            ) : (
              <div className="flex gap-2 items-center">
                <Button
                  onClick={followUnfollowHandler}
                  className={`rounded-md px-4 py-1 text-sm font-semibold transition-colors ${
                    isFollowing
                      ? "border border-gray-300 dark:border-[#262626] text-black dark:text-white bg-transparent"
                      : "bg-blue-500 text-white"
                  }`}
                >
                  {isFollowing ? "Unfollow" : "Follow"}
                </Button>

                {isFollowing && (
                  <Button
                    onClick={messageHandler}
                    variant="outline"
                    className="rounded-md px-4 py-1 text-sm font-semibold text-black dark:text-white border-gray-300 dark:border-[#262626]"
                  >
                    Message
                  </Button>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-8 text-sm text-black dark:text-white">
            <span><span className="font-semibold">{profile?.posts.length}</span> posts</span>
            <span><span className="font-semibold">{profile?.followers.length}</span> followers</span>
            <span><span className="font-semibold">{profile?.following.length}</span> following</span>
          </div>

          <div className="text-sm text-gray-700 dark:text-gray-300">
            {profile?.bio}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-[#262626] px-6 py-4">
        <div className="flex gap-4 mb-4">
          <button
            className={`px-4 py-2 rounded font-semibold transition-colors ${
              activeTab === "posts"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 dark:bg-[#23232b] dark:text-white"
            }`}
            onClick={() => setActiveTab("posts")}
          >
            Posts
          </button>
          <button
            className={`px-4 py-2 rounded font-semibold transition-colors ${
              activeTab === "saved"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 dark:bg-[#23232b] dark:text-white"
            }`}
            onClick={() => setActiveTab("saved")}
          >
            Saved
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {(activeTab === "posts" ? profile?.posts : profile?.bookmarks)?.length === 0 ? (
            <div className="col-span-full text-center text-gray-400 py-8">
              {activeTab === "posts" ? "No posts yet." : "No saved posts yet."}
            </div>
          ) : (
            (activeTab === "posts" ? profile?.posts : profile?.bookmarks)?.map((post) => (
              <div
                key={post?._id}
                className="relative group cursor-pointer aspect-square overflow-hidden rounded-md bg-gray-100 dark:bg-[#23232b]"
                onClick={() => {
                  dispatch(setSelectedPost(post));
                  setOpen(true);
                }}
              >
                <img
                  src={post?.image}
                  alt="postimage"
                  className="object-cover w-full h-full transition-transform duration-200 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <div className="flex items-center text-white gap-4 font-semibold text-sm">
                    <Heart className="w-5 h-5 fill-white" />
                    <span>{post?.likes?.length}</span>
                    <MessageCircle className="w-5 h-5 fill-white" />
                    <span>{post?.comments?.length}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <CommentDialog open={open} setOpen={setOpen} />
      </div>
    </div>
  );
};

export default Profile;
