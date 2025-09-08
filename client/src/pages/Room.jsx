import { useEffect, useState } from "react";
import { useSocket } from "../context/Socket";
import { peer } from "../../../server/service/peerService";

export const Room = () => {
  const { socket } = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState();
  const [otherUserStream, setOtherUserStream] = useState(null);
  const handleJoin = (data) => {
    console.log("Your data from backend", data);
  };
  const userJoined = (data) => {
    console.log("Joined user info", data);
    setRemoteSocketId(data.id);
  };
  const handleCallClick = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
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
    //meri stream jaane lag gyi
    // sendStream();
  };

  const handleNegotiationNeeded = async () => {
    console.log("negotiation initiated");
    //offer create kro
    const offer = await peer.getOffer();
    console.log("offer created to negotiate is:", offer);
    socket.emit("start-negotiation", { to: remoteSocketId, offer });
  };

  const handleIncomingNegotiation = async ({ from, offer }) => {
    console.log("handleIncomingNegotiation", offer);
    const ans = await peer.getAnswer(offer);
    socket.emit("answer-negotiation", { to: from, ans });
  };

  const handleRecievingNegoAns = async ({ ans }) => {
    console.log("handleRecievingNegoAns", ans);
    if (peer.peerConnection.signalingState === "have-local-offer")
      await peer.setRemoteDescription(ans);
  };

  /* important: same stream dubara send nahi ki ja skti  */

  //negotiations
  useEffect(() => {
    socket.on("incoming-negotiation", handleIncomingNegotiation);
    socket.on("receive-negotiation-answer", handleRecievingNegoAns);
    return () => {
      socket.off("incoming-negotiation", handleIncomingNegotiation);
      socket.off("receive-negotiation-answer", handleRecievingNegoAns);
    };
  }, []);

  //create negotiation
  useEffect(() => {
    peer.peerConnection.addEventListener(
      "negotiationneeded",
      handleNegotiationNeeded
    );
    return () => {
      peer.peerConnection.removeEventListener(
        "negotiationneeded",
        handleNegotiationNeeded
      );
    };
  }, [handleNegotiationNeeded]);

  //yaha tracks recieve hue dusre user ke
  useEffect(() => {
    peer.peerConnection.addEventListener("track", async (e) => {
      const otherUserStream = e.streams;
      setOtherUserStream(otherUserStream[0]);
    });
  }, []);

  useEffect(() => {
    socket.on("join-room", handleJoin);
    socket.on("user-joined", userJoined);
    socket.on("incomming-call", handleIncommingCall);
    socket.on("get-answer-call", handleAnswerCall);
    return () => {
      socket.off("join-room", handleJoin);
      socket.off("user-joined", userJoined);
      socket.off("incomming-call", handleIncommingCall);
      socket.off("get-answer-call", handleAnswerCall);
    };
  }, [socket, handleJoin, userJoined]);

  useEffect(() => {
    if (myStream) {
      setTimeout(() => {
        sendStream();
      }, 3000);
    }
  }, [myStream]);
  return (
    <>
      <div>{remoteSocketId ? "Connected" : "No one in the room"}</div>
      {remoteSocketId && <button onClick={handleCallClick}>CALL</button>}

      {myStream && (
        <>
          <h3>My Stream</h3>
          <video
            ref={(videoref) => {
              if (videoref && myStream) {
                videoref.srcObject = myStream;
              }
            }}
            autoPlay
            playsInline
            muted
            width={"200px"}
            height={"100px"}
            style={{ borderRadius: "8px" }}
          />
        </>
      )}

      {otherUserStream && (
        <>
          <h3>Other User Stream</h3>
          <video
            ref={(videoref) => {
              if (videoref && otherUserStream) {
                videoref.srcObject = otherUserStream;
              }
            }}
            autoPlay
            playsInline
            muted
            width={"200px"}
            height={"100px"}
            style={{ borderRadius: "8px" }}
          />
        </>
      )}
    </>
  );
};
