'use client';

import { useEffect, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthLayout from '@/components/layout/AuthLayout';
import api from '@/lib/axios'; // Custom Axios instance

interface LoginResponse {
  token: string;
  userId: string;
  role: string;
}

export default function LoginPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post<LoginResponse>('/auth/login', formData);
      const { token, userId, role } = response.data;

      // Store token and user info
      localStorage.setItem('token', token);
      localStorage.setItem('userId', userId);
      localStorage.setItem('role', role);

      // ✅ Redirect to profile page
      router.push('/chat');
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Login failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <h1 className="auth-heading">Log in</h1>
      <form method="post" onSubmit={handleSubmit} className="auth-form">
        <label className="auth-label">
          Email
          <input type="email" name="email" autoComplete="email" value={formData.email} onChange={handleChange} required />
        </label>
        <div className="auth-password">
          <label className="auth-label">
            Password
            <input type={showPassword ? 'text' : 'password'} name="password" autoComplete="current-password" value={formData.password} onChange={handleChange} required />
          </label>
          <button type="button" className="auth-reveal" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>
        {error && <p role="alert" className="auth-error">{error}</p>}
        <button type="submit" className="auth-primary" disabled={!ready || loading}>
          {loading ? 'Logging in?' : 'Log in'}
        </button>
      </form>
      <p className="auth-footer">New to SwiftTalk? <Link href="/signup">Create an account</Link></p>
    </AuthLayout>
  );
}
