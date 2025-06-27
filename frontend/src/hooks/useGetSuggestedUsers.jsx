import { setSuggestedUsers } from "@/redux/Slices/authSlice";
import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import axiosWithAuth from '../lib/axiosWithAuth';

const useGetSuggestedUsers = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    const fetchSuggestedUsers = async () => {
      try {
        const api = axiosWithAuth();
        const res = await api.get('/api/v1/user/suggested');
        if (res.data.success) {
          dispatch(setSuggestedUsers(res.data.users));
        }
      } catch (error) {
        console.log(error);
        toast.error(
          error?.response?.data?.message ||
            "Something went wrong. Please try again."
        );
      }
    };
    fetchSuggestedUsers();
  }, []);
};

export default useGetSuggestedUsers;
