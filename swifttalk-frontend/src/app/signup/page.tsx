'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Mail, Eye, EyeOff, Smartphone
} from 'lucide-react';
import AuthLayout from '@/components/layout/AuthLayout';
import countryCodes from '@/data/countryCodes.json';
import api from '@/lib/axios';

function errorMessage(error: unknown, fallback: string) {
  const response = (error as { response?: { data?: unknown } } | null)?.response;
  if (typeof response?.data === 'string') {
    return response.data.replace(/^Error: /, '') || fallback;
  }
  const data = response?.data;
  return data && typeof data === 'object' && 'message' in data && typeof data.message === 'string'
    ? data.message || fallback
    : fallback;
}

interface LoginResponse {
  token: string;
  userId: number;
  username: string;
}

function openChat(account: LoginResponse) {
  localStorage.setItem('token', account.token);
  localStorage.setItem('userId', account.userId.toString());
  localStorage.setItem('username', account.username);
  window.location.assign('/chat');
}

export default function SignupPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    countryCode: '+91',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [verificationStep, setVerificationStep] = useState<'none' | 'select' | 'otp'>('none');
  const [verifyMethod, setVerifyMethod] = useState<'phone' | 'email' | null>(null);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const [busy, setBusy] = useState(false);
  const [resendTimer, setResendTimer] = useState(90);

  const fullPhone = `${formData.countryCode}${formData.phone}`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setBusy(true);
    setError('');
    try {
      const { data } = await api.post<LoginResponse | string>('/auth/signup', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        phoneNumber: fullPhone,
      });

      if (typeof data === 'string') {
        setVerificationStep('select');
      } else {
        openChat(data);
      }
    } catch (err) {
      const msg = errorMessage(err, 'Signup failed. Please try again.');
      if (msg.includes('Email already registered')) {
        setError('This email is already registered.');
      } else if (msg.includes('Phone number already in use')) {
        setError('This phone number is already in use.');
      } else if (msg.includes('Username already taken')) {
        setError('This username is already taken.');
      } else {
        setError(msg);
      }
    } finally {
      setBusy(false);
    }
  };

  const sendOtp = async (method: 'phone' | 'email') => {
    setBusy(true);
    setError('');
    try {
      await api.post('/auth/send-otp', {
        method,
        phone: fullPhone,
        email: formData.email,
      });

      setOtp('');
      setVerifyMethod(method);
      setVerificationStep('otp');
      setResendTimer(90);
    } catch (err) {
      setError(errorMessage(err, 'Could not send verification code.'));
    } finally {
      setBusy(false);
    }
  };

  const handleOtpSubmit = async () => {
    const isValidOtp = /^\d{4,6}$/.test(otp) || /^[A-Za-z0-9]{5}$/.test(otp);
    if (!isValidOtp) {
      setError('Enter the verification code.');
      return;
    }

    setBusy(true);
    setError('');
    try {
      const res = await api.post<LoginResponse>('/auth/verify-otp', {
        method: verifyMethod,
        phone: fullPhone,
        email: formData.email,
        otp,
      });

      openChat(res.data);
    } catch (err) {
      setError(errorMessage(err, 'Invalid verification code.'));
    } finally {
      setBusy(false);
    }
  };

  const handleResendOtp = async () => {
    if (!verifyMethod) return;

    await sendOtp(verifyMethod);
  };

  useEffect(() => {
    if (verificationStep === 'otp' && resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer, verificationStep]);

  return (
    <AuthLayout>
      <h1 className="auth-heading">
        {verificationStep === 'none' ? 'Create an account' : verificationStep === 'select' ? 'Verify your account' : 'Enter verification code'}
      </h1>

      {verificationStep === 'none' && (
        <form method="post" onSubmit={handleSubmit} className="auth-form">
          <label className="auth-label">
            Username
            <input name="username" autoComplete="username" value={formData.username} onChange={handleChange} required />
          </label>
          <label className="auth-label">
            Email
            <input type="email" name="email" autoComplete="email" value={formData.email} onChange={handleChange} required />
          </label>
          <div className="auth-phone">
            <label className="auth-label">
              Country code
              <select name="countryCode" autoComplete="tel-country-code" value={formData.countryCode} onChange={handleChange}>
                {countryCodes.map((country) => (
                  <option key={country.name} value={country.code}>{country.name} ({country.code})</option>
                ))}
              </select>
            </label>
            <label className="auth-label">
              Phone number
              <input type="tel" name="phone" autoComplete="tel-national" value={formData.phone} onChange={handleChange} required />
            </label>
          </div>
          {[
            { name: 'password', label: 'Password', visible: showPassword, toggle: setShowPassword },
            { name: 'confirmPassword', label: 'Confirm password', visible: showConfirm, toggle: setShowConfirm },
          ].map(({ name, label, visible, toggle }) => (
            <div key={name} className="auth-password">
              <label className="auth-label">
                {label}
                <input name={name} type={visible ? 'text' : 'password'} autoComplete="new-password"
                  value={name === 'password' ? formData.password : formData.confirmPassword} onChange={handleChange} required />
              </label>
              <button type="button" className="auth-reveal" aria-label={visible ? 'Hide ' + label.toLowerCase() : 'Show ' + label.toLowerCase()} onClick={() => toggle(!visible)}>
                {visible ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          ))}
          {error && <p role="alert" className="auth-error">{error}</p>}
          <button className="auth-primary" type="submit" disabled={!ready || busy}>{busy ? 'Creating account...' : 'Create account'}</button>
        </form>
      )}

      {verificationStep === 'select' && (
        <div className="auth-form">
          <button className="auth-primary" disabled={busy} onClick={() => sendOtp('email')}><Mail size={17} /> Get email verification code</button>
          <button className="auth-secondary" disabled={busy} onClick={() => sendOtp('phone')}><Smartphone size={17} /> Verify by SMS</button>
          {error && <p role="alert" className="auth-error">{error}</p>}
          <button className="auth-secondary" disabled={busy} onClick={() => { setError(''); setVerificationStep('none'); }}>Edit account details</button>
        </div>
      )}

      {verificationStep === 'otp' && (
        <form className="auth-form" onSubmit={(event) => { event.preventDefault(); void handleOtpSubmit(); }}>
          <p className="auth-description">Code sent to {verifyMethod === 'phone' ? fullPhone : formData.email}.</p>
          <label className="auth-label">
            Verification code
            <input autoComplete="one-time-code" value={otp} maxLength={6} onChange={(event) => setOtp(event.target.value)} required />
          </label>
          {error && <p role="alert" className="auth-error">{error}</p>}
          <button className="auth-primary" disabled={busy}>{busy ? 'Verifying?' : 'Verify and log in'}</button>
          <button type="button" className="auth-secondary" disabled={busy || resendTimer > 0} onClick={handleResendOtp}>
            {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend code'}
          </button>
          <button type="button" className="auth-secondary" disabled={busy} onClick={() => { setOtp(''); setError(''); setVerificationStep('select'); }}>Change verification method</button>
        </form>
      )}

      <p className="auth-footer">Already have an account? <Link href="/login">Log in</Link></p>
    </AuthLayout>
  );
}
