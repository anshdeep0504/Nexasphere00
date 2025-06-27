import express from "express";
import { search } from "../controllers/search.controller.js";
// import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();
// router.get("/", isAuthenticated, search);
router.get("/", search);
export default router; 