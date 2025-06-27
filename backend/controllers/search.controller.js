import User from "../models/user.model.js";
import Post from "../models/post.model.js";

export const search = async (req, res) => {
  const { q } = req.query;
  if (!q) return res.json({ users: [], posts: [] });

  // Regex for partial match, case-insensitive
  const userRegex = new RegExp(q, "i");
  const users = await User.find({ userName: userRegex }).select("userName profilePicture");
  console.log("Search query:", q, "Users found:", users);

  // For posts, partial match in caption
  const postRegex = new RegExp(q, "i");
  const posts = await Post.find({ caption: postRegex }).populate("author", "userName profilePicture");
  console.log("Posts found:", posts);

  res.json({ users, posts });
}; 