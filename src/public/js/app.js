const socket = io();

const myFace = document.getElementById('myFace');
const muteBtn = document.getElementById('mute');
const cameraBtn = document.getElementById('camera');
const cameraSelect = document.getElementById('cameras');

let myStream;
let mic = true;
let camera = true;

async function getMedia(){
  try {
    myStream = await navigator.mediaDevices.getUserMedia({
      audio:true,
      video:true,
    })
    myFace.srcObject = myStream
  } catch (e){
    console.log(e)
  }
}

getMedia()
getCameras()

async function getCameras(){
  try{
    const devices = await navigator.mediaDevices.enumerateDevices()
    const cameras = devices.filter(device=>device.kind === 'videoinput')
    cameras.forEach(camera => {
      const option = document.createElement('option')
      option.value = camera.deviceId
      option.innerText = camera.label
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

muteBtn.addEventListener("click",handleMuteClick)
cameraBtn.addEventListener("click",handleCameraClick)