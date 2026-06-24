import { cn } from '../../lib/utils';

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
} as const;

const avatarColors = [
  'bg-indigo-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-cyan-500',
  'bg-violet-500',
  'bg-teal-500',
  'bg-orange-500',
] as const;

function getColorFromName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % avatarColors.length;
  return avatarColors[index];
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

interface AvatarProps {
  name?: string;
  imageUrl?: string;
  size?: keyof typeof sizeClasses;
  className?: string;
}

export function Avatar({
  name,
  imageUrl,
  size = 'md',
  className,
}: AvatarProps) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name || 'Avatar'}
        className={cn(
          'shrink-0 rounded-full object-cover',
          sizeClasses[size],
          className,
        )}
      />
    );
  }

  const displayName = name || '?';
  const initials = getInitials(displayName);
  const bgColor = getColorFromName(displayName);

  return (
    <div
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-medium text-white',
        sizeClasses[size],
        bgColor,
        className,
      )}
      aria-label={name || 'Avatar'}
    >
      {initials}
    </div>
  );
}
