const socket = io();

const myFace = document.getElementById('myFace');
const muteBtn = document.getElementById('mute');
const cameraBtn = document.getElementById('camera');
const cameraSelect = document.getElementById('cameras');

let myStream;
let mic = true;
let camera = true;

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

getMedia()

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
}

muteBtn.addEventListener("click",handleMuteClick)
cameraBtn.addEventListener("click",handleCameraClick)
cameraSelect.addEventListener("input",handleCameraChange)