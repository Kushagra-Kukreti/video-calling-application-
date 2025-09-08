import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/Socket.jsx";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [roomId, setRoomId] = useState("");
  const navigate = useNavigate();
  const { socket } = useSocket();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted", { email, roomId });
    socket.emit("join-room", { email, roomId });
    navigate(`/room/${roomId}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <h1 className="text-xl font-semibold text-gray-800 text-center mb-6">
          Join Room
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
          <button
            type="submit"
            className="w-full disabled:bg-blue-300 py-2 cursor-pointer bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition text-sm"
            disabled = {email.length === 0|| roomId.length === 0}
          >
            Join Room
          </button>
        </form>
      </div>
    </div>
  );
};
