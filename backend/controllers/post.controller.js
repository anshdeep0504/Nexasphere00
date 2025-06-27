import sharp from "sharp";
import cloudinary from "../utils/cloudinary.js";
import Post from '../models/post.model.js';
import User from "../models/user.model.js";
import Comment from "../models/comment.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";

export const addNewPost = async (req, res) => {
    try {
        const { caption } = req.body;
        const image = req.file;
        const authorId = req.id;

        if (!image) return res.status(400).json({ message: "Please upload an image." });

        // image upload
        const optimizedImageBuffer = await sharp(image.buffer)
            .resize({ width: 800, height: 800, fit: 'inside' })
            .toFormat('jpeg', { quality: 80 })
            .toBuffer();

        // imagebuffer to dataUri
        const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString('base64')}`;

        const cloudResponse = await cloudinary.uploader.upload(fileUri);

        const post = await Post.create({
            caption,
            image: cloudResponse.secure_url,
            author: authorId
        });

        const user = await User.findById(authorId);

        if (user) {
            user.posts.push(post._id);
            await user.save();
        }

        await post.populate({ path: 'author', select: '-password' }); // for frontend use

        return res.status(200).json({
            message: "Post created successfully",
            success: true,
            post
        });

    } catch (error) {
        console.log(error)
    }
};

export const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find()
            .sort({ createdAt: -1 })
            .populate({ path: 'author', select: 'userName profilePicture' })
            .populate({
                path: 'comments',
                sort: { createdAt: -1 },
                populate: {
                    path: 'author',
                    select: 'userName profilePicture'
                }
            });

        return res.status(200).json({
            posts,
            success: true
        });

    } catch (error) {
        console.log(error);
    }
};

export const getUserPost = async (req, res) => {
    try {
        const authorId = req.id;
        const posts = await Post.find({ author: authorId })
            .sort({ createdAt: -1 })
            .populate({
                path: 'author',
                select: 'userName, profilePicture'
            })
            .populate({
                path: 'comments',
                sort: { createdAt: -1 },
                populate: {
                    path: 'author',
                    select: 'userName, profilePicture'
                }
            });

        return res.status(200).json({
            posts,
            success: true
        });
    } catch (error) {
        console.log(error)
    }
};

export const likePost = async (req, res) => {
    try {
        const userId = req.id;
        const postId = req.params.id;

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({
                message: 'Post not found',
                success: false
            })
        }

        // like logic

        await post.updateOne({ $addToSet: { likes: userId } }); // ensure that on click only one like is considered, on double like the likes don't increase
        await post.save();

        // implement socket io for real time notification
        const user = await User.findById(userId).select('userName profilePicture');
        const postOwnerId = post.author.toString();
        if(postOwnerId != userId) {
            // emit a notification event
            const notification = {
                type:'like',
                userId: userId,
                userDetails: user,
                postId,
                message: `${user.userName} liked your post`
            }
            const postOwnerSocketId = getReceiverSocketId(postOwnerId);
            io.to(postOwnerSocketId).emit('notification', notification);
        }

        return res.status(200).json({
            message: 'Post liked',
            success: true
        })

    } catch (error) {
        console.log(error)
    }
};

export const dislikePost = async (req, res) => {
    try {
        const userId = req.id;
        const postId = req.params.id;

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({
                message: 'Post not found',
                success: false
            })
        }

        // dislike logic

        await post.updateOne({ $pull: { likes: userId } }); // ensure that on click only one like is considered, on double like the likes don't increase
        await post.save();

        // implement socket io for real time notification

        const user = await User.findById(userId).select('userName profilePicture');
        const postOwnerId = post.author.toString();
        if(postOwnerId != userId) {
            // emit a notification event
            const notification = {
                type:'dislike',
                userId: userId,
                userDetails: user,
                postId,
                message: `${user.userName} disliked your post`
            }
            const postOwnerSocketId = getReceiverSocketId(postOwnerId);
            io.to(postOwnerSocketId).emit('notification', notification);
        }


        return res.status(200).json({
            message: 'Post disliked',
            success: true
        })

    } catch (error) {
        console.log(error)
    }
};

export const addComment = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.id;

        const { text } = req.body;

        const post = await Post.findById(postId);
        if (!text) {
            return res.status(400).json({
                message: 'Text is required',
                success: false
            })
        }

        const comment = await Comment.create({
            text: text,
            author: userId,
            post: postId
        })

        await comment.populate({
            path: 'author',
            select: 'userName profilePicture'
        })

        post.comments.push(comment._id);
        await post.save();

        return res.status(201).json({
            message: 'Comment added',
            comment,
            success: true
        });

    } catch (error) {
        console.log(error)
    }
}

export const getAllComments = async (req, res) => {
    try {
        const postId = req.params.id;

        const comments = await Comment.find({ post: postId })
            .populate(
                'author', 'userName profilePicture'
            );

        if (!comments) {
            return res.status(404).json({
                message: 'No comments found',
                success: false
            })
        };

        return res.status(200).json({
            comments,
            success: true
        });
    } catch (error) {
        console.log(error)
    }
}

export const deletePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const authorId = req.id;
        const { reason } = req.body; // moderation reason (optional)
        const isAdmin = req.user && req.user.role === 'admin';

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({
                message: 'Post not found',
                success: false
            })
        };

        // Only allow if admin or post owner
        if (!isAdmin && post.author.toString() != authorId) {
            return res.status(403).json({
                message: 'You do not have permission to delete this post',
                success: false
            })
        };

        await Post.findByIdAndDelete(postId);

        // remove the postId from the user's post
        let user = await User.findById(post.author);
        user.posts = user.posts.filter(id => id.toString() != postId);
        await user.save();

        // delete comments asssociated to this post
        await Comment.deleteMany({ post: postId });

        return res.status(200).json({
            message: isAdmin && reason ? `Post deleted by admin. Reason: ${reason}` : 'Post deleted successfully',
            success: true,
            reason: isAdmin ? reason : undefined
        });
    } catch (error) {
        console.log(error)
    }
}

export const savePost = async (req, res) => {
  try {
    const userId = req.id;
    const postId = req.params.id;

    const user = await User.findById(userId);
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
        success: false,
      });
    }

    if (user.bookmarks.includes(post._id)) {
      // unsavePost
      await User.updateOne(
        { _id: userId },
        { $pull: { bookmarks: postId } }
      );
      return res.status(200).json({
        type: "unsaved",
        message: "Post unsaved",
        success: true,
      });
    } else {
      // savePost
      await User.updateOne(
        { _id: userId },
        { $addToSet: { bookmarks: postId } }
      );
      return res.status(200).json({
        type: "saved",
        message: "Post saved",
        success: true,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

const likeOrDislikeHandler = async () => {
  try {
    const action = liked ? "dislike" : "like";
    const res = await api.get(
      `${import.meta.env.VITE_BACKEND_URL}/api/v1/post/${post._id}/${action}`,
      {}
    );
    // ...rest of the code
  } catch (error) {
    // error handling
  }
};




