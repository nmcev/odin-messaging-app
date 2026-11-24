import React, { useState } from 'react';

// Shared building blocks for the login and register forms.

const inputClass =
  'block w-full rounded-xl border px-4 py-3 text-base outline-none transition ' +
  'bg-white text-gray-900 placeholder-gray-400 border-gray-300 ' +
  'dark:bg-[#1f2122] dark:text-gray-100 dark:placeholder-gray-500 dark:border-gray-600 ' +
  'focus:border-[#ff9800] focus:ring-4 focus:ring-[#ff9800]/20';

const errorInputClass = ' border-red-500 dark:border-red-500 focus:border-red-500 focus:ring-red-500/20';

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  hint?: React.ReactNode;
  errors?: string[];
}

export const AuthField: React.FC<FieldProps> = ({ id, label, hint, errors = [], className, ...input }) => {
  const hasError = errors.length > 0;
  const describedBy = [hint ? `${id}-hint` : '', hasError ? `${id}-error` : ''].filter(Boolean).join(' ') || undefined;

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={hasError || undefined}
        aria-describedby={describedBy}
        className={inputClass + (hasError ? errorInputClass : '') + (className ? ` ${className}` : '')}
        {...input}
      />
      {hint && (
        <div id={`${id}-hint`} className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
          {hint}
        </div>
      )}
      {hasError && (
        <div id={`${id}-error`} role="alert">
          {errors.map((message) => (
            <p key={message} className="mt-1.5 text-sm text-red-600 dark:text-red-400">
              {message}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

type PasswordFieldProps = Omit<FieldProps, 'type'>;

export const PasswordField: React.FC<PasswordFieldProps> = ({ id, label, hint, errors = [], ...input }) => {
  const [visible, setVisible] = useState(false);
  const hasError = errors.length > 0;
  const describedBy = [hint ? `${id}-hint` : '', hasError ? `${id}-error` : ''].filter(Boolean).join(' ') || undefined;

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          aria-invalid={hasError || undefined}
          aria-describedby={describedBy}
          className={inputClass + ' pr-12' + (hasError ? errorInputClass : '')}
          {...input}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          className="absolute inset-y-0 right-0 flex items-center px-3 rounded-r-xl bg-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100"
        >
          {visible ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
              <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
              <path d="M1 1l22 22" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
      {hint && (
        <div id={`${id}-hint`} className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
          {hint}
        </div>
      )}
      {hasError && (
        <div id={`${id}-error`} role="alert">
          {errors.map((message) => (
            <p key={message} className="mt-1.5 text-sm text-red-600 dark:text-red-400">
              {message}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

interface SubmitButtonProps {
  loading: boolean;
  label: string;
  loadingLabel: string;
  disabled?: boolean;
}

export const SubmitButton: React.FC<SubmitButtonProps> = ({ loading, label, loadingLabel, disabled }) => (
  <button
    type="submit"
    disabled={loading || disabled}
    className="w-full flex items-center justify-center gap-2 rounded-xl py-3 px-4 text-base font-semibold text-white bg-[#ff9800] hover:bg-[#f08c00] shadow-md shadow-[#ff9800]/25 focus:outline-none focus:ring-4 focus:ring-[#ff9800]/30 disabled:opacity-60 disabled:cursor-not-allowed transition"
  >
    {loading && (
      <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" aria-hidden="true" />
    )}
    {loading ? loadingLabel : label}
  </button>
);

export const BrandMark: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <img src="/chat.svg" alt="" className="w-8 h-8" />
    <span className="poppins-bold text-2xl">TalkMate</span>
  </div>
);

interface AuthShowcaseProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

// Right-hand panel shared by login and register on desktop, so both pages share one look
export const AuthShowcase: React.FC<AuthShowcaseProps> = ({ title, subtitle, children }) => (
  <aside className="relative hidden md:flex flex-col items-center justify-center gap-10 overflow-hidden bg-[#181A1B] px-10 py-12">
    <div className="pointer-events-none absolute -top-32 -right-32 w-[28rem] h-[28rem] rounded-full bg-[#ff9800]/25 blur-3xl" />
    <div className="pointer-events-none absolute -bottom-40 -left-24 w-[26rem] h-[26rem] rounded-full bg-indigo-500/20 blur-3xl" />

    <div className="relative max-w-md text-center">
      <h2 className="poppins-bold text-3xl lg:text-4xl text-white [text-wrap:balance]">{title}</h2>
      <p className="mt-3 text-gray-400 [text-wrap:balance]">{subtitle}</p>
    </div>
    <div className="relative w-full flex flex-col items-center">{children}</div>
  </aside>
);
