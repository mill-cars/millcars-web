import React, { useState, useEffect } from 'react';

export function CountdownTimer() {
  // Fixed 2h 45m 12s countdown that resets every day (cosmetic)
  const [time, setTime] = useState({ h: 2, m: 45, s: 12 });

  useEffect(() => {
    const id = setInterval(() => {
      setTime(prev => {
        let { h, m, s } = prev;
        s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) { h = 2; m = 45; s = 12; }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="flex gap-2 items-center">
      <div className="bg-black/25 rounded-lg px-2.5 py-1 font-mono font-black text-white tabular-nums">{pad(time.h)}</div>
      <span className="font-bold text-white">:</span>
      <div className="bg-black/25 rounded-lg px-2.5 py-1 font-mono font-black text-white tabular-nums">{pad(time.m)}</div>
      <span className="font-bold text-white">:</span>
      <div className="bg-black/25 rounded-lg px-2.5 py-1 font-mono font-black text-white tabular-nums">{pad(time.s)}</div>
    </div>
  );
}
