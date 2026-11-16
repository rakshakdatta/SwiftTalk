'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { UploadCloud, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface ProfileImageModalProps {
  imageUrl: string | null;
  username: string;
  open: boolean;
  onClose: () => void;
  onUpload: (file: File) => void;
  onDelete: () => void;
}

export default function ProfileImageModal({
  imageUrl,
  username,
  open,
  onClose,
  onUpload,
  onDelete,
}: ProfileImageModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showPopover, setShowPopover] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  const handleFallbackClick = () => {
    fileInputRef.current?.click();
  };

  const SIZE = 500;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className={`w-[${SIZE}px] h-[${SIZE}px] aspect-square bg-white/30 backdrop-blur-md border-none p-0 shadow-xl flex items-center justify-center`}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Profile Picture</DialogTitle>
        </DialogHeader>

        {imageUrl ? (
          <Popover open={showPopover} onOpenChange={setShowPopover}>
            <PopoverTrigger asChild>
              <img
                src={imageUrl}
                alt="Profile"
                onClick={() => setShowPopover(true)}
                className={`w-[${SIZE}px] h-[${SIZE}px] object-cover cursor-pointer`}
              />
            </PopoverTrigger>
            <PopoverContent className="w-44 p-2 space-y-1 text-sm z-[100]">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => fileInputRef.current?.click()}
              >
                <UploadCloud className="w-4 h-4 mr-2" />
                Upload Image
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-red-500"
                onClick={onDelete}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Image
              </Button>
            </PopoverContent>
          </Popover>
        ) : (
          <div
            className={`w-[${SIZE}px] h-[${SIZE}px] bg-gray-200 flex items-center justify-center cursor-pointer`}
            onClick={handleFallbackClick}
          >
            <Avatar className="w-full h-full rounded-none">
              <AvatarFallback className="text-[120px] font-semibold text-gray-500 bg-gray-200">
                {username?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        )}

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          hidden
          accept="image/*"
        />
      </DialogContent>
    </Dialog>
  );
}
