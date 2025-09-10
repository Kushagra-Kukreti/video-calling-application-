import { createContext, useContext, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "./Socket";
import { peer } from "../../../server/service/peerService";

const VideoContext = createContext(null);
export const useVideo = () => {
  return useContext(VideoContext);
};

export const VideoProvider = ({ children }) => {
  const { socket } = useSocket();
  const navigate = useNavigate();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState();
  const [otherUserStream, setOtherUserStream] = useState(null);
  const [micState, setMicState] = useState(false);
  const [cameraState, setCameraState] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const chattingChannel = useRef(null)

  console.log("chat messages",chatMessages)

  const handleJoin = (data) => {
    console.log("Your data from backend", data);
  };

  const userJoined = (data) => {
    console.log("Joined user info", data);
    setRemoteSocketId(data.id);
  };
  const handleReceiveMessage = (event) => {
    setChatMessages((messages) => [
      ...messages,
      { sender: "other", text: event.data },
    ]);
  };

  const handleCallClick = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    const chattingCh = await peer.createChannel("chatting");
    chattingChannel.current = chattingCh;
    chattingCh.onmessage = handleReceiveMessage;
    const offer = await peer.getOffer();
    socket.emit("start-call", { to: remoteSocketId, offer });
    setMyStream(stream);
  };

  const handleIncommingCall = async ({ from, offer }) => {
    console.log("incomming call", from, offer);
    setRemoteSocketId(from);
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    setMyStream(stream);
    const answer = await peer.getAnswer(offer);
    socket.emit("answer-call", { to: from, answer });
  };

  const sendStream = () => {
    myStream
      .getTracks()
      .forEach((track) => peer.peerConnection.addTrack(track, myStream));
  };

  const handleAnswerCall = async ({ from, answer }) => {
    if (peer.peerConnection.signalingState === "have-local-offer")
      await peer.setRemoteDescription(answer);
    console.log("answer call", from, answer);
  };

  const handleNegotiationNeeded = async () => {
    console.log("negotiation initiated");
    const offer = await peer.getOffer();
    socket.emit("start-negotiation", { to: remoteSocketId, offer });
  };

  const handleIncomingNegotiation = async ({ from, offer }) => {
    const ans = await peer.getAnswer(offer);
    socket.emit("answer-negotiation", { to: from, ans });
  };

  const handleRecievingNegoAns = async ({ ans }) => {
    if (peer.peerConnection.signalingState === "have-local-offer")
      await peer.setRemoteDescription(ans);
  };

  const handleEndCall = () => {
    // turn off streams
    myStream?.getTracks().forEach((track) => track.stop());
    peer.peerConnection.close();
    // clear states
    setMyStream(null);
    setOtherUserStream(null);
    // notify
    socket.emit("end-call", { from: socket.id });
    socket.disconnect();
    navigate("/");
  };

  const handleCallEnded = ({ from }) => {
    setOtherUserStream(null);
    console.log(from, "ended the call");
  };

  const handleToggle = (resource) => {
    if (resource === "camera") {
      const videoTracks = myStream?.getVideoTracks()[0];
      if (videoTracks) {
        videoTracks.enabled = !videoTracks.enabled;
        setCameraState(videoTracks.enabled);
      }
    } else if (resource === "mic") {
      const audioTracks = myStream?.getAudioTracks()[0];
      if (audioTracks) {
        audioTracks.enabled = !audioTracks.enabled;
        setMicState(audioTracks.enabled);
      }
    }
  };

  return (
    <VideoContext.Provider
      value={{
        // states
        remoteSocketId,
        setRemoteSocketId,
        myStream,
        setMyStream,
        otherUserStream,
        setOtherUserStream,
        micState,
        setMicState,
        cameraState,
        setCameraState,
        setChatMessages,
        chatMessages,
        chattingChannel,

        // handlers
        handleJoin,
        userJoined,
        handleCallClick,
        handleIncommingCall,
        sendStream,
        handleAnswerCall,
        handleNegotiationNeeded,
        handleIncomingNegotiation,
        handleRecievingNegoAns,
        handleEndCall,
        handleCallEnded,
        handleToggle,
        handleReceiveMessage,
      }}
    >
      {children}
    </VideoContext.Provider>
  );
};
