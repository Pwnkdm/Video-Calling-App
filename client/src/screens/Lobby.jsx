import React, { useCallback, useEffect, useState } from 'react'
import {useSocket} from "../context/SocketProvider"
import { useNavigate } from 'react-router-dom';

const LobbyScreen = () => {
  const [email, setEmail] = useState('');
  const [room, setRoom] = useState('');
  const navigate = useNavigate();

  const socket = useSocket();
  
  const handleFormSubmit = useCallback((e) =>{
    e.preventDefault();
    socket.emit('room:join',{email,room});
  },[room,email,socket]);

  const handleRoomJoin = useCallback((data) =>{
    const {email,room} = data;
    navigate(`/room/${room}`);
  },[navigate]);

  useEffect(() => {
    socket.on('room:join',handleRoomJoin)
  
    return () => {
      socket.off('room:join',handleRoomJoin);
    }
  }, [socket,handleRoomJoin])
  
  return (
    <div>
      <h1>Lobby</h1>
      <form onSubmit={handleFormSubmit}>
        <label htmlFor="email">Email Id:</label>
        <input 
        type="email"
         id='email'
          value={email}
           onChange={(e)=>setEmail(e.target.value)}
           /> <br />
        <label htmlFor="room">Room No:</label>
        <input
         type="number"
          id='room'
           value={room}
            onChange={(e)=>setRoom(e.target.value)}/>
        <button type='submit'>Join</button>
      </form>
    </div>
  )
}

export default LobbyScreen
