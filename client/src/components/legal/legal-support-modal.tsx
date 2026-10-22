import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ShieldCheck, HelpCircle, FileText, Phone, Mail, MapPin, CheckCircle2 } from "lucide-react";

export type LegalTab = "help" | "privacy" | "terms";

interface LegalSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: LegalTab;
}

export default function LegalSupportModal({
  isOpen,
  onClose,
  initialTab = "help",
}: LegalSupportModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] p-0 overflow-hidden flex flex-col">
        <DialogHeader className="p-6 pb-2 border-b">
          <DialogTitle className="text-xl font-bold text-gray-900">
            ROOTED Information & Support
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-500">
            South African Small-Scale Agricultural Platform Resources
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue={initialTab} className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6 pt-3 border-b bg-gray-50">
            <TabsList className="grid grid-cols-3 w-full bg-gray-200/80">
              <TabsTrigger value="help" className="flex items-center gap-1.5 text-xs font-semibold">
                <HelpCircle className="h-3.5 w-3.5" />
                Help Center
              </TabsTrigger>
              <TabsTrigger value="privacy" className="flex items-center gap-1.5 text-xs font-semibold">
                <ShieldCheck className="h-3.5 w-3.5" />
                POPIA Privacy Policy
              </TabsTrigger>
              <TabsTrigger value="terms" className="flex items-center gap-1.5 text-xs font-semibold">
                <FileText className="h-3.5 w-3.5" />
                Terms of Service
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1 p-6 text-sm text-gray-700 leading-relaxed overflow-y-auto max-h-[55vh]">
            {/* 1. HELP CENTER */}
            <TabsContent value="help" className="mt-0 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-rooted-primary" />
                  Frequently Asked Questions (FAQ)
                </h3>
                <p className="text-xs text-gray-500 mb-4">
                  Everything you need to know about trading, buying, and sharing surplus harvest on ROOTED.
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-900 text-sm mb-1">
                    How do I sell my produce as a small-scale farmer?
                  </h4>
                  <p className="text-xs text-gray-600">
                    Sign in to your Farmer Dashboard, click <strong>"Add New Crop"</strong>, specify your harvest crop name, available quantity in kilograms (kg), price in South African Rand (R/kg), and expected harvest date. It will instantly be listed on the public Buyer Marketplace.
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-900 text-sm mb-1">
                    How does produce purchasing and delivery work?
                  </h4>
                  <p className="text-xs text-gray-600">
                    Buyers can browse active listings on the Marketplace, filter by province or price, and click <strong>"Contact Seller"</strong> to coordinate direct collection at the farm gate or arrange regional courier/transport. Payments are handled transparently via direct EFT or agreed cash-on-delivery between buyer and farmer.
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-900 text-sm mb-1">
                    How does the Community Surplus Donation scheme work?
                  </h4>
                  <p className="text-xs text-gray-600">
                    Farmers with extra yield can check <strong>"Designate for donation (Surplus crop)"</strong> when listing, or click <strong>"Donate Surplus"</strong> on their dashboard. These crops appear on the Community Impact Dashboard, where registered feeding schemes, schools, and charities (e.g. Gift of the Givers) can request them for free distribution.
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-900 text-sm mb-1">
                    Which South African provinces are currently supported?
                  </h4>
                  <p className="text-xs text-gray-600">
                    ROOTED supports farmers across all 9 provinces, with active farming hubs in the Western Cape, Limpopo, KwaZulu-Natal, Free State, and Gauteng.
                  </p>
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-2">
                <h4 className="font-bold text-emerald-950 text-sm flex items-center gap-2">
                  <Phone className="h-4 w-4 text-emerald-700" />
                  Need Direct Assistance?
                </h4>
                <p className="text-xs text-emerald-800">
                  Our South African farmer support team is available Monday to Friday from 08:00 to 17:00:
                </p>
                <div className="grid sm:grid-cols-2 gap-2 text-xs pt-1">
                  <div className="flex items-center gap-2 text-emerald-900">
                    <Mail className="h-3.5 w-3.5 text-emerald-700" />
                    <span>support@rooted.co.za</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-900">
                    <Phone className="h-3.5 w-3.5 text-emerald-700" />
                    <span>WhatsApp: +27 (0) 79 123 4567</span>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* 2. POPIA PRIVACY POLICY */}
            <TabsContent value="privacy" className="mt-0 space-y-5">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                  Protection of Personal Information Policy (POPIA)
                </h3>
                <p className="text-xs text-gray-500">
                  Compliant with the Protection of Personal Information Act (Act 4 of 2013) of the Republic of South Africa.
                </p>
              </div>

              <div className="space-y-3.5 text-xs text-gray-600">
                <div className="bg-emerald-50/50 p-3 rounded border border-emerald-100 text-emerald-900">
                  <strong>Responsible Party:</strong> ROOTED Agricultural Platform (Pty) Ltd, operating in South Africa to connect small-scale agricultural producers with buyers and social feeding schemes.
                </div>

                <div>
                  <h4 className="font-bold text-gray-900 text-sm mb-1">1. Information We Collect (Minimality Principle)</h4>
                  <p>In accordance with Section 10 of POPIA, we strictly limit data collection to what is necessary for platform operation:</p>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li><strong>Account Holders:</strong> Full name, email address, password hash, and farm/business location (town/province).</li>
                    <li><strong>We DO NOT collect:</strong> South African National ID numbers, bank pin codes, biometric data, or precise residential coordinates.</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900 text-sm mb-1">2. Purpose of Data Processing</h4>
                  <p>Your personal information is processed exclusively for:</p>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Authenticating access to your Farmer Dashboard or Buyer account.</li>
                    <li>Displaying farm locations to local buyers seeking regional produce.</li>
                    <li>Facilitating food surplus matching with verified feeding programs.</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900 text-sm mb-1">3. Security Safeguards (POPIA Section 19)</h4>
                  <p>
                    All passwords are irreversibly hashed using salted <code>bcrypt</code> encryption. Sessions are managed through secure local cookies. We maintain strict technical safeguards and <strong>never sell, rent, or trade your data to third-party marketing brokers</strong>.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900 text-sm mb-1">4. Your Statutory Rights</h4>
                  <p>Under POPIA Section 23 and 24, you have the right to request access to your records, rectify inaccurate data, or request complete deletion of your profile by emailing our Information Officer at <strong>privacy@rooted.co.za</strong>.</p>
                </div>
              </div>
            </TabsContent>

            {/* 3. TERMS OF SERVICE */}
            <TabsContent value="terms" className="mt-0 space-y-5">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-rooted-primary" />
                  Terms of Service
                </h3>
                <p className="text-xs text-gray-500">
                  Last updated: October 2026 • Governed by the laws of the Republic of South Africa.
                </p>
              </div>

              <div className="space-y-3.5 text-xs text-gray-600">
                <div>
                  <h4 className="font-bold text-gray-900 text-sm mb-1">1. Platform Scope & Purpose</h4>
                  <p>
                    ROOTED is an agricultural empowerment platform designed to bridge smallholder farmers, commercial buyers, and humanitarian feeding initiatives across South Africa.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900 text-sm mb-1">2. Seller Responsibilities & Produce Quality</h4>
                  <p>
                    Farmers agree to list honest harvest schedules, accurate weights in kilograms (kg), and prices in South African Rand (ZAR). All produce listed must comply with South African agricultural health and food safety standards.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900 text-sm mb-1">3. Surplus Donations</h4>
                  <p>
                    Surplus crops designated for donation must be safe for human consumption and fit for community kitchen preparation. Beneficiary organizations agree to distribute donated produce free of charge to vulnerable community members.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900 text-sm mb-1">4. Transactions & Payments</h4>
                  <p>
                    ROOTED provides the digital discovery and communication layer. Commercial payment terms, inspections, and transport logistics are mutually agreed upon by the transacting farmer and buyer.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900 text-sm mb-1">5. Governing Law</h4>
                  <p>
                    These terms are governed by and construed in accordance with South African law. Any disputes shall be subject to the jurisdiction of the South African courts.
                  </p>
                </div>
              </div>
            </TabsContent>
          </ScrollArea>

          <div className="p-4 border-t bg-gray-50 flex justify-end">
            <Button onClick={onClose} className="bg-rooted-primary hover:bg-rooted-secondary text-white text-xs px-5">
              Close
            </Button>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
