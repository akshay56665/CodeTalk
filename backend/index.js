import dotenv from "dotenv";
import express from "express";
import http from "http";
import { Server } from "socket.io";

dotenv.config();
const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL,
  },
});

const port = process.env.PORT || 8000;

const socketToRoom = {};
const rooms = {};

io.on("connection", (socket) => {
  socket.on("join", (data) => {
    const roomId = data.roomid;
    if (!rooms[roomId]) {
      rooms[roomId] = [{ name: data.name, id: roomId }];
    } else {
      rooms[roomId].push({ name: data.name, id: roomId });
    }
    socketToRoom[socket.id] = roomId;
    socket.join(roomId);
    socket.broadcast.to(roomId).emit("user-joined", data.name);
  });

  // offer broadcast
  socket.on("offer", ({ offer, name }) => {
    const roomId = socketToRoom[socket.id];

    socket.broadcast.to(roomId).emit("getoffer", { offer, name });
  });

  // answer broadcast
  socket.on("answer", (answer) => {
    const roomId = socketToRoom[socket.id];
    socket.broadcast.to(roomId).emit("getanswer", answer);
  });

  // ice candidates
  socket.on("candidates", (candidate) => {
    const roomId = socketToRoom[socket.id];
    socket.broadcast.to(roomId).emit("getcandidates", candidate);
  });

  // real time code tranfer
  socket.on("code-change", ({ roomid, code }) => {
    socket.broadcast.to(roomid).emit("code-change", code);
  });

  socket.on("language-change", ({ language, roomid }) => {
    socket.broadcast.to(roomid).emit("language-change", language);
  });

  socket.on("sync-code", ({ roomid, code, language }) => {
    socket.broadcast.to(roomid).emit("sync-code", { code, language });
  });
});

httpServer.listen(port, () => {
  console.log("Server started");
});
