import { io } from 'socket.io-client';

const socket = io("https://estateconnect-xkrz.onrender.com", {
  withCredentials: true,
});

export default socket;
