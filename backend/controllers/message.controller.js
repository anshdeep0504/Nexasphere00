import Conversation from '../models/conversation.model.js';
import Message from '../models/message.model.js';
import User from '../models/user.model.js';
import { getReceiverSocketId, io } from '../socket/socket.js';

export const sendMessage = async (req, res) => {
    try {
        const senderId = req.id;
        const receiverId = req.params.id;
        const { message } = req.body;

        // this will check whether their is earlier conversation between sender and receiver
        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] }
        });

        // establish the conversation if earlier conversation is not found
        if (!conversation) {
            conversation = await Conversation.create({
                participants: [senderId, receiverId]
            })
        };

        const newMessage = await Message.create({
            senderId: senderId,
            receiverId: receiverId,
            message
        });


        if (newMessage) conversation.messages.push(newMessage._id);


        await Promise.all([
            conversation.save(),
            newMessage.save()
        ]);

        // implement socket.io fro real time data transfer
        // one to one not group implementation

        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('newMessage', newMessage);
        }

        const sender = await User.findById(senderId).select('userName profilePicture');

        // emit a msg event
        const msg = {
            type: 'message',
            userId: senderId,
            userDetails: sender,
            message: `${sender.userName} messaged you`
        }
        io.to(receiverSocketId).emit('messageNotification', msg);



        return res.status(200).json({
            message: "Message sent successfully",
            newMessage,
            success: true
        })
    } catch (error) {
        console.log(error)
    }
}

export const getMessage = async (req, res) => {
    try {
        const senderId = req.id;
        const receiverId = req.params.id;

        const conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] }
        }).populate('messages');

        if (!conversation) return res.status(200).json({
            success: true,
            messages: []
        });

        return res.status(200).json({
            success: true,
            messages: conversation?.messages
        });



    } catch (error) {
        console.log(error)
    }
}

// Mark all messages from selected user to current user as read
export const markAsRead = async (req, res) => {
    try {
        const userId = req.id; // current user (receiver)
        const senderId = req.params.id; // sender
        // Update all unread messages from sender to user
        const updated = await Message.updateMany(
            { senderId, receiverId: userId, read: false },
            { $set: { read: true } }
        );
        // Notify sender in real time if online
        const { getReceiverSocketId, io } = await import('../socket/socket.js');
        const senderSocketId = getReceiverSocketId(senderId);
        if (senderSocketId) {
            io.to(senderSocketId).emit('messageRead', { readerId: userId });
        }
        return res.status(200).json({ success: true, updated: updated.modifiedCount });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, error: 'Failed to mark as read' });
    }
};

// Delete a message for just me or for everyone
export const deleteMessage = async (req, res) => {
    try {
        const userId = req.id;
        const { forEveryone } = req.body; // boolean
        const { messageId } = req.params;
        const message = await Message.findById(messageId);
        if (!message) return res.status(404).json({ success: false, message: 'Message not found' });
        if (forEveryone) {
            // Only sender can delete for everyone
            if (String(message.senderId) !== String(userId)) {
                return res.status(403).json({ success: false, message: 'Not allowed' });
            }
            await message.deleteOne();
            return res.status(200).json({ success: true, deleted: true });
        } else {
            // Delete for just me
            if (!message.deletedFor.includes(userId)) {
                message.deletedFor.push(userId);
                await message.save();
            }
            return res.status(200).json({ success: true, deleted: false });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, error: 'Failed to delete message' });
    }
};