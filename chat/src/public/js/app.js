const socket = io();

const welcome = document.getElementById("welcome")
const form = welcome.querySelector("form");
const room = document.getElementById("room");
const nick = room.querySelector("#name");

room.hidden = true;

let roomName;
let nickName;

function addMessage(message){
  const ul = room.querySelector("ul")
  const li = document.createElement("li")
  li.innerText = message;
  ul.appendChild(li);
}

function handleMessageSubmit(event){
  event.preventDefault();
  const input = room.querySelector("#msg input");
  const value = input.value;
  socket.emit("new_message",input.value , roomName, () =>{
    addMessage(`You: ${value}`);
  });
  input.value="";
}

function handleNickNameSubmit(event){
  event.preventDefault();
  const input = room.querySelector("#name input");
  socket.emit("nickname",input.value);
  input.value="";
}

function showRoom(){
  welcome.hidden = true;
  room.hidden = false;
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName}`;
  const nameh3 = room.querySelector("#name h3");
  nameh3.innerText = `현재 닉네임 : ${nickName}`;

  const msgForm = room.querySelector("#msg");
  const nameForm = room.querySelector("#name");
  msgForm.addEventListener("submit",handleMessageSubmit);
  nameForm.addEventListener("submit",handleNickNameSubmit);
}

function handleRoomSubmit(event){
  event.preventDefault();
  const nickNameInput = form.querySelector("#nickName");
  const roomNameInput = form.querySelector("#roomName");
  socket.emit("enter_room",roomNameInput.value,nickNameInput.value,showRoom);
  roomName = roomNameInput.value;
  nickName = nickNameInput.value;
  nickNameInput.value="";
  roomNameInput.value="";
};

form.addEventListener("submit",handleRoomSubmit);

socket.on("welcome", (user,newCount)=>{
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName} (${newCount})`;
  addMessage(`${user} joined!`);
})

socket.on("bye", (left,newCount)=>{
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName} (${newCount})`;
  addMessage(`${left} left ...`);
})

socket.on("new_message", addMessage);

socket.on("room_change",(rooms)=>{
  const roomList = welcome.querySelector("ul");
    roomList.innerHTML = "";
  if(rooms.length === 0){
    return;
  }
  rooms.forEach(room => {
    const li = document.createElement("li");
    li.innerText = room;
    roomList.append(li);
  })
} );
