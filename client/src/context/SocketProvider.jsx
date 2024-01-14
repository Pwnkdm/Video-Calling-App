import React, { createContext, useContext, useMemo } from 'react';
import {io} from "socket.io-client"

const SocketContect = createContext(null);

export const useSocket = () =>{
    const socket = useContext(SocketContect);
    return socket;
}

export const SocketProvider = (props) =>{
       const socket = useMemo((e)=>io('localhost:8000'),[]);

    return (
        <SocketContect.Provider value={socket}>
            {props.children}
        </SocketContect.Provider>
    )
}