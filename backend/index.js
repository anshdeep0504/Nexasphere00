import express from "express";
import cors from "cors";
import connectDB from "./utils/db.js";
import userRoute from "./routes/user.route.js";
import postRoute from "./routes/post.route.js";
import messageRoute from "./routes/message.route.js";
import searchRoute from "./routes/search.route.js";
import {app, server } from './socket/socket.js'

import dotenv from 'dotenv';
dotenv.config();


const PORT = process.env.PORT || 3000;
const corsOptions = {
    origin: process.env.FRONTEND_URL,
}
app.use(cors(corsOptions));

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/api/v1/user', userRoute);
app.use('/api/v1/post', postRoute);
app.use('/api/v1/message', messageRoute);
app.use('/api/v1/search', searchRoute);

app.get('/', (req, res) => {
  res.send('Nexasphere backend server is running.');
});

server.listen(PORT, () => {
    connectDB();
    console.log(`Server is running on port ${PORT}`)
})

