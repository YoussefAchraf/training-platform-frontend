import { io, type Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getMessagingSocket(): Socket {
  socket ??= io('/messaging', {
    withCredentials: true,
    autoConnect: false,
    transports: ['websocket', 'polling'],
  });
  return socket;
}

export function connectMessagingSocket(): void {
  const instance = getMessagingSocket();
  if (!instance.connected) instance.connect();
}

export function disconnectMessagingSocket(): void {
  socket?.disconnect();
}
