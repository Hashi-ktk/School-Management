'use client';

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import DecorativeShapes from "@/components/ui/DecorativeShapes";
import Logo from "@/components/ui/Logo";
import { getUsers } from "@/lib/utils";

// Animated counter hook
function useCountUp(end: number, duration: number = 2000, startOnView: boolean = true) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!startOnView) {
      setHasStarted(true);
    }
  }, [startOnView]);

  useEffect(() => {
    if (startOnView && ref.current) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !hasStarted) {
            setHasStarted(true);
          }
        },
        { threshold: 0.3 }
      );
      observer.observe(ref.current);
      return () => observer.disconnect();
    }
  }, [startOnView, hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;

    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOut * end));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [end, duration, hasStarted]);

  return { count, ref };
}

// Animated stat component
const AnimatedStat = ({ value, label, suffix = '' }: { value: number; label: string; suffix?: string }) => {
  const { count, ref } = useCountUp(value, 2000);
  return (
    <div ref={ref} className="text-center p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/50 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group">
      <p className="text-3xl lg:text-4xl font-extrabold gradient-text mb-2">
        {count}{suffix}
      </p>
      <p className="text-sm text-slate-600 font-medium group-hover:text-slate-800 transition-colors">{label}</p>
    </div>
  );
};

// Floating dashboard preview component
const FloatingDashboardPreview = () => (
  <div className="hidden xl:block absolute -right-8 top-1/2 -translate-y-1/2 w-[280px] animate-float-slow z-0">
    <div className="relative">
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl blur-2xl opacity-20" />

      {/* Card */}
      <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/50 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-white/30" />
            <div className="w-3 h-3 rounded-full bg-white/30" />
            <div className="w-3 h-3 rounded-full bg-white/30" />
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Mini stat cards */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-purple-50 rounded-lg p-2 text-center">
              <p className="text-lg font-bold text-purple-600">87%</p>
              <p className="text-[10px] text-purple-500">Avg Score</p>
            </div>
            <div className="bg-emerald-50 rounded-lg p-2 text-center">
              <p className="text-lg font-bold text-emerald-600">24</p>
              <p className="text-[10px] text-emerald-500">Students</p>
            </div>
          </div>

          {/* Mini progress bars */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500 w-16">Math</span>
              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full w-4/5 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500 w-16">English</span>
              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full w-3/4 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-full" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500 w-16">Science</span>
              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full w-[90%] bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full" />
              </div>
            </div>
          </div>

          {/* Mini chart placeholder */}
          <div className="bg-slate-50 rounded-lg p-2 flex items-end justify-around h-16">
            {[40, 65, 45, 80, 55, 70, 85].map((h, i) => (
              <div
                key={i}
                className="w-3 bg-gradient-to-t from-purple-500 to-pink-400 rounded-t"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Feature icons as SVG components
const FeatureIcon = ({ type }: { type: 'ai' | 'realtime' | 'reports' | 'groups' | 'feedback' | 'secure' }) => {
  const iconClasses = "w-8 h-8";

  switch (type) {
    case 'ai':
      return (
        <svg className={iconClasses} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/>
          <circle cx="8.5" cy="14.5" r="1.5"/>
          <circle cx="15.5" cy="14.5" r="1.5"/>
        </svg>
      );
    case 'realtime':
      return (
        <svg className={iconClasses} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
        </svg>
      );
    case 'reports':
      return (
        <svg className={iconClasses} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <path d="M14 2v6h6"/>
          <path d="M16 13H8"/>
          <path d="M16 17H8"/>
          <path d="M10 9H8"/>
        </svg>
      );
    case 'groups':
      return (
        <svg className={iconClasses} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      );
    case 'feedback':
      return (
        <svg className={iconClasses} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          <path d="M8 10h8"/>
          <path d="M8 14h4"/>
        </svg>
      );
    case 'secure':
      return (
        <svg className={iconClasses} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          <path d="M9 12l2 2 4-4"/>
        </svg>
      );
    default:
      return null;
  }
};

const features = [
  {
    icon: 'ai' as const,
    title: 'AI-Powered Analysis',
    description: 'Intelligent analysis of Grade 1-5 student performance with personalized learning recommendations and early intervention alerts.',
    color: 'purple'
  },
  {
    icon: 'realtime' as const,
    title: 'Live Progress Tracking',
    description: 'Monitor primary school student progress in real-time with intuitive dashboards designed for busy teachers.',
    color: 'cyan'
  },
  {
    icon: 'reports' as const,
    title: 'Standards-Aligned Reports',
    description: 'Generate detailed reports aligned with education standards, exportable in multiple formats for stakeholder review.',
    color: 'orange'
  },
  {
    icon: 'groups' as const,
    title: 'Ability-Based Grouping',
    description: 'Automatically group students by learning level to enable differentiated instruction and targeted support strategies.',
    color: 'emerald'
  },
  {
    icon: 'feedback' as const,
    title: 'Child-Friendly Feedback',
    description: 'Age-appropriate, encouraging feedback that helps young learners understand their progress and stay motivated.',
    color: 'pink'
  },
  {
    icon: 'secure' as const,
    title: 'Government-Grade Security',
    description: 'Secure data handling compliant with government standards, protecting student information across all districts.',
    color: 'indigo'
  }
];

const stats = [
  { value: 50, suffix: 'K+', label: 'Primary Students' },
  { value: 850, suffix: '+', label: 'Partner Schools' },
  { value: 34, suffix: '', label: 'Regions Served' },
  { value: 5, suffix: '', label: 'Grade Levels (1-5)' }
];

const steps = [
  {
    step: '01',
    title: 'Design Assessments',
    description: 'Create curriculum-aligned assessments for Grades 1-5 with age-appropriate question formats and visual elements.'
  },
  {
    step: '02',
    title: 'Assess Students',
    description: 'Conduct formative assessments during class with easy-to-use interfaces designed for primary school teachers.'
  },
  {
    step: '03',
    title: 'Monitor Learning',
    description: 'Track student progress across subjects with visual dashboards showing mastery levels and growth trends.'
  },
  {
    step: '04',
    title: 'Support & Intervene',
    description: 'Use AI recommendations to identify struggling students early and implement targeted interventions.'
  }
];

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Grade 3 Teacher',
    school: 'Riverside Elementary School',
    avatar: 'SJ',
    quote: 'EduAssess has made it so easy to track my young students. The visual reports help me explain progress to parents clearly.',
    rating: 5
  },
  {
    name: 'Michael Chen',
    role: 'District Education Officer',
    school: 'Central District Office',
    avatar: 'MC',
    quote: 'We can now monitor learning outcomes across all primary schools in our district. The data helps us allocate resources where they are needed most.',
    rating: 5
  },
  {
    name: 'Emily Rodriguez',
    role: 'Grade 1-2 Teacher',
    school: 'Sunshine Primary School',
    avatar: 'ER',
    quote: 'The child-friendly interface means even my Grade 1 students can complete assessments independently. It has transformed my classroom.',
    rating: 5
  }
];

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      const users = getUsers();
      const user = users.find((u) => u.email === email);

      if (user) {
        localStorage.setItem("currentUser", JSON.stringify(user));
        if (user.role === "admin") router.push("/dashboard/admin");
        else if (user.role === "teacher") router.push("/dashboard/teacher");
        else if (user.role === "student") router.push("/dashboard/student");
      } else {
        alert("User not found. Try: sarah.ahmed@edu.example.com, ali.khan@edu.example.com, or ahmad.ali@student.example.com");
        setIsLoading(false);
      }
    }, 300);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-purple-50/50 to-orange-50/50">
      {/* Decorative Background Elements */}
      <DecorativeShapes />

      {/* Hero Section */}
      <section className="relative z-10 pt-8 pb-16 lg:pt-16 lg:pb-24">
        {/* Navigation */}
        <nav className="max-w-7xl mx-auto px-6 mb-12 lg:mb-16">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Logo size="md" />
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-slate-600 hover:text-purple-600 transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-purple-600 transition-colors">How it Works</a>
              <a href="#testimonials" className="text-sm font-medium text-slate-600 hover:text-purple-600 transition-colors">Testimonials</a>
              <a href="#demo" className="text-sm font-medium text-slate-600 hover:text-purple-600 transition-colors">Login</a>
            </div>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="max-w-7xl mx-auto px-6 relative">
          {/* Floating dashboard preview - visible on xl screens */}
          <FloatingDashboardPreview />

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Column - Text Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-100 to-blue-100 border border-cyan-200 px-4 py-2 animate-slide-in-left">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-600"></span>
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-700">
                  AI-Powered Education Platform
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] text-slate-900 animate-slide-in-left animate-delay-100">
                AI-Enabled{' '}
                <span className="gradient-text">Formative Assessment</span>
                {' '}for Primary Education
              </h1>

              <p className="text-lg lg:text-xl text-slate-600 max-w-xl animate-slide-in-left animate-delay-200">
                Empowering teachers worldwide to track student progress in Grades 1-5, identify learning gaps early, and deliver personalized interventions with AI-powered insights.
              </p>

              <div className="flex flex-wrap gap-4 animate-slide-in-left animate-delay-300">
                <a href="#demo">
                  <Button size="lg" className="shadow-xl shadow-purple-500/25 hover:shadow-purple-500/40">
                    Access Platform
                  </Button>
                </a>
                <a href="#how-it-works">
                  <Button variant="outline" size="lg">
                    Learn More
                  </Button>
                </a>
              </div>

              {/* Social Proof */}
              <div className="flex items-center gap-4 pt-4 animate-slide-in-left animate-delay-400">
                <div className="flex -space-x-3">
                  {['Q', 'P', 'K', 'G', 'Z'].map((letter, i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full border-2 border-white bg-gradient-to-br from-purple-400 to-orange-400 flex items-center justify-center text-white text-xs font-bold shadow-md"
                    >
                      {letter}
                    </div>
                  ))}
                </div>
                <div className="text-sm text-slate-600">
                  <span className="font-bold text-slate-800">850+ partner schools</span> across 34 regions
                </div>
              </div>
            </div>

            {/* Right Column - Login Card */}
            <div className="relative animate-slide-in-right" id="demo">
              {/* Decorative elements behind card */}
              <div className="absolute -top-4 -right-4 w-72 h-72 bg-gradient-to-br from-purple-400 to-pink-400 rounded-3xl opacity-20 blur-2xl animate-pulse" />
              <div className="absolute -bottom-4 -left-4 w-64 h-64 bg-gradient-to-br from-orange-400 to-yellow-400 rounded-3xl opacity-20 blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />

              {/* Animated gradient border wrapper */}
              <div className="relative w-full max-w-md mx-auto lg:mx-0 lg:ml-auto p-[2px] rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 bg-[length:200%_200%] animate-gradient-shift">
                <Card className="relative w-full glass border-0 shadow-2xl bg-white/95">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-purple-600">
                      Try the Demo
                    </p>
                    <h2 className="text-2xl lg:text-3xl font-bold text-slate-800">
                      Welcome back
                    </h2>
                    <p className="text-sm text-slate-600">Use a demo email to explore the platform.</p>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-bold text-slate-700">
                        Email address
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        required
                        autoComplete="email"
                        suppressHydrationWarning
                        className="w-full rounded-xl border-2 border-gray-200 bg-white/80 px-4 py-3 text-base text-slate-800 placeholder:text-slate-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all"
                      />
                    </div>

                    <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                      {isLoading ? "Signing in..." : "Continue"}
                    </Button>
                  </form>

                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-xs text-slate-500 mb-3 font-medium">Demo accounts:</p>
                    <div className="grid gap-2">
                      <button
                        type="button"
                        onClick={() => setEmail('sarah.ahmed@edu.example.com')}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-purple-50 transition-colors text-left group"
                      >
                        <span className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600 text-sm font-bold group-hover:bg-purple-200 transition-colors">T</span>
                        <div>
                          <p className="text-sm font-semibold text-slate-700">Teacher</p>
                          <p className="text-xs text-slate-500">sarah.ahmed@edu.example.com</p>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setEmail('ali.khan@edu.example.com')}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-orange-50 transition-colors text-left group"
                      >
                        <span className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 text-sm font-bold group-hover:bg-orange-200 transition-colors">A</span>
                        <div>
                          <p className="text-sm font-semibold text-slate-700">Admin</p>
                          <p className="text-xs text-slate-500">ali.khan@edu.example.com</p>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setEmail('ahmad.ali@student.example.com')}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-emerald-50 transition-colors text-left group"
                      >
                        <span className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 text-sm font-bold group-hover:bg-emerald-200 transition-colors">S</span>
                        <div>
                          <p className="text-sm font-semibold text-slate-700">Student</p>
                          <p className="text-xs text-slate-500">ahmad.ali@student.example.com</p>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {stats.map((stat) => (
              <AnimatedStat
                key={stat.label}
                value={stat.value}
                suffix={stat.suffix}
                label={stat.label}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block text-sm font-bold uppercase tracking-wider text-purple-600 mb-4">Features</span>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-4">
              Everything You Need for{' '}
              <span className="gradient-text">Better Assessment</span>
            </h2>
            <p className="text-lg text-slate-600">
              A comprehensive suite of tools designed to make formative assessment simple, insightful, and effective.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature, index) => {
              const colorClasses: Record<string, { gradient: string; text: string; bg: string; border: string; hover: string; glow: string }> = {
                purple: { gradient: 'from-purple-500 to-purple-600', text: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200', hover: 'hover:border-purple-300 hover:shadow-purple-100', glow: 'group-hover:shadow-purple-500/20' },
                cyan: { gradient: 'from-cyan-500 to-cyan-600', text: 'text-cyan-600', bg: 'bg-cyan-50', border: 'border-cyan-200', hover: 'hover:border-cyan-300 hover:shadow-cyan-100', glow: 'group-hover:shadow-cyan-500/20' },
                orange: { gradient: 'from-orange-500 to-orange-600', text: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', hover: 'hover:border-orange-300 hover:shadow-orange-100', glow: 'group-hover:shadow-orange-500/20' },
                emerald: { gradient: 'from-emerald-500 to-emerald-600', text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', hover: 'hover:border-emerald-300 hover:shadow-emerald-100', glow: 'group-hover:shadow-emerald-500/20' },
                pink: { gradient: 'from-pink-500 to-pink-600', text: 'text-pink-600', bg: 'bg-pink-50', border: 'border-pink-200', hover: 'hover:border-pink-300 hover:shadow-pink-100', glow: 'group-hover:shadow-pink-500/20' },
                indigo: { gradient: 'from-indigo-500 to-indigo-600', text: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200', hover: 'hover:border-indigo-300 hover:shadow-indigo-100', glow: 'group-hover:shadow-indigo-500/20' }
              };
              const colors = colorClasses[feature.color];

              return (
                <div
                  key={feature.title}
                  className={`group relative overflow-hidden rounded-2xl p-6 bg-white/80 backdrop-blur-sm border-2 ${colors.border} ${colors.hover} shadow-lg hover:shadow-xl ${colors.glow} hover:-translate-y-1 transition-all duration-300 animate-slide-in-up`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Animated background gradient on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500`} />

                  {/* Icon container with pulse effect on hover */}
                  <div className={`relative w-14 h-14 rounded-xl ${colors.bg} ${colors.border} border-2 flex items-center justify-center mb-4 group-hover:scale-110 transition-all duration-300`}>
                    <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${colors.gradient} opacity-0 group-hover:opacity-20 group-hover:animate-pulse transition-opacity`} />
                    <span className={`relative ${colors.text}`}>
                      <FeatureIcon type={feature.icon} />
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-slate-900 transition-colors">{feature.title}</h3>
                  <p className="text-slate-600 group-hover:text-slate-700 transition-colors">{feature.description}</p>

                  {/* Corner decoration */}
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colors.gradient} opacity-5 rounded-full translate-x-16 -translate-y-16 group-hover:scale-150 group-hover:opacity-10 transition-all duration-500`} />

                  {/* Bottom line accent on hover */}
                  <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${colors.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`} />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative z-10 py-16 lg:py-24 bg-gradient-to-b from-transparent via-purple-50/50 to-transparent overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-0 w-96 h-96 bg-purple-200 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-pink-200 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-purple-600 mb-4 bg-purple-100 px-4 py-2 rounded-full">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
              How It Works
            </span>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-4">
              Simple Steps to{' '}
              <span className="gradient-text">Transform Learning</span>
            </h2>
            <p className="text-lg text-slate-600">
              Get started in minutes and see immediate improvements in student engagement and understanding.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => {
              const stepColors = [
                { bg: 'from-purple-600 to-purple-700', shadow: 'shadow-purple-500/30', ring: 'ring-purple-200' },
                { bg: 'from-pink-600 to-pink-700', shadow: 'shadow-pink-500/30', ring: 'ring-pink-200' },
                { bg: 'from-orange-500 to-orange-600', shadow: 'shadow-orange-500/30', ring: 'ring-orange-200' },
                { bg: 'from-cyan-500 to-cyan-600', shadow: 'shadow-cyan-500/30', ring: 'ring-cyan-200' }
              ];
              const color = stepColors[index];

              return (
                <div
                  key={step.step}
                  className="group relative animate-slide-in-up"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  {/* Connector line with animated gradient */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 z-0 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-300 via-pink-300 to-transparent" />
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-transparent w-1/2 animate-pulse" />
                    </div>
                  )}

                  <div className="relative z-10 text-center lg:text-left">
                    {/* Step number with enhanced styling */}
                    <div className={`relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${color.bg} text-white font-bold text-lg shadow-xl ${color.shadow} mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                      <span className="relative z-10">{step.step}</span>
                      {/* Ring effect on hover */}
                      <div className={`absolute -inset-2 rounded-2xl ring-4 ${color.ring} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                      {/* Glow effect */}
                      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${color.bg} blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-300`} />
                    </div>

                    {/* Content card effect */}
                    <div className="group-hover:translate-x-1 transition-transform duration-300">
                      <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-slate-900 transition-colors">{step.title}</h3>
                      <p className="text-slate-600 group-hover:text-slate-700 transition-colors">{step.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative z-10 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block text-sm font-bold uppercase tracking-wider text-purple-600 mb-4">Testimonials</span>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-4">
              Loved by{' '}
              <span className="gradient-text">Educators Everywhere</span>
            </h2>
            <p className="text-lg text-slate-600">
              See what teachers and administrators are saying about EduAssess.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {testimonials.map((testimonial, index) => {
              const gradients = [
                'from-purple-500 via-purple-600 to-pink-500',
                'from-orange-500 via-orange-600 to-pink-500',
                'from-cyan-500 via-blue-500 to-purple-500'
              ];
              const gradient = gradients[index % gradients.length];

              return (
                <div
                  key={testimonial.name}
                  className="group relative bg-white rounded-2xl p-6 lg:p-8 shadow-lg border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 animate-slide-in-up overflow-hidden"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Background gradient effect on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-[0.02] transition-opacity duration-500`} />

                  {/* Quote icon with animated border */}
                  <div className={`absolute -top-4 left-6 w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                    <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                    </svg>
                  </div>

                  {/* Rating with animation */}
                  <div className="flex gap-1 mb-4 mt-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <svg
                        key={i}
                        className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform"
                        style={{ transitionDelay: `${i * 50}ms` }}
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>

                  {/* Quote with enhanced typography */}
                  <p className="text-slate-600 mb-6 leading-relaxed text-[15px] italic group-hover:text-slate-700 transition-colors">"{testimonial.quote}"</p>

                  {/* Author with enhanced styling */}
                  <div className="flex items-center gap-4 pt-4 border-t border-gray-100 relative">
                    <div className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-300`}>
                      <span className="relative z-10">{testimonial.avatar}</span>
                      <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 group-hover:text-slate-900 transition-colors">{testimonial.name}</p>
                      <p className="text-sm text-slate-500">{testimonial.role}</p>
                      <p className="text-xs text-slate-400">{testimonial.school}</p>
                    </div>
                  </div>

                  {/* Corner decorative element */}
                  <div className={`absolute -bottom-8 -right-8 w-32 h-32 bg-gradient-to-br ${gradient} opacity-5 rounded-full group-hover:scale-150 group-hover:opacity-10 transition-all duration-700`} />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-6">
          <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 p-8 lg:p-12 shadow-2xl hover:shadow-3xl transition-shadow duration-500">
            {/* Animated decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-32 -translate-y-32 group-hover:scale-150 transition-transform duration-700" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -translate-x-24 translate-y-24 group-hover:scale-150 transition-transform duration-700" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full opacity-0 group-hover:opacity-100 group-hover:scale-100 scale-50 transition-all duration-700" />

            {/* Floating particles */}
            <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/40 rounded-full animate-float-slow" />
            <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-white/30 rounded-full animate-float-slow" style={{ animationDelay: '1s' }} />
            <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-white/50 rounded-full animate-float-slow" style={{ animationDelay: '2s' }} />

            <div className="relative z-10 text-center">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
                <span className="text-sm font-medium text-white">Join thousands of educators worldwide</span>
              </div>

              <h2 className="text-3xl lg:text-4xl font-extrabold text-white mb-4">
                Ready to Transform Your Classroom?
              </h2>
              <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                Join thousands of educators and help improve learning outcomes for students around the world.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <a href="#demo">
                  <Button
                    size="lg"
                    className="bg-white text-purple-700 hover:bg-purple-50 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
                  >
                    Get Started Free
                  </Button>
                </a>
                <a href="#how-it-works">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-white/30 text-white hover:bg-white/10 hover:border-white/50 transition-all duration-300"
                  >
                    Learn More
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 border-t border-gray-200/50 bg-gradient-to-b from-transparent to-slate-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col items-center gap-6 mb-8">
            <Logo size="sm" />
            <p className="text-sm text-slate-500 text-center max-w-md">
              Empowering education through intelligent, AI-powered formative assessment
            </p>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-200/50">
            <p className="text-xs text-slate-400">
              &copy; 2024 EduAssess. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-sm text-slate-600 hover:text-purple-600 transition-colors">Privacy</a>
              <a href="#" className="text-sm text-slate-600 hover:text-purple-600 transition-colors">Terms</a>
              <a href="#" className="text-sm text-slate-600 hover:text-purple-600 transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
