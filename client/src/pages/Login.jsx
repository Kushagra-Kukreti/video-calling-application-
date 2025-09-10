import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/Socket.jsx";
import { v4 as uuidv4 } from "uuid";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [roomId, setRoomId] = useState("");
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const { socket } = useSocket();
  const idRef = useRef()

  const handleSubmit = (e) => {
    e.preventDefault();
    const id = isCreatingRoom ? roomId : roomId.trim();
    socket.emit("join-room", { email, roomId: id });
    navigate(`/room/${id}`);
  };

  const handleCreateRoom = () => {
    const newRoomId = uuidv4();
    setRoomId(newRoomId);
    setIsCreatingRoom(true);
    setCopied(false);
  };

  const handleCopy = () => {
    idRef.current.select();
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500); // Reset after 1.5s
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <h1 className="text-xl font-semibold text-gray-800 text-center mb-6">
          {isCreatingRoom ? "Create Room" : "Join Room"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              placeholder="Enter your email"
              id="email"
              type="email"
              required
              className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
            />
          </div>

          {!isCreatingRoom && (
            <div>
              <label
                htmlFor="roomId"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Room ID
              </label>
              <input
                onChange={(e) => setRoomId(e.target.value)}
                value={roomId}
                placeholder="Enter room ID"
                id="roomId"
                type="text"
                required
                className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2 cursor-pointer bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition text-sm disabled:bg-blue-300"
            disabled={email.length === 0 || roomId.length === 0}
          >
            {isCreatingRoom ? "Go to Room" : "Join Room"}
          </button>
        </form>

        {!isCreatingRoom && (
          <div className="mt-4 text-center">
            <button
              onClick={handleCreateRoom}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition text-sm cursor-pointer"
            >
              Create New Room
            </button>
          </div>
        )}

        {isCreatingRoom && (
          <div className="mt-4 text-center">
            <p className="text-gray-700 text-sm mb-2">
              Share this Room ID with others to join:
            </p>
            <div className="flex items-center justify-center gap-2">
              <input type="text" value={roomId} ref={idRef} className="font-mono bg-gray-200 p-2 rounded"/>
              <button
                onClick={handleCopy}
                className="px-2 py-1 disabled:bg-blue-300 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm cursor-pointer"
                disabled = {copied}
              >
              {copied?"Copied":"Copy"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
