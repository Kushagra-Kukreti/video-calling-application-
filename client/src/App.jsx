import { Route, Routes } from "react-router-dom";
import { Login } from "./pages/Login";
import { Room } from "./pages/Room";
import { SocketProvider } from "./context/Socket";
import { VideoProvider } from "./context/Video";

function App() {
  return (
    <>
      <SocketProvider>
        <VideoProvider>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/room/:id" element={<Room />} />
          </Routes>
        </VideoProvider>
      </SocketProvider>
    </>
  );
}

export default App;
