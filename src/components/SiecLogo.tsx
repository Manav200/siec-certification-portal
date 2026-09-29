import React from "react";
import Image from "next/image";

interface SiecLogoProps {
  className?: string;
  size?: number;
}

export default function SiecLogo({ className = "", size = 40 }: SiecLogoProps) {
  return (
    <Image
      src="/SIEC_Logo.png"
      alt="SIEC Logo"
      width={size}
      height={size}
      className={`object-contain ${className}`}
      priority
    />
  );
}
