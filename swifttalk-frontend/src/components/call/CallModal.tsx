'use client';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface CallModalProps {
  callerName: string;
  open: boolean;
  onAccept: () => void;
  onReject: () => void;
}

export default function CallModal({
  callerName,
  open,
  onAccept,
  onReject,
}: CallModalProps) {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="text-center">
        <DialogTitle className="break-words text-lg font-semibold">
          Incoming call from {callerName}
        </DialogTitle>
        <div className="flex justify-center gap-4">
          <Button onClick={onAccept} className="bg-green-600 hover:bg-green-700">
            Accept
          </Button>
          <Button onClick={onReject} className="bg-red-600 hover:bg-red-700">
            Decline
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
