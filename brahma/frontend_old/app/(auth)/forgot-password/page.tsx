'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link } from '@/components/ui/link';
import { useState } from 'react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSent(true);
      setIsSubmitting(false);
    }, 1500);
  };

  if (isSent) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12 sm:mx-auto">
        <div className="w-full space-y-6 sm:max-w-md text-center">
          <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
            Password Reset Email Sent
          </h2>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            We've sent a password reset link to {email}. Please check your inbox (and spam folder) for instructions on resetting your password.
          </p>
          <Link href="/auth/login" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Go back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12 sm:mx-auto">
      <form className="w-full space-y-6 sm:max-w-md" onSubmit={handleSubmit}>
        <div className="flex flex-col space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            className="mt-1 block w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Sending...' : 'Send Reset Link'}
        </Button>
      </form>

      <p className="mt-6 text-sm text-gray-600 dark:text-gray-400">
        Remember your password?{' '}
        <Link href="/auth/login" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
          Sign in
        </Link>
      </p>
    </div>
  );
}