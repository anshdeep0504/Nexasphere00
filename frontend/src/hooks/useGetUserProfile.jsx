import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUserProfile } from "@/redux/Slices/authSlice";
import axiosWithAuth from '../lib/axiosWithAuth';

const useGetUserProfile = (userId) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!userId) return;
    const fetchProfile = async () => {
      try {
        const api = axiosWithAuth();
        const res = await api.get(`/api/v1/user/profile/${userId}`);
        dispatch(setUserProfile(res.data.user));
      } catch (error) {
        dispatch(setUserProfile(null));
      }
    };
    fetchProfile();
  }, [userId, dispatch]);
};

export default useGetUserProfile;
