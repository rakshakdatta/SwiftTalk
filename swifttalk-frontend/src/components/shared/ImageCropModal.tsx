// components/shared/ImageCropModal.tsx
'use client';

import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import getCroppedImg from '@/lib/cropImage';

interface ImageCropModalProps {
  imageSrc: string;
  open: boolean;
  onClose: () => void;
  onCropComplete: (file: File) => void;
}

export default function ImageCropModal({ imageSrc, open, onClose, onCropComplete }: ImageCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const onCropCompleteHandler = useCallback((_: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCrop = async () => {
    const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
    if (croppedImage) {
      onCropComplete(croppedImage);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-lg h-[500px] bg-white">
        <DialogHeader>
          <DialogTitle className="text-center">Crop Image</DialogTitle>
        </DialogHeader>
        <div className="relative w-full h-[300px] bg-gray-100">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropCompleteHandler}
          />
        </div>
        <div className="flex justify-end gap-4 mt-4">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleCrop}>Crop and Upload</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
