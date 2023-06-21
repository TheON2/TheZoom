import express from "express";
// import {WebSocket} from "ws";
import SocketIO from "socket.io";
import http from "http";
import path from "path";


const app = express();

// app.set("view engine","pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (_, res) => res.sendFile(path.join(__dirname, "/views/index.html")));
app.get("/*", (_,res) => res.redirect("/"));

const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);

const handleListen = () => console.log(`Listening on http://localhost:3000`);

let room = 8

let users = []

wsServer.on('connection',(socket)=>{
  socket.on('join',(nickName)=>{
    users.push(nickName)
    console.log(users)
    socket.to(nickName).emit('room',room)
  })
  socket.on('join_room',(roomName)=>{
    socket.join(roomName)
    socket.to(roomName).emit('welcome')
  })
  socket.on('offer',(offer,roomName) => {
    socket.to(roomName).emit('offer',offer)
  })
  socket.on('answer',(answer,roomName)=>{
    socket.to(roomName).emit('answer',answer)
  })
  socket.on('ice',(ice,roomName)=>{
    socket.to(roomName).emit('ice',ice)
  })
})

httpServer.listen(3000, handleListen);
