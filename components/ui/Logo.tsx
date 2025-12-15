'use client';

import Image from 'next/image';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  variant?: 'full' | 'icon';
}

export default function Logo({ size = 'md', showText = true, variant = 'full' }: LogoProps) {
  const sizes = {
    sm: { icon: 32, text: 'text-base' },
    md: { icon: 44, text: 'text-xl' },
    lg: { icon: 56, text: 'text-2xl' }
  };

  const { icon: iconSize, text: textSize } = sizes[size];

  return (
    <div className="flex items-center gap-3">
      {/* Logo Image */}
      <div
        className="relative flex-shrink-0 rounded-xl overflow-hidden"
        style={{ width: iconSize, height: iconSize }}
      >
        <Image
          src="/logo.jpeg"
          alt="EduAssess Logo"
          width={iconSize}
          height={iconSize}
          className="object-cover"
          priority
        />
      </div>

      {/* Text */}
      {showText && variant === 'full' && (
        <div className="flex flex-col min-w-0">
          <span className="text-[9px] font-bold uppercase tracking-wider text-purple-600/80 leading-tight">
            Education Platform
          </span>
          <span className={`${textSize} font-extrabold bg-gradient-to-r from-purple-700 via-purple-600 to-orange-500 bg-clip-text text-transparent leading-tight`}>
            EduAssess
          </span>
        </div>
      )}
    </div>
  );
}
