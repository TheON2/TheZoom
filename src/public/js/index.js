const socket = io();

const myFace = document.getElementById('myFace');
const muteBtn = document.getElementById('mute');
const cameraBtn = document.getElementById('camera');
const cameraSelect = document.getElementById('cameras');
const call = document.getElementById('call');
const welcome = document.getElementById('welcome');
const welcomeForm = welcome.querySelector('form')
const waitingroom = document.getElementById('waitingroom');
const waitingContainer = waitingroom.querySelector('#roomContainer');
const nickName = waitingroom.querySelector('#nickname');

call.hidden=true;
waitingroom.hidden=true;
let myStream;
let mic = true;
let camera = true;
let roomName;
let myPeerConnection
let nick;

muteBtn.addEventListener("click",handleMuteClick)
cameraBtn.addEventListener("click",handleCameraClick)
cameraSelect.addEventListener("input",handleCameraChange)
welcomeForm.addEventListener('submit',handleWelcomeSubmit)


socket.on('welcome',async ()=>{
  myDataChannel = myPeerConnection.createDataChannel('chat')
  myDataChannel.addEventListener('message', console.log)
  console.log('made data channel')
  const offer = await myPeerConnection.createOffer()
  myPeerConnection.setLocalDescription(offer)
  socket.emit("offer",offer,roomName)
  console.log('welcome done')
})

socket.on('room',async (rooms)=>{
  let room = rooms
  room.forEach((a,i)=>{
    let room = `<div class="col-md-3 mb-4">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">${i+1}. ${a.roomName} ${a.member.length}/${a.roomMax}</h5>
                            <p class="card-text">Click to join the chat room.</p>
                            <a href="#" class="btn btn-primary" onclick="joinRoom('${a.roomName}')">Join</a>
                        </div>
                    </div>
                 </div>
    `
    //룸 컨테이너에 append한다
    waitingContainer.insertAdjacentHTML('beforeend', room)
  })
  welcome.hidden = true
  waitingroom.hidden = false
})

socket.on('offer',async (offer)=>{
  myPeerConnection.addEventListener('datachannel',(event)=>{
    myDataChannel = event.channel;
    myDataChannel.addEventListener('message',(event)=>{
      alert(event.data)
    })
  })
  myPeerConnection.setRemoteDescription(offer)
  console.log(offer)
  const answer = await myPeerConnection.createAnswer()
  console.log(answer)
  myPeerConnection.setLocalDescription(answer)
  socket.emit('answer',answer,roomName)
})

socket.on('answer',(answer)=>{
  myPeerConnection.setRemoteDescription(answer)
})

socket.on('ice',(ice)=>{
  console.log('recieved candidate')
  myPeerConnection.addIceCandidate(ice);
})

async function getMedia(deviceId){
  const initialConstrains = {
    audio: true,
    video: { facingMode: 'user'}
  }
  const cameraConstrains = {
    audio: true,
    video: { deviceId: {exact: deviceId}}
  }
  try {
    myStream = await navigator.mediaDevices.getUserMedia(
      deviceId? cameraConstrains : initialConstrains
    )
    myFace.srcObject = myStream
    if(!deviceId) await getCameras()
  } catch (e){
    console.log(e)
  }
}

async function getCameras(){
  try{
    const devices = await navigator.mediaDevices.enumerateDevices()
    const cameras = devices.filter(device=>device.kind === 'videoinput')
    const currentCamera = myStream.getVideoTracks()[0]
    cameras.forEach(camera => {
      const option = document.createElement('option')
      option.value = camera.deviceId
      option.innerText = camera.label
      if (currentCamera.label === camera.label) {
        option.selected = true
      }
      cameraSelect.appendChild(option);
    })
  }catch (e){console.log(e)}
}

function handleMuteClick(){
  myStream
    .getAudioTracks()
    .forEach((track)=>(track.enabled=!track.enabled))
  if (mic){
    muteBtn.innerText = "MIC OFF"
    mic = false
  } else {
    muteBtn.innerText = "MIC ON"
    mic = true
  }
}

function handleCameraClick(){
  myStream
    .getVideoTracks()
    .forEach((track)=>(track.enabled=!track.enabled))
  if (camera){
    cameraBtn.innerText = "CAMERA OFF"
    camera = false
  } else {
    cameraBtn.innerText = "CAMERA ON"
    camera = true
  }
}

async function handleCameraChange(){
  await getMedia(cameraSelect.value)
  if (myPeerConnection){
    const videoTrack = myStream.getVideoTracks()[0]
    const videoSender = myPeerConnection
      .getSenders()
      .find((sender) => sender.track.kind === 'video')
    console.log(videoSender)
    videoSender.replaceTrack(videoTrack)
  }
}


async function initCall(){
  waitingroom.hidden = true
  call.hidden = false
  await getMedia()
  makeConnection()
}

function handleWelcomeSubmit(e){
  e.preventDefault();
  const input = welcomeForm.querySelector('input')
  nick = input.value
  nickName.innerHTML = '나의 닉네임 :'+nick
  input.value = ''
  socket.emit('join')
}

async function joinRoom(room){
  roomName=room
  await initCall()
  socket.emit('join_room',room,nick,initCall)
}

function makeConnection(){
  myPeerConnection = new RTCPeerConnection({
    iceServers:[
      {
        urls:[
          'stun:stun.l.google.com:19302',
          'stun:stun1.l.google.com:19302',
          'stun:stun2.l.google.com:19302',
          'stun:stun3.l.google.com:19302',
          'stun:stun4.l.google.com:19302',
        ]
      }
    ]
  })
  myPeerConnection.addEventListener('icecandidate',handleIce)
  myPeerConnection.addEventListener('addstream',handleAddStream)
  myStream
    .getTracks()
    .forEach((track) => myPeerConnection.addTrack(track, myStream))
}

function handleIce(data){
  console.log('sent candidate')
  socket.emit('ice',data.candidate, roomName)
}

function handleAddStream(data){
  const peerFace = document.getElementById('peerFace')
  peerFace.srcObject = data.stream;
}