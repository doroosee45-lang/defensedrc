'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Flag, Shield, Eye, EyeOff, Lock, User, Smartphone, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login, verifyMFA, mfaPending } = useAuth();

  const [step, setStep] = useState<'credentials' | 'mfa' | 'success'>('credentials');
  const [showPassword, setShowPassword] = useState(false);
  const [matricule, setMatricule] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!matricule.trim() || !password) {
      setError('Veuillez remplir tous les champs.');
      return;
    }
    setLoading(true);
    try {
      const result = await login(matricule.trim().toUpperCase(), password);
      if (result.mfaRequired) {
        setStep('mfa');
      } else {
        setStep('success');
        setTimeout(() => router.push('/dashboard'), 800);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Identifiants incorrects. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  const handleMFA = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (otp.length < 6) {
      setError('Le code OTP doit contenir 6 chiffres.');
      return;
    }
    setLoading(true);
    try {
      await verifyMFA(otp);
      setStep('success');
      setTimeout(() => router.push('/dashboard'), 800);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Code OTP invalide.');
      setOtp('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen military-grid flex items-center justify-center bg-[#060c06] p-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-900/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-green-800/8 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-green-700 to-green-900 rounded-2xl flex items-center justify-center border border-green-500/30 shadow-2xl glow-green">
                <Flag size={36} className="text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                <Shield size={12} className="text-yellow-900" />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] font-medium text-[#5a705a] tracking-[0.3em] uppercase">République Démocratique du Congo</p>
            <p className="text-[10px] font-medium text-[#5a705a] tracking-widest uppercase">Ministère de la Défense Nationale</p>
            <h1 className="text-2xl font-black text-green-400 tracking-wider mt-2">MILSYS RDC</h1>
            <p className="text-xs text-[#8fa88f]">Military Integrated Management System</p>
          </div>

          <div className="flex items-center justify-center gap-2 mt-4 px-4 py-1.5 bg-[#1a261a] border border-[#1e321e] rounded-full w-fit mx-auto">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 status-live" />
            <span className="text-[10px] text-[#5a705a] tracking-wider">CONNEXION SÉCURISÉE — TLS 1.3 — AES-256</span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-[#0f1a0f] border border-[#1e321e] rounded-2xl p-6 shadow-2xl">

          {/* STEP 1 : Credentials */}
          {(step === 'credentials' && !mfaPending) && (
            <>
              <div className="mb-5">
                <h2 className="text-sm font-bold text-[#e8f0e8]">Authentification</h2>
                <p className="text-xs text-[#5a705a] mt-0.5">Entrez vos identifiants militaires</p>
              </div>

              <form onSubmit={handleCredentials} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#8fa88f] mb-1.5">Matricule FARDC</label>
                  <div className="relative">
                    <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5a705a]" />
                    <input
                      type="text"
                      placeholder="ex: GEN-001-EMG"
                      value={matricule}
                      onChange={e => setMatricule(e.target.value)}
                      autoComplete="username"
                      className="w-full bg-[#0a110a] border border-[#1e321e] rounded-lg pl-9 pr-3 py-2.5 text-sm text-[#e8f0e8] placeholder-[#3a503a] focus:outline-none focus:border-green-500/60 focus:ring-1 focus:ring-green-500/20 transition-all font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#8fa88f] mb-1.5">Mot de passe</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5a705a]" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      autoComplete="current-password"
                      className="w-full bg-[#0a110a] border border-[#1e321e] rounded-lg pl-9 pr-10 py-2.5 text-sm text-[#e8f0e8] placeholder-[#3a503a] focus:outline-none focus:border-green-500/60 focus:ring-1 focus:ring-green-500/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5a705a] hover:text-[#8fa88f]"
                      aria-label="Afficher/masquer le mot de passe"
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <AlertTriangle size={13} className="text-red-400 flex-shrink-0" />
                    <span className="text-xs text-red-400">{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-500 disabled:bg-green-900 text-white font-semibold py-2.5 rounded-lg text-sm transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Vérification...</>
                  ) : (
                    'Continuer'
                  )}
                </button>
              </form>

              {/* Comptes de démo */}
              <div className="mt-4 p-3 bg-[#0a150a] border border-[#1a2a1a] rounded-lg">
                <p className="text-[10px] text-[#5a705a] font-medium mb-2 uppercase tracking-wider">Comptes de démonstration</p>
                <div className="space-y-1">
                  {[
                    { mat: 'GEN-001-EMG', pwd: 'Admin@2024!', role: 'Admin National' },
                    { mat: 'ADM-003-SYS', pwd: 'SuperAdmin@2024!', role: 'Super Admin' },
                    { mat: 'COL-002-EMG', pwd: 'User@2024!', role: 'Officier' },
                  ].map(c => (
                    <button
                      key={c.mat}
                      type="button"
                      onClick={() => { setMatricule(c.mat); setPassword(c.pwd); setError(''); }}
                      className="w-full flex justify-between items-center text-[10px] text-[#5a705a] hover:text-green-400 transition-colors py-0.5 px-1 rounded"
                    >
                      <span className="font-mono">{c.mat}</span>
                      <span className="text-[#3a503a]">{c.role}</span>
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-center text-[10px] text-[#3a503a] mt-4">
                Accès strictement réservé au personnel autorisé des FARDC.<br />
                Toute tentative d&apos;accès non autorisée est un crime punissable par la loi.
              </p>
            </>
          )}

          {/* STEP 2 : MFA */}
          {(step === 'mfa' || mfaPending) && step !== 'success' && (
            <>
              <div className="mb-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                    <Smartphone size={20} className="text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-[#e8f0e8]">Authentification à double facteur</h2>
                    <p className="text-xs text-[#5a705a]">Code OTP requis</p>
                  </div>
                </div>
                <p className="text-xs text-[#8fa88f]">
                  Saisissez le code à 6 chiffres de votre application d'authentification militaire.
                </p>
              </div>

              <form onSubmit={handleMFA} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#8fa88f] mb-2">Code OTP (6 chiffres)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="000000"
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full bg-[#0a110a] border border-[#1e321e] rounded-lg px-4 py-3 text-2xl text-center text-[#e8f0e8] placeholder-[#3a503a] focus:outline-none focus:border-green-500/60 focus:ring-1 focus:ring-green-500/20 transition-all font-mono tracking-[0.5em]"
                    autoFocus
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <AlertTriangle size={13} className="text-red-400 flex-shrink-0" />
                    <span className="text-xs text-red-400">{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || otp.length < 6}
                  className="w-full bg-green-600 hover:bg-green-500 disabled:bg-green-900 text-white font-semibold py-2.5 rounded-lg text-sm transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Vérification OTP...</>
                  ) : (
                    'Valider le code'
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => { setStep('credentials'); setOtp(''); setError(''); }}
                  className="w-full text-xs text-[#5a705a] hover:text-[#8fa88f] transition-colors py-1"
                >
                  ← Retour
                </button>
              </form>
            </>
          )}

          {/* STEP 3 : Success */}
          {step === 'success' && (
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle size={28} className="text-green-400" />
              </div>
              <h2 className="text-sm font-bold text-[#e8f0e8] mb-1">Authentification réussie</h2>
              <p className="text-xs text-[#5a705a] mb-3">Chargement de l&apos;interface MILSYS RDC...</p>
              <div className="w-full bg-[#1a261a] rounded-full h-1.5">
                <div className="bg-green-500 h-1.5 rounded-full animate-pulse w-3/4" />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-4 space-y-1">
          <p className="text-[10px] text-[#2d4a2d]">MILSYS RDC v1.0 — CDC-MILSYS-RDC-2025-V1.0</p>
          <p className="text-[10px] text-[#2d4a2d]">CONFIDENTIEL — USAGE OFFICIEL EXCLUSIF</p>
          <p className="text-[10px] text-[#2d4a2d]">© République Démocratique du Congo 2025</p>
        </div>
      </div>
    </div>
  );
}
