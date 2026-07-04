import { io } from "socket.io-client";

export const socket = io(
  "ws://168.231.81.171:6001/socket.io/?EIO=4&transport=websocket "
);
