import React, { useContext, useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import handshake from '../assets/loginSide.png';
import { AuthContext } from '../context/AuthContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { AuthField, AuthShowcase, BrandMark, PasswordField, SubmitButton } from '../components/AuthFields';

const MIN_PASSWORD_LENGTH = 5; // matches the server's rule

const FEATURES = [
  { icon: '💬', text: 'Private one-to-one chats' },
  { icon: '🌍', text: 'A global room to meet everyone' },
  { icon: '🕐', text: 'Disappearing messages' },
  { icon: '📍', text: 'Share your location' },
  { icon: '✓✓', text: 'Read receipts' },
];

const Requirement: React.FC<{ met: boolean; children: React.ReactNode }> = ({ met, children }) => (
  <li className={`flex items-center gap-1.5 ${met ? 'text-green-600 dark:text-green-400' : ''}`}>
    <span aria-hidden="true" className="w-4 text-center">{met ? '✓' : '•'}</span>
    {children}
    <span className="sr-only">{met ? '(done)' : '(not yet)'}</span>
  </li>
);

export const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirm, setConfirm] = useState<string>('');
  const [confirmTouched, setConfirmTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const authContext = useContext(AuthContext);
  const clearErrors = authContext?.clearErrors;

  // errors left over from the login page shouldn't show up here
  useEffect(() => {
    clearErrors?.();
  }, [clearErrors]);

  if (!authContext) {
    return null;
  }

  if (authContext.isValid === undefined) {
    return <LoadingSpinner />;
  }

  // already signed in: nothing to register
  if (authContext.isValid) {
    return <Navigate to={'/homepage'} replace />;
  }

  const { errors, register } = authContext;

  const longEnough = password.length >= MIN_PASSWORD_LENGTH;
  const matches = confirm.length > 0 && confirm === password;
  const showMismatch = confirmTouched && confirm.length > 0 && !matches;

  const handleSubmission = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setConfirmTouched(true);
    if (password !== confirm) return;

    setSubmitting(true);
    try {
      await register(username, password);
    } finally {
      setSubmitting(false);
    }
  };

  const errorsFor = (path: string) => errors.filter((e) => e.path === path).map((e) => e.message);

  return (
    <main className="min-h-dvh w-full flex flex-col md:grid md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] bg-gray-50 dark:bg-[#202224] text-gray-900 dark:text-gray-100">
      {/* Phones: orange brand band above the form */}
      <div className="relative md:hidden overflow-hidden bg-gradient-to-br from-[#ffb74d] via-[#ff9800] to-[#ef6c00] text-white px-6 pt-[max(2rem,env(safe-area-inset-top))] pb-10">
        <div className="pointer-events-none absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-white/10" />
        <BrandMark className="relative [&_img]:brightness-0 [&_img]:invert" />
        <p className="relative mt-4 poppins-bold text-2xl leading-tight">Meet new people.<br />Chat in real time.</p>
      </div>

      {/* Form: same side as the login form on desktop; on phones a sheet overlapping the band */}
      <section className="relative -mt-6 md:mt-0 flex flex-1 items-start md:items-center justify-center rounded-t-3xl md:rounded-none bg-gray-50 dark:bg-[#202224] px-6 pt-8 pb-10 sm:px-10 md:py-10">
        <div className="w-full max-w-sm">
          <BrandMark className="hidden md:flex mb-12 text-gray-900 dark:text-white" />

          <h1 className="poppins-bold text-3xl sm:text-4xl">Create your account</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">It's free and takes less than a minute.</p>

          <form onSubmit={handleSubmission} className="mt-8 space-y-5" noValidate>
            <AuthField
              id="username"
              label="Choose a username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.replace(/\s/g, '').toLowerCase())}
              required
              maxLength={30}
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              placeholder="e.g. sara"
              hint="Lowercase, no spaces. This is how people will find you."
              errors={errorsFor('username')}
            />
            <PasswordField
              id="password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value.trim())}
              required
              autoComplete="new-password"
              placeholder="••••••••"
              hint={
                <ul>
                  <Requirement met={longEnough}>At least {MIN_PASSWORD_LENGTH} characters</Requirement>
                </ul>
              }
              errors={errorsFor('password')}
            />
            <PasswordField
              id="confirm-password"
              label="Confirm password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value.trim())}
              onBlur={() => setConfirmTouched(true)}
              required
              autoComplete="new-password"
              placeholder="••••••••"
              hint={
                !showMismatch && (
                  <ul>
                    <Requirement met={matches}>Passwords match</Requirement>
                  </ul>
                )
              }
              errors={showMismatch ? ["Passwords don't match"] : []}
            />

            {errorsFor('general').length > 0 && (
              <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300" role="alert">
                {errorsFor('general').join(' ')}
              </div>
            )}

            <SubmitButton loading={submitting} label="Create account" loadingLabel="Creating account…" />
          </form>

          <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-[#e68900] dark:text-[#ffb74d] hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </section>

      {/* Showcase panel (desktop): same dark panel as the login page */}
      <AuthShowcase
        title="Meet new people. Chat in real time."
        subtitle="Join TalkMate to chat one-to-one or with everyone in the global room."
      >
        <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl shadow-black/40">
          <img src={handshake} alt="Two people shaking hands" className="w-full max-h-56 object-contain" />
        </div>
        <ul className="mt-8 w-full max-w-md grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-3 text-sm font-medium text-gray-200">
          {FEATURES.map((f) => (
            <li key={f.text} className="flex items-center gap-3">
              <span className="flex w-8 h-8 shrink-0 items-center justify-center rounded-full bg-[#ff9800]/15 text-xs text-[#ffb74d] ring-1 ring-[#ff9800]/30" aria-hidden="true">
                {f.icon}
              </span>
              {f.text}
            </li>
          ))}
        </ul>
      </AuthShowcase>
    </main>
  );
};
