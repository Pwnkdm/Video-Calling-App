import React, { useCallback, useEffect, useState } from 'react'
import { useSocket } from '../context/SocketProvider'
import ReactPlayer from "react-player";
import peer from '../service/peer';

const Room = () => {
    const socket = useSocket();
    const [remoteSocketId, setRemoteSocketId] = useState(null);
    const [mystream, setMystream] = useState(null);
    const [remoteStream, setRemoteStream] = useState();

    const handleUserJoined = useCallback(({email,id})=>{
        console.log(`Email: ${email} Joined the room`);
        setRemoteSocketId(id);
    },[])

    const handleCallUser = useCallback(async ()=>{
        const stream = await navigator.mediaDevices.getUserMedia({audio: true,video:true}); 
        const offer = await peer.getOffer();
        socket.emit('user:call',{to:remoteSocketId,offer})
        setMystream(stream);
    },[remoteSocketId,socket]);

    const handleIncommingCall = useCallback(async ({from,offer})=>{
        setRemoteSocketId(from);
        const stream = await navigator.mediaDevices.getUserMedia({audio: true,video:true}); 
        console.log('incoming:call',offer);
        setMystream(stream);
        const ans = await peer.getAnswer(offer);
        socket.emit('call:accepted1',{to:from,ans});
    },[socket]);

    const handleCallAccepted = useCallback(async ({from,ans})=>{
        peer.setLocalDescription(ans);
        console.log('call:accepted2!');
        for (const track of mystream.getTracks()){
             peer.peer.addTrack(track,mystream)
        }
    },[mystream]);

    const handleNegoNeeded = useCallback(async ()=>{
        const offer = await peer.getOffer();
        socket.emit('peer:nego:needed',{offer,to:remoteSocketId});
      },[remoteSocketId, socket])

    useEffect(() => {
      peer.peer.addEventListener('negotiationneeded',handleNegoNeeded);
    
      return () => {
        peer.peer.removeEventListener('negotiationneeded',handleNegoNeeded);
      }
    }, [handleNegoNeeded])

    const handleNegoNeededIncomming = useCallback(({from,offer})=>{
      const ans = peer.getAnswer(offer);
      socket.emit('peer:nego:done',{to:from,ans});
    },[socket]);

    const handleNegoNeededFinal = useCallback(async ({ans})=>{
        await peer.setLocalDescription(ans);
    },[])
    

    useEffect(() => {
        peer.peer.addEventListener("track",async(ev)=>{
          const remoteStram = ev.streams;
          console.log(remoteStram,"plk");
          setRemoteStream(remoteStram);
        })
      
       
      }, [])

    useEffect(() => {
      socket.on('user:joined',handleUserJoined);
      socket.on('incoming:call',handleIncommingCall);  
      socket.on('call:accepted3',handleCallAccepted);
      socket.on('peer:nego:needed',handleNegoNeededIncomming);
      socket.on('peer:nego:final',handleNegoNeededFinal);

      return () => {
       socket.off('user:joined',handleUserJoined);
       socket.off('incoming:call',handleIncommingCall);
       socket.off('call:accepted4',handleCallAccepted);
       socket.off('peer:nego:final',handleNegoNeededFinal);
      }
    }, [socket, handleUserJoined, handleIncommingCall, handleCallAccepted, handleNegoNeededIncomming, handleNegoNeededFinal]);
   
    console.log(remoteStream,"remoteStream")
  return (
    <div>
      <h1>Room Page</h1>
      <h4>{remoteSocketId?'Connected':"No one in room"}</h4>
     {remoteSocketId && <button onClick={handleCallUser}>Call</button>}
     {mystream &&<>
     <h2>My Stream</h2>
     <ReactPlayer height={200} width={200} playing muted url={mystream}/>
     </>
     }
     {remoteStream &&<>
     <h2>Remote Stream</h2>
     <ReactPlayer height={200} width={200} playing muted url={remoteStream}/>
     </>
     }
    </div>
  )
}

export default Room
