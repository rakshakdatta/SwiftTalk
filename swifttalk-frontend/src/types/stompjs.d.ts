declare module 'stompjs' {
  import { Client, Frame, Message } from '@stomp/stompjs';

  export function over(socket: WebSocket | any): Client;

  export { Client, Frame, Message };
}
