import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button"; // Assuming you're using shadcn/ui
import { setAuthUser, setSuggestedUsers } from "@/redux/Slices/authSlice";
import axios from "axios";
import { toast } from "sonner";
import axiosWithAuth from '../lib/axiosWithAuth';

const RightSideBar = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((store) => store.auth);
  const { suggestedUsers } = useSelector((store) => store.auth);
  if (!user) return null;

  const handleFollowUnfollow = async (targetUserId, isFollowing) => {
    try {
      const api = axiosWithAuth();
      const res = await api.get(
        `/api/v1/user/followOrUnfollow/${targetUserId}`,
      );

      if (res.data.success) {
        const updatedFollowing = isFollowing
          ? user.following.filter((id) => id !== targetUserId)
          : [...user.following, targetUserId];

        dispatch(setAuthUser({ ...user, following: updatedFollowing }));

        const updatedSuggestions = suggestedUsers.map((sugg) =>
          sugg._id === targetUserId
            ? {
                ...sugg,
                followers: isFollowing
                  ? sugg.followers.filter((id) => id !== user._id)
                  : [...sugg.followers, user._id],
              }
            : sugg
        );

        dispatch(setSuggestedUsers(updatedSuggestions));
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to follow/unfollow");
    }
  };

  return (
    <div className="hidden lg:block w-[320px] mt-10 pr-6 text-sm font-inter bg-white text-black dark:bg-black dark:text-white rounded-2xl shadow p-4">
      {/* Top User */}
      <div className="flex items-center justify-between mb-6 bg-white/80 text-black dark:bg-black/80 dark:text-white backdrop-blur rounded-2xl shadow p-4">
        <div className="flex items-center gap-3">
          <Link to={`/profile/${user._id}`}>
            <Avatar className="w-14 h-14 rounded-full border-2 border-blue-500 shadow">
              <AvatarImage src={user?.profilePicture} />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </Link>
          <div>
            <h1 className="font-semibold text-lg text-gray-900 dark:text-gray-100">{user?.userName}</h1>
            <span className="text-gray-500 dark:text-gray-400 text-sm">{user?.bio || "Bio here..."}</span>
          </div>
        </div>
        <Button
          variant="ghost"
          className="text-blue-500 text-xs px-0 h-fit w-12 cursor-pointer"
        >
          Switch
        </Button>
      </div>

      {/* Suggested for You Header */}
      <div className="flex justify-between items-center mb-3 text-sm">
        <h3 className="text-gray-600 font-semibold text-sm">
          Suggested for you
        </h3>
        <button className="text-xs font-medium hover:text-[#696969] cursor-pointer">
          See All
        </button>
      </div>

      {/* Suggestions */}
      <div className="flex flex-col gap-4">
        {suggestedUsers?.map((sugg) => {
          const isFollowing = user?.following?.includes(sugg._id);
          return (
            <div key={sugg._id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Link to={`/profile/${sugg._id}`}>
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={sugg?.profilePicture} />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                </Link>
                <div>
                  <p className="font-medium text-sm">
                    <Link to={`/profile/${sugg._id}`}>{sugg.userName}</Link>
                  </p>
                  <span className="text-xs text-gray-500">{sugg.bio}</span>
                </div>
              </div>
              <Button
                variant="link"
                className="text-blue-500 text-xs p-0 h-fit cursor-pointer"
                onClick={() => handleFollowUnfollow(sugg._id, isFollowing)}
              >
                {isFollowing ? "Unfollow" : "Follow"}
              </Button>
            </div>
          );
        })}
      </div>

      {/* Footer (Optional) */}
      <div className="text-xs text-gray-400 dark:text-gray-500 mt-8 leading-4 text-center">
        <p>About · Help · Press · API · Jobs · Privacy · Terms</p>
        <p className="mt-1">© 2025 NEXASPHERE</p>
      </div>
    </div>
  );
};

export default RightSideBar;
