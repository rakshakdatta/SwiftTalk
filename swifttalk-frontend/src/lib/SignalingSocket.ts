export type SignalMessage = {
  type: 'offer' | 'answer' | 'candidate' | 'end' | 'missed' | 'rejected';
  from: string;
  to: string;
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
  isVideoCall?: boolean;
};

type SignalCallback = (msg: SignalMessage) => void;

export class SignalingSocket {
  private socket: (WebSocket | null) = null;
  private onMessageCallback!: SignalCallback;

  constructor(userId: string, callback: SignalCallback) {
    if (!userId || userId === 'null' || userId === 'undefined') {
      throw new Error('[SignalingSocket] ❌ Invalid userId provided');
    }

    this.onMessageCallback = callback;

    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const url = `${protocol}://localhost:8080/signaling?userId=${userId}`;
    this.socket = new WebSocket(url);


    console.log('[SignalingSocket] 🔌 Connecting to:', url);

    this.socket.onopen = () => {
      console.log('[SignalingSocket] ✅ Connected to signaling server');
    };

    this.socket.onmessage = (event) => {
      try {
        const msg: SignalMessage = JSON.parse(event.data);
        console.log('[SignalingSocket] 📥 Received:', msg);
        this.onMessageCallback(msg);
      } catch (e) {
        console.error('[SignalingSocket] ❌ Failed to parse message:', event.data, e);
      }
    };

    this.socket.onerror = (err) => {
      console.error('[SignalingSocket] ⚠️ Socket error:', err);
    };

    this.socket.onclose = () => {
      console.warn('[SignalingSocket] 🔌 Disconnected from signaling server');
    };
  }

  send(msg: SignalMessage) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(msg));
      console.log('[SignalingSocket] 📤 Sent:', msg);
    } else {
      console.warn('[SignalingSocket] ⚠️ Cannot send — WebSocket not open:', msg);
    }
  }

  close() {
    if (this.socket && this.socket.readyState !== WebSocket.CLOSED) {
      this.socket.close();
      console.log('[SignalingSocket] ❌ Socket closed by client');
    }
  }

  get ready(): boolean {
    return !!this.socket && this.socket.readyState === WebSocket.OPEN;
  }
}
