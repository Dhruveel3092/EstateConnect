import { io } from 'socket.io-client';

const socket = io("https://estate-connect-henna.vercel.app", {
  withCredentials: true,
});

export default socket;
