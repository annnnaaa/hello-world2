import { useForm } from 'react-hook-form';
import { z } from 'zod/v4';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

const baseSchema = z.object({
  email: z.email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const signupSchema = baseSchema.extend({
  displayName: z.string().min(1, 'Display name is required'),
});

const loginSchema = baseSchema;

type LoginValues = z.infer<typeof loginSchema>;
type SignupValues = z.infer<typeof signupSchema>;
type FormValues = LoginValues & { displayName?: string };

interface AuthFormProps {
  mode: 'login' | 'signup';
  onSubmit: (email: string, password: string, displayName?: string) => void | Promise<void>;
  loading?: boolean;
  error?: string | null;
}

export function AuthForm({ mode, onSubmit, loading = false, error }: AuthFormProps) {
  const isSignup = mode === 'signup';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(isSignup ? signupSchema : loginSchema),
    defaultValues: {
      email: '',
      password: '',
      ...(isSignup ? { displayName: '' } : {}),
    },
  });

  function handleFormSubmit(data: FormValues) {
    onSubmit(data.email, data.password, data.displayName);
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-slate-100">
          {isSignup ? 'Create your account' : 'Welcome back'}
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          {isSignup
            ? 'Start organizing your mind with ClearMind'
            : 'Sign in to continue to ClearMind'}
        </p>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {isSignup && (
          <Input
            label="Display name"
            placeholder="Your name"
            autoComplete="name"
            error={errors.displayName?.message}
            {...register('displayName')}
          />
        )}

        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Password"
          type="password"
          placeholder="At least 8 characters"
          autoComplete={isSignup ? 'new-password' : 'current-password'}
          error={errors.password?.message}
          {...register('password')}
        />

        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <Button
          type="submit"
          loading={loading}
          className="w-full"
        >
          {isSignup ? 'Create account' : 'Sign in'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        {isSignup ? (
          <>
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Sign in
            </Link>
          </>
        ) : (
          <>
            Don&apos;t have an account?{' '}
            <Link
              to="/signup"
              className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Create one
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
