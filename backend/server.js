import express from 'express';
import cors from 'cors'; 
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.route.js';
import userRoutes from './routes/user.routes.js';
import http from 'http';
import {Server} from 'socket.io';
import User from './models/User.js';

const app = express();
dotenv.config();
// https://linkup-ub4p.onrender.com/
// http://localhost:5173
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://linkup-ub4p.onrender.com",
    credentials: true
  }
});
const onlineUsers = new Map();  


io.on("connection", (socket) => {
  socket.on("user-connected", async (userId) => {
    onlineUsers.set(userId, socket.id);
    socket.userId = userId;
    await User.findByIdAndUpdate(userId, { isOnline: true }, { new: true });
    socket.broadcast.emit("user-connected", userId);
  });

  socket.on("disconnect", async () => {
    const userId = socket.userId;
    if (userId) {
      onlineUsers.delete(userId);
      await User.findByIdAndUpdate(userId, { isOnline: false }, { new: true });
      socket.broadcast.emit("user-disconnected", userId);
    }
  });
});


app.use(express.json({ limit: "50mb" }));
app.use(cors({
  origin: "https://linkup-ub4p.onrender.com",
  credentials: true
}));

app.use(cookieParser());

app.use('/api/auth', authRoutes(io));
app.use('/api/user',userRoutes(io));

server.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
  connectDB();
});