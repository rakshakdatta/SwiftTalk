'use client';

import { useEffect, useRef, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import SockJS from 'sockjs-client';
import { Client, IMessage } from '@stomp/stompjs';
import axios from '@/lib/axios';

import Sidebar from '@/components/chat/Sidebar';
import ChatHeader from '@/components/chat/ChatHeader';
import ChatMessages from '@/components/chat/ChatMessages';
import ChatInput from '@/components/chat/ChatInput';
import CallModal from '@/components/call/CallModal';
import CallOverlay from '@/components/call/CallOverlay';

import { User, Message } from '@/types/chat';
import { useWebRTC } from '@/hooks/useWebRTC';

export default function ChatPage() {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [chatUsers, setChatUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [imageMap, setImageMap] = useState<Record<number, string>>({});
  const [messageInput, setMessageInput] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const stompClientRef = useRef<Client | null>(null);
  const selectedUserRef = useRef<User | null>(null);

  const BACKEND_URL = 'http://localhost:8080';
  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') || '' : '';

  const {
    callUser,
    endCall,
    isCallActive,
    localStream,
    remoteStream,
    incomingCall,
    callError,
    acceptCall,
    rejectCall,
  } = useWebRTC(userId);

  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  useEffect(() => {
    const id = localStorage.getItem('userId');
    const token = localStorage.getItem('token');

    if (!id || !token) {
      window.location.replace('/login');
      return;
    }
    void fetchUsers(Number(id));
    connectWebSocket(token);
    return () => { void stompClientRef.current?.deactivate(); };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchUsers = async (id: number) => {
    try {
      const res = await axios.get<User[]>('/users');
      const map: Record<number, string> = {};
      res.data.forEach((u) => {
        map[u.id] = u.hasProfileImage
          ? `${BACKEND_URL}/users/${u.id}/profile-image`
          : '';
      });
      setImageMap(map);
      setAllUsers(res.data);
      setCurrentUser(res.data.find((u) => u.id === id) || null);
      setChatUsers(res.data.filter((u) => u.id !== id));
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const connectWebSocket = (token: string) => {
    const client = new Client({
      webSocketFactory: () => new SockJS(`${BACKEND_URL}/ws?token=${token}`),
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('✅ WebSocket connected');

        client.subscribe('/user/queue/private', (msg: IMessage) => {
          try {
            const body: Message = JSON.parse(msg.body);
            const activeUser = selectedUserRef.current;
            const isForCurrentChat =
              activeUser &&
              (Number(body.senderId) === activeUser.id || Number(body.receiverId) === activeUser.id);

            if (isForCurrentChat) {
              setMessages((prev) => {
                const withoutTemp = prev.filter((m) => !m.clientId || m.clientId !== (body as any).clientId);
                return [...withoutTemp, body];
              });
            }
          } catch (err) {
            console.error('❌ Failed to process message:', err);
          }
        });

        console.log('📨 Subscribed to /user/queue/private');
      },
      onStompError: (frame) => {
        console.error('❌ STOMP error:', frame.headers['message'], frame.body);
      },
      onWebSocketError: (evt) => {
        console.error('❌ WebSocket connection error:', evt);
      },
    });

    stompClientRef.current = client;
    client.activate();
  };

  const fetchMessages = async (partnerId: number) => {
    if (!currentUser?.id) return;
    try {
      const res = await axios.get<Message[]>(`/messages/${currentUser.id}/${partnerId}`);
      setMessages(res.data);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    }
  };

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    fetchMessages(user.id);
  };

  const sendMessage = (contentOverride?: string) => {
    const client = stompClientRef.current;
    const content = contentOverride ?? messageInput.trim();

    if (!selectedUser || !content || !currentUser?.id || !client?.connected) return;

    const tempClientId = `client-${Date.now()}`;

    const messageToSend = {
      senderId: currentUser.id,
      receiverId: selectedUser.id,
      content,
      timestamp: new Date().toISOString(),
    };

    const localMessage: Message = {
      ...messageToSend,
      clientId: tempClientId,
    };

    client.publish({
      destination: '/app/chat.private',
      body: JSON.stringify(messageToSend),
    });

    setMessages((prev) => [...prev, localMessage]);
    if (!contentOverride) setMessageInput('');
  };

  const handleClearChat = async () => {
    if (!selectedUser || !currentUser?.id) return;
    try {
      await axios.delete('/messages/clear', {
        params: {
          userId: currentUser.id,
          partnerId: selectedUser.id,
        },
      });
      await fetchMessages(selectedUser.id);
    } catch (err) {
      console.error('❌ Failed to clear chat:', err);
    }
  };

  return (
    <main className="flex h-dvh overflow-hidden bg-slate-50">
      <aside aria-label="Chats" className={`h-full w-full shrink-0 md:block md:w-[290px] ${selectedUser ? "hidden" : "block"}`}>
      <Sidebar
        currentUser={currentUser}
        users={chatUsers}
        selectedUser={selectedUser}
        onSelect={handleUserSelect}
        imageMap={imageMap}
      />
      </aside>
      <section aria-label="Conversation" className={`min-w-0 flex-1 flex-col md:flex ${selectedUser ? "flex" : "hidden"}`}>
        <ChatHeader
          selectedUser={selectedUser}
          imageMap={imageMap}
          onClearChat={handleClearChat}
          onBack={() => setSelectedUser(null)}
          onStartCall={(video) => { if (selectedUser) void callUser(String(selectedUser.id), video); }}
        />
        {callError && <p role="alert" className="px-4 py-2 text-sm text-red-700">{callError}</p>}
        {selectedUser ? (
          <ChatMessages messages={messages} currentUserId={currentUser?.id ?? 0} ref={messagesEndRef} />
        ) : (
          <div className="grid flex-1 place-items-center p-6 text-center">
            <div>
              <MessageCircle aria-hidden="true" className="mx-auto mb-4 size-12 rounded-xl bg-emerald-100 p-3 text-emerald-800" />
              <h1 className="text-xl font-semibold text-slate-900">Select a conversation</h1>
              <p className="mt-1 text-sm text-slate-600">Choose someone from Chats to start messaging.</p>
            </div>
          </div>
        )}
        {selectedUser && (
          <ChatInput
            value={messageInput}
            onChange={setMessageInput}
            onSend={sendMessage}
          />
        )}

      </section>
      <CallModal
        callerName={allUsers.find(user => user.id === Number(incomingCall?.from))?.username ?? 'SwiftTalk user'}
        open={!!incomingCall}
        onAccept={acceptCall}
        onReject={rejectCall}
      />

      {isCallActive && (
        <CallOverlay
          localStream={localStream}
          remoteStream={remoteStream}
          onEndCall={endCall}
        />
      )}
    </main>
  );
}
