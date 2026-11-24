import React, { useState } from 'react';

interface ChatImageProps {
  src: string;
  onOpen: (url: string) => void;
}

// A photo sent in a chat: a placeholder while it loads, and a note if it can't be loaded
export const ChatImage: React.FC<ChatImageProps> = ({ src, onOpen }) => {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'broken'>('loading');

  if (status === 'broken') {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-black/10 dark:bg-white/10 px-3 py-4 text-sm opacity-80">
        <span aria-hidden="true">🖼️</span> Image unavailable
      </div>
    );
  }

  return (
    <div className="relative max-w-full sm:max-w-sm py-1 rounded-lg cursor-pointer">
      {status === 'loading' && (
        <div
          className="w-56 max-w-full h-40 rounded-lg bg-black/10 dark:bg-white/10 animate-pulse flex items-center justify-center text-sm opacity-70"
          role="status"
        >
          Loading image…
        </div>
      )}
      <img
        src={src}
        alt="preview"
        decoding="async"
        className={`max-w-full max-h-full object-contain rounded-md ${status === 'loading' ? 'absolute opacity-0 pointer-events-none' : ''}`}
        onClick={() => onOpen(src)}
        onLoad={() => setStatus('loaded')}
        onError={() => setStatus('broken')}
      />
    </div>
  );
};
