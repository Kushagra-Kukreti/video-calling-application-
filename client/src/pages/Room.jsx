import { useEffect } from "react";
import { peer } from "../../../server/service/peerService";
import { useVideo } from "../context/Video";
import { useSocket } from "../context/Socket";

export const Room = () => {
  const {
        remoteSocketId,
        myStream,
        otherUserStream,
        setOtherUserStream,
        micState,
        cameraState,
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
      } = useVideo();
 
   const {socket }= useSocket();

  // Negotiations
  useEffect(() => {
    socket.on("incoming-negotiation", handleIncomingNegotiation);
    socket.on("receive-negotiation-answer", handleRecievingNegoAns);
    return () => {
      socket.off("incoming-negotiation", handleIncomingNegotiation);
      socket.off("receive-negotiation-answer", handleRecievingNegoAns);
    };
  }, []);
 

  //negotiation events
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

  // Receiving tracks
  useEffect(() => {
    peer.peerConnection.addEventListener("track", async (e) => {
      const otherUserStream = e.streams;
      setOtherUserStream(otherUserStream[0]);
    });
  }, []);
  

  //video call events 
  useEffect(() => {
    socket.on("join-room", handleJoin);
    socket.on("call-ended", handleCallEnded);
    socket.on("user-joined", userJoined);
    socket.on("incomming-call", handleIncommingCall);
    socket.on("get-answer-call", handleAnswerCall);
    return () => {
      socket.off("join-room", handleJoin);
      socket.off("user-joined", userJoined);
      socket.off("incomming-call", handleIncommingCall);
      socket.off("get-answer-call", handleAnswerCall);
    };
  }, [socket]);


  //sending streams after a delay 
  useEffect(() => {
    if (myStream) {
      setTimeout(() => {
        sendStream();
      }, 3000);
    }
  }, [myStream]);

  //UI rendering 
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-between p-4">
      {/* Header */}
      <header className="w-full max-w-5xl flex justify-between items-center py-4 px-6 bg-white shadow-md rounded-lg mb-4">
        <h1 className="text-lg font-semibold text-gray-700">Video Room</h1>
        <div className="text-sm text-gray-500">
          {remoteSocketId ? "Connected" : "Waiting for users..."}
        </div>
      </header>

      {/* Video Section */}
      <main className="flex-1 w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-4 items-center justify-center">
        {/* Your Video */}
        <div className="bg-black rounded-xl overflow-hidden shadow-lg relative flex items-center justify-center h-64 md:h-96">
          {myStream ? (
            <video
              ref={(videoref) => {
                if (videoref && myStream) {
                  videoref.srcObject = myStream;
                }
              }}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-400">
              <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center text-2xl">
                👤
              </div>
              <p className="mt-2 text-sm">Your Camera</p>
            </div>
          )}
          <span className="absolute bottom-2 left-2 text-xs bg-gray-800 text-white px-2 py-1 rounded-md">
            You
          </span>
        </div>

        {/* Other User Video */}
        <div className="bg-black rounded-xl overflow-hidden shadow-lg relative flex items-center justify-center h-64 md:h-96">
          {otherUserStream ? (
            <video
              ref={(videoref) => {
                if (videoref && otherUserStream) {
                  videoref.srcObject = otherUserStream;
                }
              }}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-400">
              <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center text-2xl">
                👤
              </div>
              <p className="mt-2 text-sm">Waiting for User...</p>
            </div>
          )}
          <span className="absolute bottom-2 left-2 text-xs bg-gray-800 text-white px-2 py-1 rounded-md">
            Other User
          </span>
        </div>
      </main>

      {/* Controls */}
      <footer className="w-full max-w-5xl flex justify-center gap-4 py-4">
        {!myStream && (
          <button
            onClick={handleCallClick}
            className=" cursor-pointer px-6 py-2 bg-blue-600 text-white rounded-full font-medium disabled:bg-blue-300 hover:bg-blue-700 transition shadow-md"
            disabled={!remoteSocketId && !myStream}
          >
            Start Call
          </button>
        )}
        {
          <button
            onClick={() => handleToggle("camera")}
            className=" cursor-pointer px-6 py-2 bg-blue-600 text-white rounded-full font-medium disabled:bg-blue-300 hover:bg-blue-700 transition shadow-md"
            disabled={!remoteSocketId && !myStream}
          >
            📷 {cameraState ? "off" : "on"}
          </button>
        }
        {
          <button
            onClick={() => handleToggle("mic")}
            className=" cursor-pointer px-6 py-2 bg-blue-600 text-white rounded-full font-medium disabled:bg-blue-300 hover:bg-blue-700 transition shadow-md"
            disabled={!remoteSocketId && !myStream}
          >
            🎙️ {micState ? "off" : "on"}
          </button>
        }

        {myStream && (
          <button
            onClick={handleEndCall}
            className="px-6 py-2 bg-red-600 text-white rounded-full font-medium hover:bg-red-700 transition shadow-md"
          >
            End Call
          </button>
        )}
      </footer>
    </div>
  );
};
