import React, { useState, useMemo } from "react";
import { Dialog, DialogContent } from "./ui/dialog";
import { Button } from "./ui/button";
import { useSelector } from "react-redux";
import axios from "axios";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import axiosWithAuth from '../lib/axiosWithAuth';

const ShareDialog = ({ open, setOpen, post }) => {
  const { user, suggestedUsers } = useSelector((store) => store.auth);
  const following = user?.following || [];
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // Map following IDs to user details using suggestedUsers
  const followingUsers = useMemo(() => {
    return suggestedUsers.filter((u) => following.includes(u._id));
  }, [suggestedUsers, following]);

  const handleShare = async () => {
    if (!selectedUser) return;
    setLoading(true);
    try {
      // Send a message with an image preview and caption
      const api = axiosWithAuth();
      await api.post(
        `/api/v1/message/send/${selectedUser}`,
        {
          message: `<div><img src='${post.image}' alt='post' style='max-width:200px;'/><br/>${post.caption || ""}</div>`
        },
      );
      toast.success("Post shared!");
      setOpen(false);
    } catch (err) {
      toast.error("Failed to share post.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <h2 className="font-semibold mb-2">Share Post</h2>
        <div className="mb-4">Select a user to share with:</div>
        <ul className="max-h-40 overflow-y-auto mb-4">
          {followingUsers.length === 0 && <li>You are not following anyone.</li>}
          {followingUsers.map((userObj) => (
            <li key={userObj._id} className="mb-2 flex items-center gap-2">
              <Button
                variant={selectedUser === userObj._id ? "default" : "secondary"}
                onClick={() => setSelectedUser(userObj._id)}
                className="w-full flex items-center gap-2 text-left"
              >
                <Avatar className="w-6 h-6">
                  <AvatarImage src={userObj.profilePicture} />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <span>{userObj.userName}</span>
              </Button>
            </li>
          ))}
        </ul>
        <Button onClick={handleShare} disabled={!selectedUser || loading}>
          {loading ? "Sharing..." : "Share"}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default ShareDialog; 