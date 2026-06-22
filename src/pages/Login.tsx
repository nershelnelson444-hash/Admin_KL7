import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowRight, Bike } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(4, "Password must be at least 4 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "nershel@kl7garage.in", password: "" },
  });

  if (isAuthenticated) {
    const from = (location.state as { from?: string } | null)?.from ?? "/";
    return <Navigate to={from} replace />;
  }

  const onSubmit = async (values: LoginForm) => {
    try {
      await login(values);
      toast.success("Welcome back to KL7 Garage");
      navigate((location.state as { from?: string } | null)?.from ?? "/", { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't sign you in.");
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      {/* brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-ink p-10 text-white lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime font-display text-base font-bold text-lime-ink">
            K7
          </div>
          <span className="font-display text-lg font-bold tracking-tight">KL7 GARAGE</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative max-w-md"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-lime">
            <Bike className="h-3.5 w-3.5" /> Dealer Console
          </div>
          <h1 className="font-display text-4xl font-bold leading-tight tracking-tight">
            Run both showrooms from one cockpit.
          </h1>
          <p className="mt-4 text-white/60">
            Track inventory, leads and listings across Ernakulam and Aluva — built for how KL7 Garage
            actually sells bikes.
          </p>
        </motion.div>

        <div className="relative flex items-center gap-8 text-sm text-white/40">
          <div>
            <div className="font-display text-2xl font-bold text-white">2</div>
            Showrooms
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div>
            <div className="font-display text-2xl font-bold text-white">500+</div>
            Bikes sold
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div>
            <div className="font-display text-2xl font-bold text-white">4.8★</div>
            Customer rating
          </div>
        </div>
      </div>

      {/* form panel */}
      <div className="flex flex-col items-center justify-center bg-canvas px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-sm"
        >
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink font-display text-base font-bold text-lime">
              K7
            </div>
            <span className="font-display text-lg font-bold tracking-tight text-ink">KL7 GARAGE</span>
          </div>

          <h2 className="font-display text-2xl font-bold tracking-tight text-ink">Sign in</h2>
          <p className="mt-1 text-sm text-muted">Welcome back. Enter your details to access the console.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@kl7garage.in" {...register("email")} />
              {errors.email && <p className="mt-1.5 text-xs text-danger">{errors.email.message}</p>}
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <Label htmlFor="password" className="mb-0">Password</Label>
                <button type="button" className="text-xs font-medium text-ink/60 hover:text-ink">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1.5 text-xs text-danger">{errors.password.message}</p>}
            </div>

            <Button type="submit" variant="accent" size="lg" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign in"}
              {!isSubmitting && <ArrowRight className="h-4 w-4" />}
            </Button>

            <p className="text-center text-xs text-muted">
              Demo build — any password (4+ characters) signs you in as Owner.
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
