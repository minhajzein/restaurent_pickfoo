'use client';

import { useState } from 'react';
import api from '@/lib/axios';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: email.trim() });
      router.push(`/reset-password?email=${encodeURIComponent(email.trim())}`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || 'Failed to send reset code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center">
          <Link href="/login" className="self-start text-zinc-400 hover:text-primary transition-colors flex items-center gap-1 text-sm mb-4">
            ← Back to sign in
          </Link>
          <div className="mb-6 h-24 w-24 relative">
            <Image src="/logo.png" alt="PickFoo Logo" fill className="object-contain" priority />
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-foreground">
            Forgot password
          </h2>
          <p className="mt-2 text-center text-sm text-zinc-400">
            Enter your email and we&apos;ll send you a code to reset your password.
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-lg bg-red-500/10 p-4 border border-red-500/20">
              <p className="text-sm text-red-500 text-center font-medium">{error}</p>
            </div>
          )}
          <div className="space-y-1">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={cn(
                "relative block w-full rounded-lg border-0 bg-white/5 py-3 px-4 text-foreground ring-1 ring-inset ring-white/10 placeholder:text-zinc-500 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 transition-all"
              )}
              placeholder="Email address"
              autoComplete="email"
            />
          </div>
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-full bg-primary py-3 px-4 text-sm font-semibold text-background hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 cursor-pointer"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Sending...</span>
                </div>
              ) : (
                'Send reset code'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
