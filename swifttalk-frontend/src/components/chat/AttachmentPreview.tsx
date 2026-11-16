'use client';

import { Button } from '@/components/ui/button';

interface Props {
  file: File;
  type: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function AttachmentPreview({
  file,
  type,
  onCancel,
  onConfirm,
}: Props) {
  const getReadableSize = (size: number) => {
    const mb = size / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const renderPreview = () => {
    const previewUrl = URL.createObjectURL(file);

    if (file.type.startsWith('image/')) {
      return (
        <img
          src={previewUrl}
          alt="image preview"
          className="w-full max-h-48 object-contain rounded"
        />
      );
    }

    if (file.type.startsWith('video/')) {
      return (
        <video
          src={previewUrl}
          controls
          className="w-full max-h-48 rounded"
        />
      );
    }

    return (
      <div className="w-full h-32 bg-gray-100 rounded flex items-center justify-center text-gray-500 text-4xl">
        📄
      </div>
    );
  };

  return (
    <div className="w-fit max-w-sm bg-white border rounded-xl shadow p-4">
      <p className="font-medium text-gray-700 mb-2">📎 {type} ready to send</p>

      <div className="mb-3">{renderPreview()}</div>

      <div className="text-sm text-gray-700 truncate text-center">
        <p className="font-medium truncate">{file.name}</p>
        <p className="text-xs text-gray-500">{getReadableSize(file.size)}</p>
        <p className="text-xs text-gray-400">{file.type || 'Unknown type'}</p>
      </div>

      <div className="flex justify-between mt-4">
        <button
          onClick={onCancel}
          className="text-red-500 text-sm hover:underline"
        >
          Cancel
        </button>
        <Button onClick={onConfirm} className="text-sm px-4">
          Send
        </Button>
      </div>
    </div>
  );
}
