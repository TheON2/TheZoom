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

let nickNameArr = ['123']

wsServer.on('connection',(socket)=>{

  socket.on('join',(nickName)=>{
    //닉네임을 검증
    if(nickNameArr.includes(nickName)){
      socket.emit('nickName_fale','닉네임이 이미 있습니다.')
    }else{
      socket.data.nickName=nickName
      nickNameArr.push(nickName)
      socket.emit('room',rooms)
    }
    console.log(rooms)
  })

  socket.on('join_room',(roomName)=>{
    console.log(roomName,socket.data.nickName)
    socket.join(roomName)
    rooms.forEach((a)=>{
      if(a.roomName===String(roomName)) a.member.push(socket.data.nickName)
    })
    console.log(rooms)
    socket.to(roomName).emit('welcome')
  })

  socket.on('offer',(offer,roomName) => {
    socket.to(roomName).emit('offer',offer,socket.data.nickName)
  })

  //앤써를 받은 녀석에게만 돌려주게 만든다
  socket.on('answer',(answer,nickName)=>{
    let ansSocket
    wsServer.sockets.sockets
      .forEach((a)=>
      {if(nickName===a.data.nickName)ansSocket=a})
    console.log('ans소켓 닉네임 체크중'+ansSocket.data.nickName)
    ansSocket.emit('answer',answer,ansSocket.data.nickName)
  })

  socket.on('ice',(ice,answerNick)=>{
    let ansSocket
    console.log(answerNick)
    wsServer.sockets.sockets
      .forEach((a)=>
      {if(answerNick===a.data.nickName)ansSocket=a})
    console.log(ansSocket)
    ansSocket.emit('ice',ice)
  })
})

httpServer.listen(3000, handleListen);
