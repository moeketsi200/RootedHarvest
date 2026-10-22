import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Sprout, ShoppingCart, Sparkles, ShieldCheck } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  userType: 'farmer' | 'buyer';
}

export default function LoginModal({ isOpen, onClose, userType }: LoginModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [popiaConsent, setPopiaConsent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSignUp && !popiaConsent) {
      toast({
        title: "POPIA Consent Required",
        description: "Please check the box to consent to data processing under POPIA before creating your account.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      if (isSignUp) {
        await register({
          email,
          password,
          name,
          location: location || undefined,
          userType,
        });

        toast({
          title: "Account created successfully! 🇿🇦",
          description: `Welcome to ROOTED, ${name}! Please verify your email to unlock your dashboard.`,
        });

        onClose();
        // Redirect directly to verification page - no dashboard access allowed yet!
        setTimeout(() => {
          window.location.href = '/verify-email';
        }, 400);
        return;
      } else {
        const loggedInUser = await login({ email, password });

        // If email is not verified, block dashboard access and redirect to verify email
        if (!loggedInUser.emailVerified) {
          toast({
            title: "Email verification required 🔒",
            description: "Your account is unverified. Please confirm your email to access the dashboard.",
          });

          onClose();
          setTimeout(() => {
            window.location.href = '/verify-email';
          }, 400);
          return;
        }

        toast({
          title: "Logged in successfully!",
          description: "Welcome back!",
        });

        onClose();

        // Redirect to appropriate dashboard for verified users
        setTimeout(() => {
          if (userType === 'farmer') {
            window.location.href = '/farmer-dashboard';
          } else {
            window.location.href = '/buyer-marketplace';
          }
        }, 500);
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      let errorMessage = "Please check your credentials and try again.";
      
      if (error?.message) {
        const cleanMsg = error.message.replace(/^\d+:\s*/, "");
        try {
          const parsed = JSON.parse(cleanMsg);
          errorMessage = parsed.message || cleanMsg;
        } catch {
          errorMessage = cleanMsg;
        }
      }
      
      toast({
        title: isSignUp ? "Sign up failed" : "Login failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoFill = (verified: boolean = true) => {
    if (!verified) {
      setEmail("unverified@rooted.org");
      setPassword("password123");
      return;
    }
    if (userType === 'farmer') {
      setEmail("farmer@rooted.org");
      setPassword("password123");
    } else {
      setEmail("buyer@rooted.org");
      setPassword("password123");
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setName("");
    setLocation("");
    setPopiaConsent(false);
  };

  const handleToggleMode = () => {
    setIsSignUp(!isSignUp);
    resetForm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
            {userType === 'farmer' ? (
              <Sprout className="h-5 w-5 text-rooted-primary" />
            ) : (
              <ShoppingCart className="h-5 w-5 text-rooted-primary" />
            )}
            {isSignUp ? 'Sign Up' : 'Login'} as {userType === 'farmer' ? 'Farmer' : 'Buyer'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Demo account quick fill button */}
          {!isSignUp && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2 flex items-center justify-between text-xs text-emerald-900">
              <span className="flex items-center gap-1.5 font-medium">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                Quick demo access:
              </span>
              <button
                type="button"
                onClick={() => handleQuickDemoFill(true)}
                className="bg-white border border-emerald-300 hover:bg-emerald-100/60 px-2 py-0.5 rounded text-emerald-950 font-semibold text-[11px] transition-colors"
              >
                Auto-fill demo {userType}
              </button>
            </div>
          )}

          {isSignUp && (
            <>
              <div className="space-y-1">
                <Label htmlFor="name" className="text-xs font-semibold">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="e.g. Sipho Ndlovu"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="location" className="text-xs font-semibold">Farm / Business Location</Label>
                <Input
                  id="location"
                  type="text"
                  placeholder="e.g. Stellenbosch, Western Cape"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
              </div>
            </>
          )}
          
          <div className="space-y-1">
            <Label htmlFor="email" className="text-xs font-semibold">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder={userType === 'farmer' ? 'farmer@rooted.org' : 'buyer@rooted.org'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="password" className="text-xs font-semibold">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* POPIA Privacy and Consent Section */}
          {isSignUp && (
            <div className="bg-emerald-50/70 border border-emerald-200/90 rounded-lg p-3 space-y-2 mt-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-950">
                <ShieldCheck className="h-4 w-4 text-emerald-700 shrink-0" />
                POPIA Data Protection Notice
              </div>
              <p className="text-[11px] text-gray-600 leading-snug">
                ROOTED complies with South Africa's <strong>Protection of Personal Information Act (Act 4 of 2013)</strong>. We collect only minimal details necessary for agricultural trade and never share your data with third parties.
              </p>
              <div className="flex items-start space-x-2 pt-1 border-t border-emerald-200/60">
                <Checkbox
                  id="popia"
                  checked={popiaConsent}
                  onCheckedChange={(checked) => setPopiaConsent(checked === true)}
                  className="mt-0.5 data-[state=checked]:bg-rooted-primary data-[state=checked]:border-rooted-primary"
                />
                <label 
                  htmlFor="popia" 
                  className="text-xs text-gray-800 leading-snug cursor-pointer select-none font-medium"
                >
                  I consent to the processing of my personal information under <span className="underline">POPIA</span>.
                </label>
              </div>
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-rooted-primary hover:bg-rooted-secondary text-white font-medium shadow mt-2"
            disabled={isLoading || (isSignUp && !popiaConsent)}
          >
            {isLoading ? 'Processing...' : (isSignUp ? 'Create POPIA-Compliant Account' : 'Login')}
          </Button>

          <div className="text-center pt-1">
            <Button
              type="button"
              variant="link"
              onClick={handleToggleMode}
              className="text-rooted-primary text-sm font-medium hover:underline"
            >
              {isSignUp 
                ? 'Already have an account? Login' 
                : "Don't have an account? Sign up"
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
