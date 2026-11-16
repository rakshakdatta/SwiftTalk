import { useEffect, useRef, useState } from 'react';
import { SignalingSocket, type SignalMessage } from '@/lib/SignalingSocket';

export function useWebRTC(userId: string) {
  const socket = useRef<SignalingSocket | null>(null);
  const peer = useRef<RTCPeerConnection | null>(null);
  const media = useRef<MediaStream | null>(null);
  const partner = useRef('');
  const offer = useRef<SignalMessage | null>(null);
  const candidates = useRef<RTCIceCandidateInit[]>([]);
  const [incomingCall, setIncomingCall] = useState<SignalMessage | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [callError, setCallError] = useState('');

  function send(type: SignalMessage['type'], details: Partial<SignalMessage> = {}) {
    socket.current?.send({ type, from: userId, to: partner.current, ...details });
  }

  function endCall(notify = true) {
    if (notify && partner.current) send('end');
    partner.current = '';
    offer.current = null;
    candidates.current = [];
    peer.current?.close();
    peer.current = null;
    media.current?.getTracks().forEach(track => track.stop());
    media.current = null;
    setIncomingCall(null);
    setLocalStream(null);
    setRemoteStream(null);
    setIsCallActive(false);
  }

  async function setRemote(connection: RTCPeerConnection, description: RTCSessionDescriptionInit) {
    await connection.setRemoteDescription(description);
    const queued = candidates.current.splice(0);
    for (const candidate of queued) await connection.addIceCandidate(candidate);
  }

  async function startPeer(video: boolean) {
    const target = partner.current;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video });
    if (partner.current !== target) {
      stream.getTracks().forEach(track => track.stop());
      return null;
    }
    media.current = stream;
    setLocalStream(stream);
    const connection = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
    peer.current = connection;
    stream.getTracks().forEach(track => connection.addTrack(track, stream));
    connection.ontrack = event => setRemoteStream(event.streams[0]);
    let descriptionSent = false;
    const pending: RTCIceCandidateInit[] = [];
    connection.onicecandidate = ({ candidate }) => {
      if (!candidate || peer.current !== connection) return;
      if (descriptionSent) send('candidate', { candidate: candidate.toJSON() });
      else pending.push(candidate.toJSON());
    };
    return {
      connection,
      flushCandidates() {
        descriptionSent = true;
        for (const candidate of pending) send('candidate', { candidate });
      },
    };
  }

  async function callUser(target: string, video: boolean) {
    if (partner.current) return;
    if (!socket.current?.ready) {
      setCallError('Calling is connecting. Try again in a moment.');
      return;
    }
    setCallError('');
    partner.current = target;
    try {
      const session = await startPeer(video);
      if (!session) return;
      const { connection } = session;
      const description = await connection.createOffer();
      await connection.setLocalDescription(description);
      if (peer.current !== connection) return;
      send('offer', { sdp: description, isVideoCall: video });
      session.flushCandidates();
      setIsCallActive(true);
    } catch {
      endCall(false);
      setCallError('Could not start the call. Check microphone and camera permissions.');
    }
  }

  async function acceptCall() {
    const pending = offer.current;
    if (!pending?.sdp) return;
    offer.current = null;
    setIncomingCall(null);
    try {
      const session = await startPeer(pending.isVideoCall === true);
      if (!session) return;
      const { connection } = session;
      await setRemote(connection, pending.sdp);
      const description = await connection.createAnswer();
      await connection.setLocalDescription(description);
      if (peer.current !== connection) return;
      send('answer', { sdp: description });
      session.flushCandidates();
      setIsCallActive(true);
    } catch {
      send('rejected');
      endCall(false);
      setCallError('Could not accept the call. Check microphone and camera permissions.');
    }
  }

  function rejectCall() {
    if (partner.current) send('rejected');
    endCall(false);
  }

  useEffect(() => {
    if (!userId) return;

    const signaling = new SignalingSocket(userId, async message => {
      if (message.type === 'offer') {
        if (partner.current) {
          if (message.from !== partner.current) {
            signaling.send({ type: 'rejected', from: userId, to: message.from });
          }
          return;
        }
        setCallError('');
        partner.current = message.from;
        offer.current = message;
        setIncomingCall(message);
        return;
      }

      if (message.from !== partner.current) return;
      try {
        const connection = peer.current;
        if (message.type === 'answer' && message.sdp && connection) {
          await setRemote(connection, message.sdp);
        } else if (message.type === 'candidate' && message.candidate) {
          if (connection?.remoteDescription) await connection.addIceCandidate(message.candidate);
          else candidates.current.push(message.candidate);
        } else if (message.type === 'end' || message.type === 'rejected') {
          endCall(false);
        }
      } catch {
        endCall();
        setCallError('The call could not connect.');
      }
    });

    socket.current = signaling;
    return () => {
      endCall();
      signaling.close();
      socket.current = null;
    };
  }, [userId]);

  return { localStream, remoteStream, isCallActive, incomingCall, callError, callUser, acceptCall, endCall, rejectCall };
}
