export default function DecorativeShapes() {
  return (
    <>
      {/* Animated Mesh Gradient Background */}
      <div className="absolute inset-0 hero-gradient-mesh opacity-60" />

      {/* Large Morphing Blob - Top Right */}
      <div
        className="absolute -top-20 -right-20 w-96 h-96 bg-gradient-to-br from-purple-400 via-pink-400 to-orange-300 opacity-20 animate-morph blur-3xl"
      />

      {/* Large Morphing Blob - Bottom Left */}
      <div
        className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-gradient-to-tr from-cyan-400 via-purple-400 to-pink-300 opacity-15 animate-morph blur-3xl"
        style={{ animationDelay: '4s' }}
      />

      {/* Floating Circles */}
      <div className="absolute top-20 left-[10%] w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 opacity-20 animate-float-slow" />
      <div
        className="absolute top-40 right-[15%] w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-yellow-400 opacity-25 animate-float-slow"
        style={{ animationDelay: '2s' }}
      />
      <div
        className="absolute bottom-40 left-[20%] w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 opacity-20 animate-float-slow"
        style={{ animationDelay: '4s' }}
      />

      {/* Floating Geometric Shapes */}
      <div className="absolute top-32 right-[25%] w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 opacity-30 rotate-45 animate-bounce-gentle rounded-lg" />
      <div
        className="absolute bottom-60 right-[10%] w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 opacity-25 animate-wiggle rounded-xl"
        style={{ animationDelay: '1s' }}
      />

      {/* Decorative Rings */}
      <div className="absolute top-1/4 left-[5%] w-32 h-32 rounded-full border-4 border-purple-300/30 animate-spin-slow" />
      <div
        className="absolute bottom-1/4 right-[5%] w-24 h-24 rounded-full border-4 border-pink-300/30 animate-spin-slow"
        style={{ animationDirection: 'reverse' }}
      />

      {/* Subtle Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(to right, #8B5CF6 1px, transparent 1px),
                           linear-gradient(to bottom, #8B5CF6 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />

      {/* Glowing Orbs */}
      <div className="absolute top-1/3 right-1/4 w-4 h-4 rounded-full bg-purple-500 opacity-60 animate-pulse shadow-lg shadow-purple-500/50" />
      <div
        className="absolute top-2/3 left-1/4 w-3 h-3 rounded-full bg-pink-500 opacity-60 animate-pulse shadow-lg shadow-pink-500/50"
        style={{ animationDelay: '1s' }}
      />
      <div
        className="absolute top-1/2 right-1/3 w-2 h-2 rounded-full bg-orange-500 opacity-60 animate-pulse shadow-lg shadow-orange-500/50"
        style={{ animationDelay: '2s' }}
      />

      {/* Decorative SVG Elements */}
      <svg className="absolute top-1/2 left-1/3 w-40 h-40 opacity-10" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="url(#gradient1)"
          strokeWidth="2"
          fill="none"
          strokeDasharray="10 5"
          className="animate-spin-slow"
        />
        <defs>
          <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#EC4899" />
          </linearGradient>
        </defs>
      </svg>

      <svg className="absolute bottom-1/3 right-1/4 w-32 h-32 opacity-10" viewBox="0 0 100 100">
        <path
          d="M 10 50 Q 30 20, 50 50 T 90 50"
          stroke="url(#gradient2)"
          strokeWidth="3"
          fill="none"
          className="animate-pulse"
        />
        <defs>
          <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#FCD34D" />
          </linearGradient>
        </defs>
      </svg>

      {/* Floating Stars/Sparkles */}
      <div className="absolute top-[15%] left-[30%] text-3xl opacity-20 animate-wiggle">+</div>
      <div className="absolute top-[60%] right-[20%] text-2xl opacity-20 animate-bounce-gentle" style={{ animationDelay: '0.5s' }}>+</div>
      <div className="absolute bottom-[20%] left-[15%] text-xl opacity-20 animate-wiggle" style={{ animationDelay: '1s' }}>+</div>
    </>
  );
}
