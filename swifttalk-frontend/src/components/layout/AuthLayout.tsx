import type { ReactNode } from 'react';
import Image from 'next/image';
import { MessageCircle, Paperclip, Video } from 'lucide-react';

const features = [
  { label: 'Real-time chat', Icon: MessageCircle },
  { label: 'File sharing', Icon: Paperclip },
  { label: 'Voice and video calls', Icon: Video },
];

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="auth-shell">
      <aside className="auth-brand-panel" aria-label="About SwiftTalk">
        <div className="auth-logo">
          <Image src="/logo/Logo.png" width={1024} height={1024} sizes="(min-width: 760px) 196px, 149px" priority alt="SwiftTalk" />
        </div>
        <div className="auth-brand-story">
          <p>Keep the<br /> conversation going.</p>
          <ul>
            {features.map(({ label, Icon }) => (
              <li key={label}><Icon aria-hidden="true" size={17} />{label}</li>
            ))}
          </ul>
        </div>
      </aside>
      <section className="auth-main" aria-label="SwiftTalk account">
        <div className="auth-card">{children}</div>
      </section>
    </main>
  );
}
