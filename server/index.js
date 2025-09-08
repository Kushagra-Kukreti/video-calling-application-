
import {Server} from "socket.io"
const io = new Server(8000,{cors:true});

const emailToSocketIdMap = new Map();
const socketIdToEmailMap = new Map();
io.on("connection",(socket)=>{
  socket.on("join-room",(data)=>{
    const {email,roomId} = data;
    emailToSocketIdMap.set(email,socket.id);
    socketIdToEmailMap.set(socket.id,email);
    console.log("Data received on joining",data); 
    //sbko btao ye user aaya
    io.to(roomId).emit("user-joined",{email:email,id:socket.id})
    //user ko room me join krwao
    socket.join(roomId);
    //user ko bolo tum join ho gaye
    io.to(socket.id).emit("join-room",data)
  })

  socket.on("start-call",({to,offer})=>{
    io.to(to).emit("incomming-call",{from:socket.id,offer})
  })


  socket.on("answer-call",({to,answer})=>{
   io.to(to).emit("get-answer-call",{from:socket.id,answer})
  })


  socket.on("start-negotiation", ({ to, offer })=>{
    console.log("start negotiation backend",offer);
    io.to(to).emit("incoming-negotiation",{from:socket.id,offer})
  }); 


  socket.on("answer-negotiation",({to,ans})=>{
     io.to(to).emit("receive-negotiation-answer",{from:socket.id,ans})
  })

  socket.on("end-call",({from})=>{
    io.emit("call-ended",{from});
  })


  console.log("Connected to socket server",socket.id)
  
})




/*
// Peer A
const pc = new RTCPeerConnection();
const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
stream.getTracks().forEach(track => pc.addTrack(track, stream));

// Show own video
myVideo.srcObject = stream;

// Create offer and send to Peer B
const offer = await pc.createOffer();
await pc.setLocalDescription(offer);
// send offer.sdp to Peer B using WebSocket or API

// Peer B
const pc = new RTCPeerConnection();
pc.ontrack = e => {
  friendVideo.srcObject = e.streams[0]; // Show Peer A’s video
};

// Receive offer from Peer A
await pc.setRemoteDescription(offer);
// Create answer
const answer = await pc.createAnswer();
await pc.setLocalDescription(answer);
// send answer back to Peer A


negotiation needed ---- means vaapas se reconnect kro 



The WebRTC state machine (simplified)

"stable" → no pending negotiation.

"have-local-offer" → you created an offer, waiting for remote answer.

"have-remote-offer" → you got an offer, need to create/send answer.

After the offer/answer exchange, the peer connection goes back to "stable".






FEATURE LIST:::

Core 1-on-1 call flow (stabilize) — Must-have - done

Camera & mic toggles (UX polish) — Easy - done 

Proper End Call / Leave Room (clean disconnect) — Easy → Medium

Placeholders, avatars, initials, connection states — Easy

Text chat + DataChannel file transfer — Medium

Screen sharing (single user) — Medium

Reconnect / reconnection robustness (ICE restarts, signaling recovery) — Medium

Multi-user (mesh) gallery view — Hard

TURN server & NAT traversal hardening — Hard (infra)

Recording (local & server-side) — Hard

UX extras: reactions, raise hand, noise suppression, low-bandwidth mode — Medium-Hard

*/