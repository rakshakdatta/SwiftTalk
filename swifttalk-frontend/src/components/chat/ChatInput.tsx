'use client';

import { useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Paperclip, Smile, Send } from 'lucide-react';
import dynamic from 'next/dynamic';
import axios from '@/lib/axios';
import AttachmentPreview from './AttachmentPreview';

const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false });

const ATTACHMENT_TYPES = ['Image', 'Video', 'Audio', 'Document', 'Other'] as const;
type AttachmentType = (typeof ATTACHMENT_TYPES)[number];

interface FileUploadResponse {
  fileId: string;
  fileName: string;
  mimeType: string;
  downloadUrl: string;
  expiresAt: string;
}

export default function ChatInput({
  value,
  onChange,
  onSend,
}: {
  value: string;
  onChange: (val: string) => void;
  onSend: (attachmentMessage?: string) => void;
}) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentType, setShowAttachmentType] = useState(false);
  const [selectedType, setSelectedType] = useState<AttachmentType | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const BACKEND_URL = 'http://localhost:8080';

  const handleEmojiClick = (emojiData: any) => {
    onChange(value + emojiData.emoji);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedType) {
      setPreviewFile(file);
    }
  };

  const uploadAndSendAttachment = async () => {
    if (!previewFile || !selectedType) return;

    try {
      const formData = new FormData();
      formData.append('file', previewFile);

      const res = await axios.post<FileUploadResponse>(
        '/attachments/upload-temp',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      const downloadUrl = res.data.downloadUrl.startsWith('http')
        ? res.data.downloadUrl
        : `${BACKEND_URL}${res.data.downloadUrl}`;

      const message = `📎 ${selectedType} shared: ${downloadUrl}`;
      onSend(message);
    } catch (err) {
      alert('❌ Upload failed');
      console.error(err);
    } finally {
      setPreviewFile(null);
      setSelectedType(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="relative flex shrink-0 flex-col gap-2 border-t border-slate-200 bg-white p-2.5 sm:p-4">
      {previewFile && selectedType && (
        <div className="self-start">
          <AttachmentPreview
            file={previewFile}
            type={selectedType}
            onCancel={() => {
              setPreviewFile(null);
              setSelectedType(null);
            }}
            onConfirm={uploadAndSendAttachment}
          />
        </div>
      )}

      <div className="flex items-center gap-2">
        {/* Emoji Button */}
        <button
          type="button"
          aria-label="Add emoji"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="grid size-8 place-items-center rounded-lg text-slate-600 hover:bg-emerald-50 sm:size-9"
        >
          <Smile size={20} />
        </button>

        {/* Attachment Type Selector */}
        <div className="relative">
          <button
            type="button"
            aria-label="Attach a file"
            onClick={() => setShowAttachmentType((prev) => !prev)}
            className="grid size-8 place-items-center rounded-lg text-slate-600 hover:bg-emerald-50 sm:size-9"
          >
            <Paperclip size={20} />
          </button>

          {showAttachmentType && (
            <div className="absolute bottom-10 left-0 z-50 w-44 bg-white rounded shadow p-3 space-y-2">
              {ATTACHMENT_TYPES.map((type) => (
                <Button
                  key={type}
                  variant="ghost"
                  className="w-full justify-start text-sm"
                  onClick={() => {
                    setSelectedType(type);
                    setShowAttachmentType(false);
                    setTimeout(() => fileInputRef.current?.click(), 0);
                  }}
                >
                  {type}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Text Input */}
        <Input
          className="min-w-0 flex-1"
          aria-label="Message"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type your message..."
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSend();
          }}
        />

        {/* Send Button */}
        <Button aria-label="Send message" className="shrink-0 bg-[#145d50] hover:bg-[#0d493e]" onClick={() => onSend()}>
          <Send className="h-4 w-4" />
        </Button>
      </div>

      {showEmojiPicker && (
        <div className="absolute bottom-16 left-0 z-50">
          <EmojiPicker width="min(320px, calc(100vw - 16px))" height={340} onEmojiClick={handleEmojiClick} />
        </div>
      )}
    </div>
  );
}
