import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { useAuth } from '@/context/AuthContext';
import { IoMdPerson } from 'react-icons/io';

const GUEST_EMAIL = 'rishebs123456@gmail.com';
const GUEST_PASSWORD = 'Admin@12345';

const EyeIcon = ({ open }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40 hover:text-white/80 transition-colors">
    {open ? (
      <>
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ) : (
      <>
        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c6.5 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
        <path d="M6.61 6.61A13.53 13.53 0 0 0 2 12s3.5 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
        <line x1="2" y1="2" x2="22" y2="22" />
      </>
    )}
  </svg>
);

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(email, password);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
      setIsLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setEmail(GUEST_EMAIL);
    setPassword(GUEST_PASSWORD);
    setError('');
    setIsLoading(true);

    const result = await login(GUEST_EMAIL, GUEST_PASSWORD);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[400px] p-8 rounded-xl relative overflow-hidden transition-all duration-500 hover:-translate-y-1"      style={{ background: 'linear-gradient(135deg, rgba(21, 21, 21, 0.1) 0%, rgba(255,255,255,0.05) 100%)', backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)', border: '1px solid rgba(255,255,255,0.18)', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
      <div className="space-y-6 relative z-10">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-white">Welcome back</h2>
          <p className="text-white/40 text-sm">Please enter your details to sign in.</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md text-red-500 text-xs font-medium">
              {error}
            </div>
          )}

          <Input
            label="Email Address"
            type="email"
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            rightSlot={
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="flex items-center justify-center p-1"
              >
                <EyeIcon open={showPassword} />
              </button>
            }
          />

          

          <Button className="mt-8 py-3 bg-white/90 !text-black hover:bg-white/90 font-bold" type="submit" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign in'}
          </Button>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-white/10" />
            <span className="flex-shrink-0 mx-4 text-xs text-white/40">or</span>
            <div className="flex-grow border-t border-white/10" />
          </div>

          <Button
            className="mt-2 py-3 bg-white/90 !text-black hover:bg-white/90 font-bold"
            type="button"
            onClick={handleGuestLogin}
            disabled={isLoading}
            aria-label="Sign in as Guest"
          >
            <IoMdPerson className="w-4 h-4" />
            {isLoading ? 'Signing in...' : 'Sign in as Guest'}
          </Button>
        </form>

        <p className="text-center text-xs text-white/20">
          By clicking continue, you agree to our Terms and Conditions.
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
