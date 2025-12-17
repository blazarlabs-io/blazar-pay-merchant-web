"use client";

import { io, Socket } from "socket.io-client";

export const socket: Socket = io("https://blazar.local:3000", {
  rejectUnauthorized: false,
  transports: ["websocket", "polling"],
});
