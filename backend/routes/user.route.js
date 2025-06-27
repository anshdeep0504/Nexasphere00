import express from "express";
import { editProfile, followOrUnfollow, getProfile, getSuggestedUsers, login, logout, register, verifyUser, adminDeleteUser } from "../controllers/user.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import isAdmin from "../middlewares/isAdmin.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/logout').get(logout);
router.route('/profile/:id').get(isAuthenticated,getProfile);
router.route('/profile/edit').post(isAuthenticated,upload.single('profilePicture'), editProfile);
router.route('/suggested').get(isAuthenticated, getSuggestedUsers);
router.route('/followOrUnfollow/:id').get(isAuthenticated, followOrUnfollow);
router.route('/verify/:id').patch(isAuthenticated, isAdmin, verifyUser);
router.delete('/:id', isAuthenticated, isAdmin, adminDeleteUser);

export default router;