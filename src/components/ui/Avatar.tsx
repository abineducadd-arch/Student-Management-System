import React from 'react';
import { cn } from '@/lib/utils';

interface AvatarProps {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = 'md',
  className = '',
}) => {
  const [imageError, setImageError] = React.useState(false);

  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-xs',
    lg: 'w-12 h-12 text-sm',
    xl: 'w-16 h-16 text-base',
  };

  const getInitials = (n: string) => {
    if (!n) return 'AU';
    const parts = n.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return n.slice(0, 2).toUpperCase();
  };

  // Consistent pleasant botanical color based on initials
  const getColorScheme = (n: string) => {
    const charCode = n.charCodeAt(0) || 0;
    const schemes = [
      'bg-[#D9E2C6] text-[#263329]',
      'bg-[#DDD1EA] text-[#402D52]',
      'bg-[#E9D3B5] text-[#593E1F]',
      'bg-[#E2DDD2] text-[#263329]',
    ];
    return schemes[charCode % schemes.length];
  };

  return (
    <div
      className={cn(
        'relative rounded-full overflow-hidden flex items-center justify-center font-medium select-none border border-border/60 shrink-0 shadow-sm',
        sizeClasses[size],
        getColorScheme(name),
        className
      )}
    >
      {src && !imageError ? (
        <img
          src={src}
          alt={name}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  );
};

