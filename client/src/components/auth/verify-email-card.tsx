import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { 
  ShieldCheck, 
  Mail, 
  ArrowRight, 
  RotateCw, 
  CheckCircle2, 
  Lock, 
  LogOut,
  AlertCircle
} from "lucide-react";
import { useLocation } from "wouter";

interface VerifyEmailCardProps {
  onSuccess?: () => void;
  fullPage?: boolean;
}

export default function VerifyEmailCard({ onSuccess, fullPage = false }: VerifyEmailCardProps) {
  const { userProfile, currentUser, verifyEmail, resendVerification, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const userEmail = userProfile?.email || currentUser?.email || "your email";
  const userRole = userProfile?.userType || currentUser?.userType || "user";

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!code || code.trim().length === 0) {
      toast({
        title: "Code required",
        description: "Please enter the 6-digit verification code.",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);
    try {
      const updatedUser = await verifyEmail(code.trim(), userEmail);
      setIsSuccess(true);
      toast({
        title: "Email verified successfully! 🇿🇦",
        description: "Your account is now verified. Full dashboard access unlocked!",
      });

      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        } else {
          if (updatedUser.userType === "farmer" || userRole === "farmer") {
            setLocation("/farmer-dashboard");
            window.location.href = "/farmer-dashboard";
          } else {
            setLocation("/buyer-marketplace");
            window.location.href = "/buyer-marketplace";
          }
        }
      }, 1500);
    } catch (err: any) {
      console.error("Verification failed:", err);
      let errMsg = "Invalid verification code. Please try again or request a new one.";
      if (err?.message) {
        const cleanMsg = err.message.replace(/^\d+:\s*/, "");
        try {
          errMsg = JSON.parse(cleanMsg).message || cleanMsg;
        } catch {
          errMsg = cleanMsg;
        }
      }
      toast({
        title: "Verification failed",
        description: errMsg,
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setIsResending(true);
    try {
      await resendVerification(userEmail);
      setResendCooldown(30);
      toast({
        title: "Verification email sent! 📬",
        description: `A fresh 6-digit verification code has been sent to ${userEmail}. Please check your inbox.`,
      });
    } catch (err: any) {
      toast({
        title: "Could not send email",
        description: "Please check your internet connection or email configuration.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  if (isSuccess) {
    return (
      <Card className="w-full max-w-lg mx-auto border-emerald-200 shadow-xl bg-white text-center p-8">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Verified Successfully!</h2>
        <p className="text-sm text-gray-600 mb-6">
          Welcome to the ROOTED community. Your identity is verified under South African POPIA standards.
        </p>
        <div className="flex items-center justify-center space-x-2 text-emerald-700 font-medium">
          <RotateCw className="w-4 h-4 animate-spin" />
          <span>Unlocking your {userRole === 'farmer' ? 'Farmer Dashboard' : 'Marketplace'}...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-lg mx-auto border-gray-200 shadow-xl bg-white overflow-hidden">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-green-700 p-6 text-white text-center relative">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 backdrop-blur rounded-full mb-3 ring-4 ring-white/10">
          <Lock className="w-6 h-6 text-white" />
        </div>
        <div className="inline-block px-3 py-1 bg-emerald-900/40 text-emerald-100 rounded-full text-xs font-semibold uppercase tracking-wider mb-2 border border-emerald-400/30">
          Access Restricted • POPIA Security
        </div>
        <CardTitle className="text-2xl font-bold text-white tracking-tight">
          Verify Your Email
        </CardTitle>
        <CardDescription className="text-emerald-100 text-xs mt-1.5 max-w-sm mx-auto">
          Please verify your email address to unlock the ROOTED {userRole === 'farmer' ? 'Farmer Dashboard' : 'Marketplace'}.
        </CardDescription>
      </div>

      <CardContent className="p-6 sm:p-8 space-y-6">
        {/* Verification Status Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start space-x-3 text-xs text-amber-900">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-amber-950 mb-0.5">Verification Code Sent</div>
            <p className="text-amber-800 leading-relaxed">
              We sent a real verification email with a 6-digit confirmation code to <span className="font-bold underline">{userEmail}</span>. Please check your inbox (and spam/junk folder) and enter the code below.
            </p>
          </div>
        </div>

        {/* Verification Code Form */}
        <form onSubmit={handleVerify} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
              Enter 6-Digit Code
            </label>
            <div className="relative">
              <Input
                type="text"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="000000"
                className="text-center font-mono text-2xl tracking-[0.5em] h-14 border-gray-300 focus:border-rooted-primary focus:ring-rooted-primary bg-gray-50/50"
                autoFocus
              />
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
            <p className="text-[11px] text-gray-500 text-center">
              Enter the 6-digit code received in your email inbox to verify your identity.
            </p>
          </div>

          <Button
            type="submit"
            disabled={isVerifying || code.trim().length === 0}
            className="w-full bg-rooted-primary hover:bg-rooted-secondary text-white font-semibold py-6 text-base shadow-md transition-all flex items-center justify-center space-x-2"
          >
            {isVerifying ? (
              <>
                <RotateCw className="w-5 h-5 animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <span>Verify Email & Access Dashboard</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </Button>
        </form>

        {/* Resend & Logout Footer */}
        <div className="pt-2 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <button
            type="button"
            onClick={handleResend}
            disabled={resendCooldown > 0 || isResending}
            className="text-rooted-primary hover:text-rooted-secondary font-semibold disabled:text-gray-400 flex items-center space-x-1"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
            <span>
              {resendCooldown > 0 
                ? `Resend code in ${resendCooldown}s` 
                : "Didn't receive email? Resend code"}
            </span>
          </button>

          <button
            type="button"
            onClick={() => logout()}
            className="text-gray-500 hover:text-red-600 font-medium flex items-center space-x-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign out / Change account</span>
          </button>
        </div>

        {/* POPIA Compliance Badge */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-500 pt-1">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Protection of Personal Information Act (POPIA Act 4 of 2013)</span>
        </div>
      </CardContent>
    </Card>
  );
}
