import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Label } from "@/shared/components/ui/label";
import { authService } from "@/shared/services/auth.service";
import { useAuthStore } from "@/shared/store/authStore";

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

  const from = (location.state as { from?: { pathname: string } })?.from
    ?.pathname;

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
      const response = await authService.login({
        email: data.email,
        password: data.password,
      });
      const { user, accessToken, refreshToken } = response.data.data;
      login(user, { accessToken, refreshToken });
      const redirectPath =
        from ||
        (user?.role === "Admin" || user?.role === "admin"
          ? "/administrator"
          : "/dashboard");
      navigate(redirectPath, { replace: true });
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(
        axiosError?.response?.data?.message ||
          "Invalid email or password. Please try again.",
      );
    }
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          Welcome back
        </CardTitle>
        <CardDescription className="text-center">
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="space-y-4"
        >
          {error && (
            <div
              role="alert"
              className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm"
            >
              {error}
            </div>
          )}

          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            leftIcon={<Mail className="h-4 w-4" />}
            autoComplete="email"
            error={errors.email?.message}
            {...register("email")}
          />

          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            leftIcon={<Lock className="h-4 w-4" />}
            autoComplete="current-password"
            error={errors.password?.message}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            }
            {...register("password")}
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                id="rememberMe"
                checked={rememberMe}
                onCheckedChange={(val) =>
                  setValue("rememberMe", val as boolean)
                }
              />
              <Label
                htmlFor="rememberMe"
                className="text-sm font-normal cursor-pointer"
              >
                Remember me
              </Label>
            </div>
            <Link
              to="/auth/forgot-password"
              className="text-sm text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <Button type="submit" className="w-full" loading={isSubmitting}>
            Sign in
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link
            to="/auth/register"
            className="text-primary font-medium hover:underline"
          >
            Create one
          </Link>
        </div>

        {/* Dev-mode credentials hint */}
        {import.meta.env.DEV && (
          <div className="mt-5 p-3 rounded-lg border border-dashed border-border bg-muted/30">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Dev Quick Login
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setValue("email", "admin@cse.dev");
                  setValue("password", "Admin@123");
                }}
                className="text-xs px-2.5 py-1 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => {
                  setValue("email", "student@cse.dev");
                  setValue("password", "Student@123");
                }}
                className="text-xs px-2.5 py-1 rounded bg-secondary/10 text-secondary hover:bg-secondary/20 transition-colors font-medium"
              >
                Student
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground/70 mt-2">
              Admin panel is accessible at{" "}
              <code className="font-mono">/dashboard/admin</code> for admin
              accounts
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
