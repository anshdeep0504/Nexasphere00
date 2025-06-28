import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import React, { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { setAuthUser } from "@/redux/Slices/authSlice";
import axiosWithAuth from "../lib/axiosWithAuth";

const EditProfile = () => {
  const imageRef = useRef();
  const [loading, setLoading] = useState(false);
  const { user } = useSelector((store) => store.auth);

  const [input, setInput] = useState({
    profilePicture: user?.profilePicture,
    bio: user?.bio,
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const fileHandler = (e) => {
    const file = e.target.files?.[0];
    if (file) setInput({ ...input, profilePicture: file });
  };

  const editProfileHandler = async () => {
    const formData = new FormData();
    if (input.profilePicture) formData.append("profilePicture", input.profilePicture);
    formData.append("bio", input.bio);

    try {
      setLoading(true);
      const api = axiosWithAuth();
      const res = await api.post(`/api/v1/user/profile/edit`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data.success) {
        const updatedUserData = {
          ...user,
          bio: res.data.user?.bio,
          profilePicture: res.data.user?.profilePicture,
        };
        dispatch(setAuthUser(updatedUserData));
        navigate(`/profile/${user?._id}`);
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(
        error?.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex max-w-2xl mx-auto pl-10">
      <section className="w-full max-w-2xl my-10">
        <h1 className="font-bold text-xl mb-6">Edit profile</h1>

        <div className="flex items-center justify-between bg-[#e7e5e5] dark:bg-[#23232b] p-5 rounded-2xl">
          <div className="flex items-center gap-4">
            <Avatar className="w-10 h-10">
              {user?.profilePicture && (
                <AvatarImage
                  className="w-full h-full rounded-full"
                  src={user.profilePicture}
                />
              )}
              <AvatarFallback className="w-full h-full bg-[#646464e1] text-white font-medium flex items-center justify-center rounded-full">
                CN
              </AvatarFallback>
            </Avatar>

            <div>
              <h2 className="font-semibold text-sm">{user?.userName}</h2>
              <span className="text-gray-500 text-sm">{user?.bio || "Bio here"}</span>
            </div>
          </div>

          <input ref={imageRef} onChange={fileHandler} type="file" className="hidden" />
          <Button
            variant="default"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 cursor-pointer"
            onClick={() => imageRef?.current.click()}
          >
            Change photo
          </Button>
        </div>

        <div className="mt-5">
          <h1 className="font-semibold mb-2">Bio</h1>
          <Textarea
            name="bio"
            value={input.bio}
            onChange={(e) => setInput({ ...input, bio: e.target.value })}
            className="focus-visible:ring-transparent bg-white dark:bg-[#18181b] dark:text-white"
          />
        </div>

        <div className="flex justify-end mt-5">
          {loading ? (
            <Button className="w-fit bg-blue-500 hover:bg-blue-600 cursor-pointer">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Please Wait...
            </Button>
          ) : (
            <Button
              onClick={editProfileHandler}
              className="w-fit bg-blue-500 hover:bg-blue-600 cursor-pointer"
            >
              Submit
            </Button>
          )}
        </div>
      </section>
    </div>
  );
};

export default EditProfile;
