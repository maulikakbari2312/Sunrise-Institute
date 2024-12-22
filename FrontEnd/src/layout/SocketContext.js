import { createContext, useContext, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import io from 'socket.io-client';
import { sendEnquire } from 'store/action';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const [receivedMessage, setReceivedMessage] = useState(null);
    const [socket, setSocket] = useState(null);
    const userEmail = localStorage.getItem('email');
    const cm = localStorage.getItem('cm');
    const dispatch = useDispatch();

    useEffect(() => {
        const socketMemo = io((cm == "true" || cm == true) ? process.env.REACT_APP_HOST : process.env.REACT_APP_HOST_SECOND);
        setSocket(socketMemo);

        // Guard against accessing 'on' when socket is null
        if (socketMemo) {
            socketMemo.on('message', ({ from, message }) => {
                setReceivedMessage(message);
                dispatch(sendEnquire(message));
            });
        }

        return () => {
            if (socketMemo) {
                socketMemo.disconnect();
            }
        };
    }, []);

    useEffect(() => {
        if (socket && userEmail) {
            socket.emit('join', userEmail);
        }
    }, [socket, userEmail]);  // Added socket and userEmail as dependencies

    return (
        <SocketContext.Provider value={{ socket, receivedMessage }}>
            {children}
        </SocketContext.Provider>
    );
};


export const useSocket = () => {
    return useContext(SocketContext);
};
