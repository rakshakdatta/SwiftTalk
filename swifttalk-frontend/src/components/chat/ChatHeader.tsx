'use client';

import { useState } from 'react';
import { ArrowLeft, Phone, Video, MoreVertical } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { User } from '@/types/chat';
import axios from '@/lib/axios';

export default function ChatHeader({
  selectedUser,
  imageMap,
  onClearChat,
  onBack,
  onStartCall,
}: {
  selectedUser: User | null;
  imageMap: Record<string, string>;
  onClearChat?: () => void;
  onBack: () => void;
  onStartCall: (video: boolean) => void;
}) {
  const [openProfile, setOpenProfile] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);
  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') || '' : '';

  const handleBlock = () => {
    alert(`Blocked ${selectedUser?.username}`);
    setOpenMenu(false);
  };

  const handleReport = () => {
    alert(`Reported ${selectedUser?.username}`);
    setOpenMenu(false);
  };

  const handleClearChat = async () => {
    if (!selectedUser) return;

    try {
      await axios.delete(`/messages/clear`, {
        params: {
          userId,
          partnerId: selectedUser.id,
        },
      });

      if (onClearChat) onClearChat();
      alert(`Chat with ${selectedUser.username} cleared`);
    } catch (err) {
      console.error('❌ Failed to clear chat:', err);
      alert('Failed to clear chat. Try again.');
    } finally {
      setOpenMenu(false);
    }
  };

  return (
    <div className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-slate-200 bg-white px-2 sm:px-5">
      {selectedUser ? (
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <button type="button" aria-label="Back to chats" onClick={onBack} className="grid size-9 shrink-0 place-items-center rounded-lg text-slate-700 hover:bg-slate-100 md:hidden">
            <ArrowLeft size={20} />
          </button>
          <Popover open={openProfile} onOpenChange={setOpenProfile}>
            <PopoverTrigger asChild>
              <div onClick={() => setOpenProfile(true)} className="cursor-pointer">
                <Avatar className="h-10 w-10">
                  {imageMap[selectedUser.id] ? (
                    <AvatarImage src={imageMap[selectedUser.id]} />
                  ) : (
                    <AvatarFallback>{selectedUser.username[0]}</AvatarFallback>
                  )}
                </Avatar>
              </div>
            </PopoverTrigger>

            <PopoverContent
              className="z-50 w-[300px] bg-white rounded-xl shadow-lg p-4"
              align="start"
              side="bottom"
              sideOffset={8}
            >
              <div className="flex flex-col items-center space-y-2">
                <Avatar className="h-20 w-20 ring-2 ring-emerald-600 shadow mb-2">
                  {imageMap[selectedUser.id] ? (
                    <AvatarImage src={imageMap[selectedUser.id]} />
                  ) : (
                    <AvatarFallback className="text-xl">
                      {selectedUser.username[0]}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="text-center space-y-1">
                  <h2 className="text-lg font-semibold text-gray-800">
                    {selectedUser.username}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {selectedUser.email || 'No email available'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedUser.bio || 'No bio available'}
                  </p>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <span className="truncate font-semibold text-slate-900">
            {selectedUser.username}
          </span>
        </div>
      ) : (
        <span className="px-3 font-semibold text-slate-900">SwiftTalk</span>
      )}

      {selectedUser && (
        <div className="flex shrink-0 items-center gap-0.5 sm:gap-2">
          <button
            type="button"
            className="grid size-9 place-items-center rounded-lg text-slate-600 hover:bg-emerald-50 hover:text-emerald-800"
            aria-label="Voice Call"
            onClick={() => onStartCall(false)}
          >
            <Phone size={20} />
          </button>

          <button
            type="button"
            className="grid size-9 place-items-center rounded-lg text-slate-600 hover:bg-emerald-50 hover:text-emerald-800"
            aria-label="Video Call"
            onClick={() => onStartCall(true)}
          >
            <Video size={20} />
          </button>

          <Popover open={openMenu} onOpenChange={setOpenMenu}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="grid size-9 place-items-center rounded-lg text-slate-600 hover:bg-emerald-50 hover:text-emerald-800"
                aria-label="More options"
              >
                <MoreVertical size={20} />
              </button>
            </PopoverTrigger>

            <PopoverContent
              align="end"
              className="w-40 bg-white rounded shadow z-50 p-2"
            >
              <Button
                variant="ghost"
                className="w-full justify-start text-red-500"
                onClick={handleBlock}
              >
                Block
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={handleReport}
              >
                Report
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={handleClearChat}
              >
                Clear Chat
              </Button>
            </PopoverContent>
          </Popover>
        </div>
      )}

    </div>
  );
}
