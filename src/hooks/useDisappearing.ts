import { useEffect, useState } from 'react';
import type { Socket } from 'socket.io-client';

export function useDisappearing(socket: Socket | null | undefined, otherUserId?: string) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    setSeconds(0);
    if (!socket || !otherUserId) return;
    socket.emit('getTimer', { receiver: otherUserId }, (res: { ok: boolean; seconds?: number }) => {
      if (res?.ok) setSeconds(res.seconds ?? 0);
    });
  }, [socket, otherUserId]);

  useEffect(() => {
    if (!socket || !otherUserId) return;
    const onTimer = (d: { between: string[]; seconds: number }) => {
      if (d.between.includes(otherUserId)) setSeconds(d.seconds);
    };
    socket.on('timerChanged', onTimer);
    return () => {
      socket.off('timerChanged', onTimer);
    };
  }, [socket, otherUserId]);

  const setTimer = (value: number) => {
    if (!socket || !otherUserId) return;
    socket.emit('setTimer', { receiver: otherUserId, seconds: value }, (res: { ok: boolean; message?: string }) => {
      if (!res?.ok) console.error(res?.message);
    });
  };

  return { seconds, setTimer };
}