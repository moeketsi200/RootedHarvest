import Header from "@/components/layout/header";
import VerifyEmailCard from "@/components/auth/verify-email-card";
import { useAuth } from "@/contexts/auth-context";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

export default function VerifyEmailPage() {
  const { currentUser, userProfile } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col justify-center items-center px-4 py-12">
        <div className="w-full max-w-lg mb-4 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-rooted-primary">
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Back to Home
            </Button>
          </Link>
          {currentUser && userProfile?.emailVerified && (
            <span className="inline-flex items-center text-xs font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              Already Verified
            </span>
          )}
        </div>

        <VerifyEmailCard fullPage />
      </main>

      <footer className="py-6 border-t border-gray-200 text-center text-xs text-gray-500">
        ROOTED South Africa • POPIA Compliant Agricultural Network • Secure Authentication
      </footer>
    </div>
  );
}
