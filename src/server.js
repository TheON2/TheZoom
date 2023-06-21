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

let rooms = [{member:[1,2],roomName:'123',roomMax:8,}]

wsServer.on('connection',(socket)=>{

  socket.on('join',()=>{
    socket.emit('room',rooms)
    console.log(rooms)
  })

  socket.on('join_room',(roomName,nickName)=>{
    console.log(roomName,nickName)
    socket.join(roomName)
    rooms.forEach((a)=>{
      if(a.roomName===String(roomName)) a.member.push(nickName)
    })
    console.log(rooms)
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
