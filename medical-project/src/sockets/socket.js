import { io } from "socket.io-client";

const socket = io("https://backend-react-production-2360.up.railway.app", {
  transports: ["websocket"],
  withCredentials: true,
});

export default socket;