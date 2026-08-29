import LoginForm from '../components/LoginForm';
import logo from '../../../assets/logowhite.svg';
import Flow from '../../../components/Flow';

const Login = () => {
  return (
    <div className="min-h-screen lg:h-screen bg-black text-white relative flex flex-col items-center overflow-y-auto overflow-x-hidden font-inter custom-scrollbar">
      {/* Dynamic 3D Atmosphere - Fixed Background */}
      <div className="fixed inset-0 z-0 opacity-40 pointer-events-none">
        <Flow
          horizonColor="#080B40"
          waveColor="#2C588A"
          crestColor="#6CA8E6"
          speed={0.4}
          amplitude={4.5}
          waveScale={0.6}
          waveRatio={0.9}
          swell={35}
          turbulence={20}
          tilt={1.2}
          zoom={0.9}
          height={3}
          fogDepth={15}
          detail="medium"
          brightness={1.6}
          opacity={1}
          mouseInteraction
          parallaxStrength={0.5}
          grain
          grainIntensity={0.05}
        />
      </div>

      {/* Header */}
      <header className="w-full max-w-[1300px] px-8 py-6 flex justify-between items-center z-20">
        <div className="flex items-center gap-2 group cursor-pointer">
          <span className="text-2xl font-bold tracking-tight">Nurturely</span>
          <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden">
            <img src={logo} alt="Nurturely" className="w-full h-full object-cover" />
          </div>
        </div>

      </header>

      {/* Main Content */}
      <main className="w-full max-w-[1300px] flex-1 flex flex-col lg:flex-row items-center justify-between px-8 gap-10 relative z-10 pb-8 mt-4">

        {/* Left Side: Hero Section */}
        <div className="flex-1 space-y-10">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-medium text-white/60">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
              Now in Private Beta
            </div>

            <h1 className="text-6xl lg:text-6xl font-bold tracking-tight leading-[0.95] text-gradient">
              Grow your business <br />
              with precision.
            </h1>

            <p className="text-lg text-white/40 max-w-[460px] leading-relaxed">
              The all-in-one CRM platform designed for high-growth teams.
              Manage leads, automate workflows, and scale your operations with ease.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-[500px]">
            <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl hover:bg-white/[0.05] hover:border-white/20 hover:shadow-[0_0_40px_rgba(255,255,255,0.03)] transition-all duration-300 space-y-2 group/card">
              <h3 className="text-sm font-semibold text-white group-hover/card:text-white transition-colors">Real-time Insights</h3>
              <p className="text-xs text-white/30 leading-relaxed group-hover/card:text-white/50 transition-colors">Instant telemetry on your sales pipeline and customer engagement metrics.</p>
            </div>
            <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl hover:bg-white/[0.05] hover:border-white/20 hover:shadow-[0_0_40px_rgba(255,255,255,0.03)] transition-all duration-300 space-y-2 group/card">
              <h3 className="text-sm font-semibold text-white group-hover/card:text-white transition-colors">Automated Flow</h3>
              <p className="text-xs text-white/30 leading-relaxed group-hover/card:text-white/50 transition-colors">Eliminate manual tasks with smart workflows that trigger on customer actions.</p>
            </div>
          </div>
        </div>

        {/* Right Side: Login Card */}
        <div className="flex-1 flex justify-center lg:justify-end">
          <LoginForm />
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-[1200px] px-8 py-6 flex justify-between items-center z-10 border-t border-white/5">
        <p className="text-xs text-white/20">© 2026 Nurturely</p>
        <div className="flex gap-8">
          <a href="#" className="text-xs text-white/20 hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="text-xs text-white/20 hover:text-white transition-colors">Terms of Service</a>
        </div>
      </footer>
    </div>
  );
};

export default Login;
