'use client';

import { forwardRef, useEffect, useState } from 'react';
import { Message } from '../../types/chat';
import axios from '@/lib/axios';

interface Props {
  messages: Message[]; 
  currentUserId: number;
}

interface FileMeta {
  fileName: string;
  mimeType: string;
  size: number;
}

const ChatMessages = forwardRef<HTMLDivElement, Props>(
  ({ messages, currentUserId }, ref) => {
    const [metaMap, setMetaMap] = useState<Record<string, FileMeta>>({});

    useEffect(() => {
      const fetchMetadata = async () => {
        const fileIds = messages
          .map((m) =>
            m.content?.match(
              /📎 (Document|Image|Audio|Video|Other) shared: (https?:\/\/[^\s]+|\/attachments\/download\/[^\s]+)/
            )
          )
          .filter(Boolean)
          .map((match) => match![2].split('/').pop());

        const uniqueIds = Array.from(new Set(fileIds));

        const map: Record<string, FileMeta> = {};

        await Promise.all(
          uniqueIds.map(async (id) => {
            try {
              const res = await axios.get<FileMeta>(`/attachments/meta/${id}`);
              if (res.data && id) {
                map[id] = res.data;
              }
            } catch {
              // Ignore
            }
          })
        );

        setMetaMap(map);
      };

      fetchMetadata();
    }, [messages]);

    const formatFileSize = (bytes: number) => {
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    };

    const formatTime = (timestamp: string) => {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const renderButtons = (url: string) => (
      <div className="flex justify-between gap-2 w-full mt-3">
        <a
          href={`${url}?mode=open`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 text-center bg-gray-300 text-black font-medium py-2 rounded hover:bg-gray-400 transition"
        >
          Open
        </a>
        <a
          href={url}
          download
          className="flex-1 text-center bg-gray-300 text-black font-medium py-2 rounded hover:bg-gray-400 transition"
        >
          Save as…
        </a>
      </div>
    );

    const renderContent = (text: string) => {
      const match = text.match(
        /📎 (Document|Image|Audio|Video|Other) shared: (https?:\/\/[^\s]+|\/attachments\/download\/[^\s]+)/
      );

      if (!match) return null;

      const url = match[2];
      const fileId = url.split('/').pop()!;
      const meta = metaMap[fileId];

      const fileName = meta?.fileName || fileId;
      const ext = fileName.split('.').pop()?.toUpperCase() || 'FILE';
      const sizeStr = meta ? formatFileSize(meta.size) : 'Unknown Size';

      const isImage = meta?.mimeType?.startsWith('image/');
      const isVideo = meta?.mimeType?.startsWith('video/');

      if (isImage) {
        return (
          <div className="flex flex-col items-start w-full">
            <img
              src={url}
              alt={fileName}
              className="max-w-xs w-full rounded-lg border shadow mb-2"
            />
            {renderButtons(url)}
          </div>
        );
      }

      if (isVideo) {
        return (
          <div className="flex flex-col items-start w-full">
            <video
              controls
              src={url}
              className="max-w-xs w-full rounded-lg border shadow mb-2"
            />
            {renderButtons(url)}
          </div>
        );
      }

      return (
        <div className="w-full max-w-xs bg-gray-100 p-4 rounded-lg border shadow flex flex-col">
          <div className="flex items-start gap-3">
            <div className="text-4xl">📄</div>
            <div>
              <p className="text-sm font-semibold text-gray-800 break-words">
                {fileName}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {sizeStr}, {ext} File
              </p>
            </div>
          </div>
          {renderButtons(url)}
        </div>
      );
    };

    return (
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto bg-slate-50 px-3 py-4 sm:px-6">
        {messages.length === 0 && <p className="m-auto text-center text-sm text-slate-500">No messages yet. Say hello below.</p>}
        {messages.map((msg) => {
          const isCurrentUser = msg.senderId === currentUserId;
          const fallbackKey =
            msg.id?.toString() ?? msg.clientId ?? `${msg.senderId}-${msg.timestamp}`;

          const match = msg.content?.match(
            /📎 (Document|Image|Audio|Video|Other) shared: (https?:\/\/[^\s]+|\/attachments\/download\/[^\s]+)/
          );

          const isAttachment = !!match;

          return (
            <div
              key={fallbackKey}
              className={`${isAttachment
                  ? 'w-full max-w-[350px]'
                  : 'max-w-[min(85%,350px)]'
                } min-w-0 rounded-2xl px-4 py-2 text-sm shadow-sm [overflow-wrap:anywhere] ${
                  isCurrentUser
                    ? 'bg-emerald-100 self-end ml-auto'
                    : 'bg-white self-start'
                }`}
            >
              <div className="text-gray-800 whitespace-pre-wrap w-full">
                {renderContent(msg.content) || msg.content}
              </div>
              <div className="text-[11px] text-right text-gray-500 mt-1">
                {formatTime(msg.timestamp)}
              </div>
            </div>
          );
        })}
        <div ref={ref} />
      </div>
    );
  }
);

ChatMessages.displayName = 'ChatMessages';
export default ChatMessages;
