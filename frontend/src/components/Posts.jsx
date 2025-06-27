import React from "react";
import Post from "./Post";
import { useSelector } from "react-redux";
import Skeleton from "./ui/skeleton";

const Posts = () => {
  const {posts, loading} = useSelector(store => store.post);
  return (
    <div>
      {loading ? (
        Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-black rounded-xl shadow my-6 w-full max-w-md mx-auto border border-gray-200 dark:border-[#262626] p-4">
            <div className="flex items-center gap-3 mb-4">
              <Skeleton className="w-10 h-10 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="w-full h-60 rounded mb-4" />
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))
      ) : (
        posts.map((post) => (
          <Post key={post._id} post={post}/>
        ))
      )}
    </div>
  );
};

export default Posts;
