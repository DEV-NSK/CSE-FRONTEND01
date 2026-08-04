import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Mail, Lock, ArrowRight, GraduationCap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Label } from "@/shared/components/ui/label";
import { authService } from "@/shared/services/auth.service";
import { useAuthStore } from "@/shared/store/authStore";
import { getDashboardPath } from "@/types";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional(),
});
type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { rememberMe: false },
  });
  const rememberMe = watch("rememberMe");

  const onSubmit = async (data: LoginFormValues) => {
    setError("");
    try {
      const response = await authService.login({ email: data.email, password: data.password });
      const { user, accessToken, refreshToken } = response.data.data;
      login(user, { accessToken, refreshToken });
      navigate(from || getDashboardPath(user.role), { replace: true });
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(axiosError?.response?.data?.message || "Invalid email or password. Please try again.");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Welcome back</h1>
        <p className="text-muted-foreground text-sm">
          Don't have an account?{" "}
          <Link to="/auth/register" className="text-primary font-semibold hover:underline underline-offset-4">
            Create one free
          </Link>
        </p>
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: "auto", marginBottom: 0 }}
            exit={{ opacity: 0, height: 0 }}
            role="alert"
            className="p-3.5 rounded-xl bg-destructive/8 border border-destructive/20 text-destructive text-sm"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-sm font-medium text-foreground">
            Email address
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            leftIcon={<Mail className="h-4 w-4" />}
            autoComplete="email"
            error={errors.email?.message}
            className="h-11 rounded-xl border-border/70 focus:border-primary/60 bg-background"
            {...register("email")}
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-sm font-medium text-foreground">
              Password
            </Label>
            <Link
              to="/auth/forgot-password"
              className="text-xs text-primary hover:underline underline-offset-4"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            leftIcon={<Lock className="h-4 w-4" />}
            autoComplete="current-password"
            error={errors.password?.message}
            className="h-11 rounded-xl border-border/70 focus:border-primary/60 bg-background"
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            {...register("password")}
          />
        </div>

        <div className="flex items-center gap-2.5">
          <Checkbox
            id="rememberMe"
            checked={rememberMe}
            onCheckedChange={(val) => setValue("rememberMe", val as boolean)}
            className="rounded"
          />
          <Label htmlFor="rememberMe" className="text-sm text-muted-foreground font-normal cursor-pointer">
            Remember me for 30 days
          </Label>
        </div>

        <Button
          type="submit"
          className="w-full h-11 rounded-xl gap-2 text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 btn-glow transition-all active:scale-[0.98]"
          loading={isSubmitting}
        >
          {!isSubmitting && (
            <>
              Sign in
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border/50" />
        </div>
        <div className="relative flex justify-center text-xs text-muted-foreground">
          <span className="bg-background px-3">or</span>
        </div>
      </div>

      {/* Sign up link */}
      <p className="text-center text-sm text-muted-foreground">
        New to CSE Ground?{" "}
        <Link to="/auth/register" className="text-primary font-semibold hover:underline underline-offset-4">
          Create your free account
        </Link>
      </p>

      {/* Dev quick-login */}
      {import.meta.env.DEV && (
        <div className="mt-4 p-4 rounded-xl border border-dashed border-border bg-muted/30">
          <p className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-1.5">
            <GraduationCap className="h-3.5 w-3.5" />
            Dev Quick Login
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Super Admin", email: "bathulasaikiran2k2@gmail.com", password: "bathulasaikiran2k2", color: "bg-red-500/10 text-red-600 hover:bg-red-500/20" },
              { label: "Manager", email: "manager@cse.dev", password: "Manager@123", color: "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20" },
              { label: "Student", email: "student@cse.dev", password: "Student@123", color: "bg-primary/10 text-primary hover:bg-primary/20" },
            ].map(({ label, email, password, color }) => (
              <button
                key={label}
                type="button"
                onClick={() => { setValue("email", email); setValue("password", password); }}
                className={`text-xs px-3 py-1.5 rounded-lg ${color} transition-colors font-medium`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
