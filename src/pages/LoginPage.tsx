import React, { useContext, useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { AuthField, AuthShowcase, BrandMark, PasswordField, SubmitButton } from '../components/AuthFields';

// a little preview of the app, so the login page shows what's waiting for you
const ChatPreview: React.FC = () => (
  <div className="w-full max-w-md rounded-3xl bg-[#232627] border border-white/10 shadow-2xl shadow-black/40 overflow-hidden">
    <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
      <div className="relative">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center font-bold text-white">S</div>
        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 ring-2 ring-[#232627]" />
      </div>
      <div>
        <p className="font-semibold text-gray-100 leading-tight">sara</p>
        <p className="text-xs text-green-400">online</p>
      </div>
    </div>

    <div className="px-5 py-5 space-y-3 text-sm">
      <div className="max-w-[75%] rounded-2xl rounded-bl-md bg-[#0e1621] text-gray-100 px-4 py-2.5">
        Are we still on for tonight? 🍕
        <p className="text-[11px] text-gray-400 mt-1">7:41 PM</p>
      </div>
      <div className="max-w-[75%] ml-auto rounded-2xl rounded-br-md bg-[#ff9800] text-white px-4 py-2.5">
        Yes! 8pm at the usual place
        <p className="text-[11px] mt-1 flex justify-end gap-2">
          <span className="text-white/90">7:42 PM</span>
          <span className="font-semibold text-blue-800">✓✓ Read</span>
        </p>
      </div>
      <div className="max-w-[75%] rounded-2xl rounded-bl-md bg-[#0e1621] text-gray-100 px-4 py-2.5">
        Perfect, see you there 👋
        <p className="text-[11px] text-gray-400 mt-1">7:42 PM</p>
      </div>
      <div className="flex items-center gap-1 w-fit rounded-2xl rounded-bl-md bg-[#0e1621] px-4 py-3" aria-label="sara is typing">
        <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.3s]" />
        <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.15s]" />
        <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" />
      </div>
    </div>
  </div>
);

const LoginPage: React.FC = (): React.ReactNode => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const authContext = useContext(AuthContext);
  const [isVisible, setIsVisible] = useState<boolean>(true);

  const { login, errors, message, clearErrors } = authContext!;

  // errors left over from the register page shouldn't show up here
  useEffect(() => {
    clearErrors();
  }, [clearErrors]);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, [message]);

  const handleSubmission = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(username, password);
    } finally {
      setSubmitting(false);
    }
  };

  if (authContext && authContext.isValid === undefined) {
    return <LoadingSpinner />;
  }

  if (authContext && authContext.isValid) {
    return <Navigate to={'/homepage'} replace />;
  }

  const errorsFor = (path: string) => errors.filter((e) => e.path === path).map((e) => e.message);

  return (
    <main className="min-h-dvh w-full grid md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] bg-gray-50 dark:bg-[#202224] text-gray-900 dark:text-gray-100">
      {/* Form */}
      <section className="flex items-center justify-center px-6 py-10 sm:px-10">
        <div className="w-full max-w-sm">
          <BrandMark className="mb-12 text-gray-900 dark:text-white" />

          <h1 className="poppins-bold text-3xl sm:text-4xl">Welcome back</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Sign in to pick up your conversations where you left them.
          </p>

          {isVisible && message && (
            <div
              className="mt-6 flex items-start gap-2 rounded-xl border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-950/50 dark:text-green-300"
              role="status"
            >
              <span aria-hidden="true">✓</span>
              <span className="font-medium">{/[.!?]$/.test(message) ? message : `${message}.`} You can sign in now.</span>
            </div>
          )}

          <form onSubmit={handleSubmission} className="mt-8 space-y-5" noValidate>
            <AuthField
              id="username"
              label="Username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.replace(/\s/g, '').toLowerCase())}
              required
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              placeholder="your username"
              errors={errorsFor('username')}
            />
            <PasswordField
              id="password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value.trim())}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              errors={errorsFor('password')}
            />

            {errorsFor('general').length > 0 && (
              <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300" role="alert">
                {errorsFor('general').join(' ')}
              </div>
            )}

            <SubmitButton loading={submitting} label="Sign in" loadingLabel="Signing in…" />
          </form>

          <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
            New to TalkMate?{' '}
            <Link to="/sign-up" className="font-semibold text-[#e68900] dark:text-[#ffb74d] hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </section>

      {/* Showcase panel (desktop) */}
      <AuthShowcase
        title="Pick up where you left off."
        subtitle="Your chats, read receipts and the global room are right where you left them."
      >
        <ChatPreview />
      </AuthShowcase>
    </main>
  );
};

export default LoginPage;
