'use client';

import { Button } from '@/components/ui/button';

interface CallOverlayProps {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  onEndCall: () => void;
}

export default function CallOverlay({
  localStream,
  remoteStream,
  onEndCall,
}: CallOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-slate-950/95 p-4 sm:p-8">
      <video
        ref={(ref) => {
          if (ref && remoteStream) ref.srcObject = remoteStream;
        }}
        autoPlay
        playsInline
        className="h-[65dvh] w-full max-w-5xl rounded-2xl bg-black object-contain shadow-lg"
      />
      <video
        ref={(ref) => {
          if (ref && localStream) ref.srcObject = localStream;
        }}
        autoPlay
        muted
        playsInline
        className="absolute right-6 top-6 h-20 w-28 rounded-xl border-2 border-slate-200 bg-slate-900 object-cover sm:right-10 sm:top-10 sm:h-32 sm:w-44"
      />
      <Button onClick={onEndCall} className="shrink-0 rounded-full bg-red-600 px-6 hover:bg-red-700">
        End Call
      </Button>
    </div>
  );
}
