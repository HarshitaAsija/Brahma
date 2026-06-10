'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link } from '@/components/ui/link';
import { useState } from 'react';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle signup logic
    console.log('Signup attempt:', { name, email, password, confirmPassword });
    // Redirect to login or dashboard on success
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12 sm:mx-auto">
      <form className="w-full space-y-6 sm:max-w-md" onSubmit={handleSubmit}>
        <div className="flex flex-col space-y-2">
          <Label htmlFor="name" className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Full Name
          </Label>
          <Input
            id="name"
            type="text"
            autoComplete="name"
            className="mt-1 block w-full"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

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

        <div className="flex flex-col space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            className="mt-1 block w-full"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col space-y-2">
          <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Confirm Password
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            className="mt-1 block w-full"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        <Button type="submit" className="w-full">
          Create Account
        </Button>
      </form>

      <p className="mt-6 text-sm text-gray-600 dark:text-gray-400">
        Already have an account?{' '}
        <Link href="/auth/login" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
          Sign in
        </Link>
      </p>
    </div>
  );
}