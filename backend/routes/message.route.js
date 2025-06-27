import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { getMessage, sendMessage, markAsRead, deleteMessage } from "../controllers/message.controller.js";

const router = express.Router();

router.route('/send/:id').post(isAuthenticated, sendMessage);
router.route('/getmessage/:id').get(isAuthenticated, getMessage);
router.route('/read/:id').patch(isAuthenticated, markAsRead);
router.route('/delete/:messageId').delete(isAuthenticated, deleteMessage);

export default router;