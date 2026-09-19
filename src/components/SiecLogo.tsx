import React from "react";
import Image from "next/image";
import logoImg from "../../SIEC_Logo.png";

interface SiecLogoProps {
  className?: string;
  size?: number;
}

export default function SiecLogo({ className = "", size = 40 }: SiecLogoProps) {
  return (
    <Image
      src={logoImg}
      alt="SIEC Logo"
      width={size}
      height={size}
      className={className}
      style={{ objectFit: "contain" }}
      priority
    />
  );
}
