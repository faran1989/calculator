"use client";

import { useState } from "react";

type Props = {
  src: string;
  initials: string;
  size?: number; // px
};

export default function AvatarWithFallback({ src, initials, size = 36 }: Props) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        style={{ width: size, height: size }}
        className="rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-black text-sm shadow-md shrink-0"
      >
        {initials}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={initials}
      width={size}
      height={size}
      onError={() => setFailed(true)}
      style={{ width: size, height: size }}
      className="rounded-full object-cover shadow-md shrink-0"
    />
  );
}
