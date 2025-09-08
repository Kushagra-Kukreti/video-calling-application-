import { useEffect } from "react";
import { useState } from "react";
import {useNavigate} from "react-router-dom"
import {useSocket} from "../context/Socket.jsx"
export const Login = () => {

    const [email,setEmail] = useState("");
    const [roomId,setRoomId] = useState("");
    const navigate = useNavigate()
    const {socket} = useSocket()
    const handleSubmit=(e)=>{
        e.preventDefault();
       console.log("Form submitted",{email,roomId});
       socket.emit("join-room",{email,roomId})
       navigate(`/room/${roomId}`) 
    }
  return (
    <div>
      <form onSubmit={handleSubmit}>
       <label htmlFor="email">Email:</label> 
       <input onChange={(e)=>setEmail(e.target.value)} value={email} placeholder="enter your email" id="email" type="email" />
        <br />
        <label htmlFor="roomId">RoomId:</label>
        <input onChange={(e)=>setRoomId(e.target.value)} value={roomId} placeholder="enter room id" id="roomId" type="text" />
        <br />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};
