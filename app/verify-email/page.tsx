'use client';

import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';

export default function VerifyEmailPage() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(60);
  
  const setAuth = useAuthStore((state) => state.setAuth);
  const router = useRouter();

  useEffect(() => {
    const storedEmail = localStorage.getItem('verify_email');
    if (!storedEmail) {
      router.push('/register');
      return;
    }
    setEmail(storedEmail);

    const countdown = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(countdown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const verifyMutation = useMutation({
    mutationFn: async (otpString: string) => {
      const response = await api.post('/auth/verify-email', {
        email,
        otp: otpString,
      });
      return response.data;
    },
    onSuccess: (data) => {
      localStorage.removeItem('verify_email');
      setAuth(data.user);
      router.push('/owner/dashboard');
    },
    onError: (err: AxiosError<{ message: string }>) => {
      setError(err.response?.data?.message || 'Verification failed');
    },
  });

  const resendMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/auth/resend-otp', { email });
      return response.data;
    },
    onSuccess: () => {
      setTimer(60);
      setError('');
    },
    onError: (err: AxiosError<{ message: string }>) => {
      setError(err.response?.data?.message || 'Resend failed');
    },
  });

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) value = value[0];
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }

    // Submit if complete
    if (newOtp.every(val => val !== '')) {
      verifyMutation.mutate(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 h-20 w-20 relative">
             <Image src="/logo.png" alt="PickFoo Logo" fill className="object-contain" priority />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Verify Email</h2>
          <p className="mt-2 text-sm text-zinc-400">
            We&apos;ve sent a 6-digit code to <span className="text-primary font-medium">{email}</span>
          </p>
        </div>

        <div className="mt-8 space-y-6">
          {error && (
            <div className="rounded-lg bg-red-500/10 p-4 border border-red-500/20 text-center">
              <p className="text-sm text-red-500 font-medium">{error}</p>
            </div>
          )}

          <div className="flex justify-center gap-2 sm:gap-4">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-14 text-center text-2xl font-bold rounded-lg border-0 bg-white/5 text-foreground ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-primary transition-all outline-none"
              />
            ))}
          </div>

          <div className="text-center space-y-4">
            <button
              onClick={() => verifyMutation.mutate(otp.join(''))}
              disabled={verifyMutation.isPending || otp.some(v => v === '')}
              className="group relative flex w-full justify-center rounded-full bg-primary py-3 px-4 text-sm font-semibold text-background hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {verifyMutation.isPending ? <Loader2 className="animate-spin h-5 w-5" /> : 'Verify Account'}
            </button>

            <p className="text-sm text-zinc-400">
              Didn&apos;t receive code?{' '}
              {timer > 0 ? (
                <span className="text-zinc-500">Resend in {timer}s</span>
              ) : (
                <button
                  onClick={() => resendMutation.mutate()}
                  disabled={resendMutation.isPending}
                  className="text-primary font-medium hover:underline cursor-pointer"
                >
                  {resendMutation.isPending ? 'Sending...' : 'Resend Code'}
                </button>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
