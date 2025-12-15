'use client';

interface AnimatedIllustrationProps {
  type: 'learning' | 'success' | 'working' | 'teaching';
  className?: string;
}

export default function AnimatedIllustration({ type, className = "" }: AnimatedIllustrationProps) {
  if (type === 'learning') {
    return (
      <div className={`relative ${className}`}>
        <svg viewBox="0 0 200 200" className="w-full h-full">
          {/* Book */}
          <rect x="60" y="80" width="80" height="60" rx="4" fill="#8B5CF6" className="animate-float" />
          <line x1="100" y1="80" x2="100" y2="140" stroke="white" strokeWidth="2" />

          {/* Floating stars */}
          <circle cx="50" cy="60" r="4" fill="#FCD34D" className="animate-bounce-gentle" style={{ animationDelay: '0s' }} />
          <circle cx="150" cy="70" r="3" fill="#F97316" className="animate-bounce-gentle" style={{ animationDelay: '0.5s' }} />
          <circle cx="110" cy="50" r="5" fill="#10B981" className="animate-bounce-gentle" style={{ animationDelay: '1s' }} />

          {/* Sparkles */}
          <text x="40" y="100" fontSize="20" className="animate-wiggle">✨</text>
          <text x="155" y="110" fontSize="16" className="animate-wiggle" style={{ animationDelay: '0.3s' }}>⭐</text>
        </svg>
      </div>
    );
  }

  if (type === 'success') {
    return (
      <div className={`relative ${className}`}>
        <svg viewBox="0 0 200 200" className="w-full h-full">
          {/* Trophy */}
          <ellipse cx="100" cy="140" rx="30" ry="8" fill="#FCD34D" opacity="0.3" className="animate-pulse" />
          <path d="M 80 120 L 80 100 L 120 100 L 120 120 L 110 130 L 90 130 Z" fill="#FCD34D" className="animate-bounce-gentle" />
          <rect x="95" y="130" width="10" height="15" fill="#F97316" />
          <rect x="85" y="145" width="30" height="5" rx="2" fill="#F97316" />

          {/* Confetti */}
          <rect x="60" y="70" width="8" height="8" fill="#8B5CF6" className="animate-float" style={{ animationDelay: '0s' }} />
          <circle cx="140" cy="80" r="4" fill="#10B981" className="animate-float" style={{ animationDelay: '0.3s' }} />
          <rect x="75" y="55" width="6" height="6" fill="#EC4899" className="animate-float" style={{ animationDelay: '0.6s' }} />
          <circle cx="130" cy="60" r="5" fill="#F97316" className="animate-float" style={{ animationDelay: '0.9s' }} />

          {/* Sparkle effects */}
          <text x="50" y="90" fontSize="24" className="animate-wiggle">🎉</text>
          <text x="145" y="95" fontSize="20" className="animate-wiggle" style={{ animationDelay: '0.4s' }}>✨</text>
        </svg>
      </div>
    );
  }

  if (type === 'working') {
    return (
      <div className={`relative ${className}`}>
        <svg viewBox="0 0 200 200" className="w-full h-full">
          {/* Pencil */}
          <rect x="80" y="60" width="15" height="70" fill="#FCD34D" transform="rotate(-45 87.5 95)" className="animate-wiggle" />
          <polygon points="80,60 95,60 87.5,50" fill="#EC4899" transform="rotate(-45 87.5 55)" className="animate-wiggle" />

          {/* Paper with lines */}
          <rect x="110" y="80" width="60" height="80" rx="4" fill="white" stroke="#CBD5E1" strokeWidth="2" />
          <line x1="120" y1="95" x2="160" y2="95" stroke="#8B5CF6" strokeWidth="2" />
          <line x1="120" y1="110" x2="155" y2="110" stroke="#8B5CF6" strokeWidth="2" />
          <line x1="120" y1="125" x2="150" y2="125" stroke="#8B5CF6" strokeWidth="2" />

          {/* Stars around */}
          <text x="70" y="50" fontSize="16" className="animate-bounce-gentle">⭐</text>
          <text x="165" y="70" fontSize="18" className="animate-bounce-gentle" style={{ animationDelay: '0.5s' }}>✨</text>
        </svg>
      </div>
    );
  }

  // teaching type
  return (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 200 200" className="w-full h-full">
        {/* Chalkboard */}
        <rect x="50" y="60" width="100" height="80" rx="6" fill="#1E293B" stroke="#8B5CF6" strokeWidth="3" />

        {/* Math symbols on board */}
        <text x="70" y="95" fontSize="24" fill="white" className="animate-fade-in">2+2</text>
        <text x="115" y="95" fontSize="24" fill="#10B981" className="animate-fade-in animate-delay-200">=4</text>
        <text x="75" y="125" fontSize="20" fill="#F97316" className="animate-fade-in animate-delay-300">✓</text>

        {/* Apple on desk */}
        <text x="155" y="150" fontSize="32" className="animate-bounce-gentle">🍎</text>

        {/* Floating elements */}
        <text x="40" y="50" fontSize="20" className="animate-float">📚</text>
        <text x="155" y="55" fontSize="18" className="animate-float" style={{ animationDelay: '0.5s' }}>✏️</text>
      </svg>
    </div>
  );
}
