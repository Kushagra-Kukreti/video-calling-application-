import { Route, Routes } from 'react-router-dom'
import { Login } from './pages/Login'
import { Room } from './pages/Room'
import { SocketProvider } from './context/Socket'

function App() {
  return (
    <>
    <SocketProvider>
    <Routes>
      <Route path="/" element={<Login/>}/> 
       <Route path="/room/:id" element={<Room/>}/> 
    </Routes>
    </SocketProvider>
    </>
  )
}

export default App
