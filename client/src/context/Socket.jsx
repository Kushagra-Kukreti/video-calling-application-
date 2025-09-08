import { useMemo } from "react";
import { useContext } from "react";
import { createContext } from "react";
import { io } from "socket.io-client";

const PORT_NO = 8000;
const HOST = "localhost";
const SocketContext = createContext(null);

export const useSocket = () => {
  return useContext(SocketContext);
};
export const SocketProvider = ({ children }) => {
  const socket = useMemo(() => {
    return io(`${HOST}:${PORT_NO}`);
  }, []);
  return (
    <SocketContext.Provider value={{socket}}>{children}</SocketContext.Provider>
  );
};
