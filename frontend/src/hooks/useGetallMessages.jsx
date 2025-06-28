import { setMessages } from "@/redux/Slices/chatSlice";
import axios from "axios";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import axiosWithAuth from '../lib/axiosWithAuth';

const useGetAllMessages = () => {
  const dispatch = useDispatch();
  const {selectedUser} = useSelector(store => store.auth);
  useEffect(() => {
    const fetchAllMessages = async () => {
      try {
        const api = axiosWithAuth();
        const res = await api.get(`/api/v1/message/getmessage/${selectedUser._id}`);

        if (res.data.success) {
          dispatch(setMessages(res.data.messages));
        }
      } catch (error) {
        console.log(error);
        toast.error(
          error?.response?.data?.message ||
            "Something went wrong. Please try again."
        );
      }
    };
    fetchAllMessages();
  }, [selectedUser]);
};

export default useGetAllMessages;
