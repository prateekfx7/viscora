"use client";

import Image from "next/image";
import Link from "next/link";

interface ViscoraLogoProps {
  className?: string;
  variant?: "full" | "icon";
  width?: number;
  height?: number;
  href?: string;
  showBadge?: boolean;
}

export function ViscoraLogo({
  className = "",
  variant = "full",
  width,
  height,
  href,
  showBadge = false,
}: ViscoraLogoProps) {
  const content = (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {variant === "icon" ? (
        <div className="relative w-8 h-8 rounded-xl overflow-hidden shadow-xs flex-shrink-0">
          <Image
            src="/favicon.png"
            alt="Viscora Logo Icon"
            width={32}
            height={32}
            className="w-full h-full object-cover"
            priority
          />
        </div>
      ) : (
        <div className="relative flex items-center">
          {/* Light Mode Wordmark */}
          <Image
            src="/viscora-logo.png"
            alt="viscora"
            width={width || 120}
            height={height || 28}
            className="h-7 w-auto object-contain dark:hidden"
            priority
          />
          {/* Dark Mode Wordmark */}
          <Image
            src="/viscora-logo-dark.png"
            alt="viscora"
            width={width || 120}
            height={height || 28}
            className="h-7 w-auto object-contain hidden dark:block"
            priority
          />
        </div>
      )}

      {/* Clean logo only - badge removed */}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center hover:opacity-90 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
}
