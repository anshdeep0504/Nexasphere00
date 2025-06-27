import { setPosts, setPostsLoading } from "@/redux/Slices/postSlice";
import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import axiosWithAuth from '../lib/axiosWithAuth';

const useGetAllPost = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    const fetchAllPost = async () => {
      try {
        dispatch(setPostsLoading(true));
        const api = axiosWithAuth();
        const res = await api.get('/api/v1/post/allposts');
        if (res.data.success) {
          dispatch(setPosts(res.data.posts));
        }
      } catch (error) {
        console.log(error);
        dispatch(setPostsLoading(false));
        toast.error(
          error?.response?.data?.message ||
            "Something went wrong. Please try again."
        );
      }
    };
    fetchAllPost();
  }, []);
};

export default useGetAllPost;
