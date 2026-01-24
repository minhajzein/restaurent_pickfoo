'use client';

import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  
  const { setAuth, isAuthenticated, isInitialized } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      router.push('/');
    }
  }, [isInitialized, isAuthenticated, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (values: RegisterFormValues) => {
      const response = await api.post('/auth/register', {
        name: values.name,
        email: values.email,
        password: values.password,
        role: 'owner',
      });
      return response.data;
    },
    onSuccess: (data) => {
      setAuth(data.user);
      router.push('/');
    },
    onError: (err: AxiosError<{ message: string }>) => {
      setServerError(err.response?.data?.message || 'Registration failed. Please try again.');
    },
  });

  const onSubmit = (values: RegisterFormValues) => {
    setServerError('');
    registerMutation.mutate(values);
  };

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center">
          <div className="mb-6 h-20 w-20 relative">
             <Image
                src="/logo.png" 
                alt="PickFoo Logo"
                fill
                className="object-contain"
                priority
              />
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-foreground">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-zinc-400">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-primary hover:text-primary/80">
              Sign in
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
          {serverError && (
            <div className="rounded-lg bg-red-500/10 p-4 border border-red-500/20">
              <p className="text-sm text-red-500 text-center font-medium">{serverError}</p>
            </div>
          )}
          
          <div className="space-y-4">
            <div className="space-y-1">
              <input
                {...register('name')}
                type="text"
                className={cn(
                  "relative block w-full rounded-lg border-0 bg-white/5 py-3 px-4 text-foreground ring-1 ring-inset ring-white/10 placeholder:text-zinc-500 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 transition-all",
                  errors.name && "ring-red-500 focus:ring-red-500"
                )}
                placeholder="Full Name"
              />
              {errors.name && (
                <p className="text-xs text-red-500 ml-1">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <input
                {...register('email')}
                type="email"
                className={cn(
                  "relative block w-full rounded-lg border-0 bg-white/5 py-3 px-4 text-foreground ring-1 ring-inset ring-white/10 placeholder:text-zinc-500 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 transition-all",
                  errors.email && "ring-red-500 focus:ring-red-500"
                )}
                placeholder="Email address"
              />
              {errors.email && (
                <p className="text-xs text-red-500 ml-1">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? "text" : "password"}
                  className={cn(
                    "relative block w-full rounded-lg border-0 bg-white/5 py-3 px-4 text-foreground ring-1 ring-inset ring-white/10 placeholder:text-zinc-500 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 transition-all pr-12",
                    errors.password && "ring-red-500 focus:ring-red-500"
                  )}
                  placeholder="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 ml-1">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <div className="relative">
                <input
                  {...register('confirmPassword')}
                  type={showConfirmPassword ? "text" : "password"}
                  className={cn(
                    "relative block w-full rounded-lg border-0 bg-white/5 py-3 px-4 text-foreground ring-1 ring-inset ring-white/10 placeholder:text-zinc-500 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 transition-all pr-12",
                    errors.confirmPassword && "ring-red-500 focus:ring-red-500"
                  )}
                  placeholder="Confirm Password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-red-500 ml-1">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={registerMutation.isPending}
              className="group relative flex w-full justify-center rounded-full bg-primary py-3 px-4 text-sm font-semibold text-background hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 cursor-pointer"
            >
              {registerMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Creating account...</span>
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
