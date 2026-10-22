import { Card, CardContent } from "@/components/ui/card";
import { 
  Home, 
  Users, 
  Heart, 
  PlusCircle, 
  Sprout, 
  ArrowRight, 
  ShieldCheck, 
  Award, 
  Truck, 
  Lock, 
  Sparkles,
  HelpCircle,
  Building2,
  Calendar,
  CheckCircle2,
  LogIn
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DonationRequest from "@/components/donation/donation-request";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { useAuth } from "@/contexts/auth-context";
import LoginModal from "@/components/auth/login-modal";

export default function DonationPanel() {
  const { currentUser, userProfile } = useAuth();
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginModalType, setLoginModalType] = useState<'farmer' | 'buyer'>('farmer');
  
  const [communityName, setCommunityName] = useState("");
  const [cropId, setCropId] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: donations = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/donations"],
  });

  // Fetch available crops so community can select what they need
  const { data: marketplaceCrops = [] } = useQuery<any[]>({
    queryKey: ["/api/crops/marketplace"],
  });

  const createDonationMutation = useMutation({
    mutationFn: async (data: { cropId: string; communityName: string }) => {
      const res = await apiRequest("POST", "/api/donations", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Donation Request Submitted! 🤝",
        description: "Local farmers have been notified of your community request.",
      });
      setShowRequestDialog(false);
      setCommunityName("");
      setCropId("");
      queryClient.invalidateQueries({ queryKey: ["/api/donations"] });
    },
    onError: () => {
      toast({
        title: "Submission failed",
        description: "Please check your inputs and try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!communityName || !cropId) {
      toast({
        title: "Missing fields",
        description: "Please enter your organization name and select a crop.",
        variant: "destructive",
      });
      return;
    }
    createDonationMutation.mutate({ cropId, communityName });
  };

  const openAuth = (type: 'farmer' | 'buyer') => {
    setLoginModalType(type);
    setShowLoginModal(true);
  };

  const pendingDonations = donations.filter((d: any) => d.status === "pending");
  const acceptedDonations = donations.filter((d: any) => d.status === "accepted");

  // ==========================================
  // VIEW 1: NOT LOGGED IN -> PUBLIC INFO VIEW
  // ==========================================
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 font-inter text-gray-900 flex flex-col">
        <Header />

        {/* Hero Section */}
        <section className="bg-gradient-to-br from-purple-800 via-purple-700 to-indigo-900 text-white py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto text-center space-y-5">
            <span className="inline-flex items-center gap-1.5 bg-white/10 text-purple-200 border border-white/20 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
              🇿🇦 South Africa Surplus Food Sharing Initiative
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              Feeding Communities & Eliminating Farm Food Waste
            </h1>
            <p className="text-base sm:text-lg text-purple-100 max-w-3xl mx-auto font-normal leading-relaxed">
              In South Africa, over 10 million tons of edible food is lost each year while millions face daily hunger. ROOTED connects small-scale farmers with community soup kitchens, schools, and feeding schemes so surplus harvest nourishes families instead of ending up in landfills.
            </p>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
              <Button
                onClick={() => openAuth('farmer')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-6 text-sm shadow-lg hover:shadow-xl transition-all"
              >
                <Sprout className="w-4 h-4 mr-2" />
                Farmers: Donate Harvest Surplus
              </Button>
              <Button
                onClick={() => openAuth('buyer')}
                variant="outline"
                className="bg-white/10 hover:bg-white/20 text-white border-white/30 font-semibold px-6 py-6 text-sm backdrop-blur"
              >
                <Building2 className="w-4 h-4 mr-2" />
                Charities & NPOs: Request Produce
              </Button>
            </div>
          </div>
        </section>

        {/* Live Community Impact Numbers */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 w-full z-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="bg-white border-purple-100 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <p className="text-3xl sm:text-4xl font-extrabold text-purple-700">2,847 kg</p>
                <p className="text-sm font-semibold text-gray-800 mt-1">Produce Donated This Month</p>
                <p className="text-xs text-gray-500 mt-0.5">Fresh organic vegetables & legumes</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-green-100 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <p className="text-3xl sm:text-4xl font-extrabold text-green-700">8</p>
                <p className="text-sm font-semibold text-gray-800 mt-1">Communities Reached</p>
                <p className="text-xs text-gray-500 mt-0.5">Khayelitsha, Mitchells Plain, Paarl & more</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-indigo-100 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <p className="text-3xl sm:text-4xl font-extrabold text-indigo-700">156</p>
                <p className="text-sm font-semibold text-gray-800 mt-1">Families Supported</p>
                <p className="text-xs text-gray-500 mt-0.5">Through registered NPOs and feeding kitchens</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-purple-700 text-xs font-bold uppercase tracking-wider">Simple & Transparent Process</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
              How the ROOTED Surplus Sharing Model Operates
            </h2>
            <p className="text-sm text-gray-600 mt-2">
              We make it effortless for producers to share excess food and for registered social initiatives to claim fresh produce.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:border-purple-300 transition-all text-center">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                1
              </div>
              <h3 className="font-bold text-gray-900 text-base mb-2">Farmer Flags Surplus</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                When harvest yields exceed market orders, farmers simply click <strong>"Donate Surplus"</strong> in their dashboard. No edible food goes to waste.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:border-purple-300 transition-all text-center">
              <div className="w-12 h-12 rounded-xl bg-green-100 text-green-700 flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                2
              </div>
              <h3 className="font-bold text-gray-900 text-base mb-2">NPO Community Matching</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Registered feeding schemes, public schools, and care homes review available produce and submit delivery or pickup requests in real time.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:border-purple-300 transition-all text-center">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                3
              </div>
              <h3 className="font-bold text-gray-900 text-base mb-2">Direct Local Delivery</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Produce is collected or delivered locally. Farmers receive Section 18A donation records, and vulnerable households receive wholesome nutrition.
              </p>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="bg-purple-50/70 border-y border-purple-100 py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Why Donate with ROOTED?</h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-2">
                Providing verified environmental, social, and economic benefits to South African farmers and charities.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex items-start space-x-3 bg-white p-5 rounded-xl border border-purple-100">
                <Award className="w-6 h-6 text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-gray-900">Section 18A Tax Certificates</h4>
                  <p className="text-xs text-gray-600 mt-1">
                    Qualifying donations to registered public benefit organizations (PBOs) earn certified tax deductions under SARS regulations.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 bg-white p-5 rounded-xl border border-purple-100">
                <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-gray-900">POPIA Compliant Transparency</h4>
                  <p className="text-xs text-gray-600 mt-1">
                    All recipient organizations are verified under South African law to guarantee produce goes directly to hungry families.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 bg-white p-5 rounded-xl border border-purple-100">
                <Truck className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-gray-900">Coordinated Local Logistics</h4>
                  <p className="text-xs text-gray-600 mt-1">
                    Our platform streamlines pickup schedules and cold-chain distribution to minimize transportation costs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call-to-action Banner to Log In */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
          <div className="bg-gradient-to-r from-emerald-800 to-rooted-primary rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-3 max-w-xl">
              <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold">
                <Lock className="w-3.5 h-3.5" />
                Interactive Dashboard Requires Login
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Ready to Donate or Request Fresh Food?
              </h2>
              <p className="text-emerald-100 text-xs sm:text-sm leading-relaxed">
                Log in to your ROOTED account to submit community food requests, manage surplus crops, or view live delivery statuses.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Button
                onClick={() => openAuth('farmer')}
                className="bg-white text-emerald-900 hover:bg-emerald-50 font-bold px-6 py-5 text-sm shadow"
              >
                <LogIn className="w-4 h-4 mr-2 text-emerald-700" />
                Farmer Login
              </Button>
              <Button
                onClick={() => openAuth('buyer')}
                variant="outline"
                className="bg-emerald-950/40 text-white hover:bg-emerald-950/60 border-emerald-400/40 font-bold px-6 py-5 text-sm"
              >
                <Building2 className="w-4 h-4 mr-2" />
                Community / Buyer Login
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-auto py-8 border-t border-gray-200 text-center text-xs text-gray-500">
          ROOTED South Africa • Community Surplus Sharing Program • In partnership with local NPOs & Feeding Schemes
        </footer>

        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          userType={loginModalType}
        />
      </div>
    );
  }

  // ===============================================
  // VIEW 2: LOGGED IN -> INTERACTIVE DASHBOARD VIEW
  // ===============================================
  return (
    <div className="min-h-screen bg-rooted-bg font-inter text-gray-900 flex flex-col">
      <Header />

      {/* Hero Header */}
      <div className="bg-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-purple-800/80 text-purple-200 text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  South Africa Community Surplus Dashboard
                </span>
                <span className="bg-green-600/80 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                  Logged in as {userProfile?.name} ({userProfile?.userType})
                </span>
              </div>
              <h2 className="text-3xl font-bold mt-2">Community Impact Dashboard</h2>
              <p className="text-purple-200 text-sm mt-1">
                Connecting small-scale South African farmers' surplus produce with community feeding schemes, schools, and shelters.
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right border-r border-purple-500/50 pr-4">
                <p className="text-3xl font-bold">2,847</p>
                <p className="text-purple-200 text-xs">kg donated this month</p>
              </div>

              {/* Action Buttons based on User Role */}
              {userProfile?.userType === 'farmer' ? (
                <Link href="/farmer-dashboard">
                  <Button className="bg-white text-purple-800 hover:bg-purple-50 font-semibold shadow">
                    <Sprout className="mr-2 h-4 w-4 text-purple-700" />
                    Donate from My Crops
                  </Button>
                </Link>
              ) : (
                <Button
                  onClick={() => setShowRequestDialog(true)}
                  className="bg-white text-purple-800 hover:bg-purple-50 font-semibold shadow"
                >
                  <PlusCircle className="mr-2 h-4 w-4 text-purple-700" />
                  Request Food for Community
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* How It Works Notice Box */}
        <div className="bg-gradient-to-r from-purple-50 to-green-50 border border-purple-200/80 rounded-xl p-5 mb-8 shadow-sm">
          <h4 className="font-bold text-gray-900 flex items-center gap-2 mb-2">
            <Heart className="h-5 w-5 text-purple-600" />
            Active Surplus Sharing Workflow
          </h4>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</div>
              <div>
                <p className="font-semibold text-gray-900">Farmers Flag Surplus Produce</p>
                <p className="text-xs text-gray-600">
                  Farmers can toggle any harvest to <strong>"For Donation"</strong> in their Farmer Dashboard with 1 click instead of letting surplus go to waste.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</div>
              <div>
                <p className="font-semibold text-gray-900">Communities Claim & Receive</p>
                <p className="text-xs text-gray-600">
                  NGOs, soup kitchens, and local schools request or accept produce for collection or local delivery.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Impact Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-purple-50 border-purple-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-purple-700">8</p>
                  <p className="text-gray-600 text-sm">Communities Reached</p>
                </div>
                <Home className="text-purple-600 text-2xl" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-green-700">156</p>
                  <p className="text-gray-600 text-sm">Families Supported</p>
                </div>
                <Users className="text-green-600 text-2xl" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-blue-700">{pendingDonations.length}</p>
                  <p className="text-gray-600 text-sm">Active Requests</p>
                </div>
                <Heart className="text-blue-600 text-2xl" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Donation Requests List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Heart className="h-5 w-5 text-purple-600" />
              Live Community Donation Requests
            </h3>
            <span className="text-xs text-gray-500">
              {pendingDonations.length} pending • {acceptedDonations.length} fulfilled
            </span>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="bg-gray-100 animate-pulse rounded-xl h-24"></div>
              ))}
            </div>
          ) : donations.length === 0 ? (
            <Card className="bg-gray-50 border-dashed border-2">
              <CardContent className="p-10 text-center space-y-3">
                <Heart className="mx-auto h-10 w-10 text-purple-400" />
                <p className="font-semibold text-gray-700">No active community requests right now.</p>
                <p className="text-sm text-gray-500 max-w-md mx-auto">
                  Are you an NGO, soup kitchen, or school in need of fresh vegetables? Submit a request below.
                </p>
                <Button onClick={() => setShowRequestDialog(true)} className="bg-purple-700 hover:bg-purple-800 text-white mt-2">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Request Fresh Produce
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {donations.map((donation: any) => (
                <DonationRequest key={donation.id} donation={donation} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Dialog: Request Produce for Community */}
      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Heart className="h-5 w-5 text-purple-600" />
              Request Fresh Produce for Your Community
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              Connecting local South African charities and feeding schemes with surplus harvest.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitRequest} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="orgName">Organization / Community Name</Label>
              <Input
                id="orgName"
                placeholder="e.g. Khayelitsha Youth Soup Kitchen"
                value={communityName}
                onChange={(e) => setCommunityName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cropSelect">Select Desired Crop from Local Producers</Label>
              <select
                id="cropSelect"
                value={cropId}
                onChange={(e) => setCropId(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-md p-2 text-sm bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
              >
                <option value="">-- Choose a local crop --</option>
                {marketplaceCrops.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.cropName} ({c.quantity} kg available - {c.location})
                  </option>
                ))}
              </select>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setShowRequestDialog(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createDonationMutation.isPending}
                className="bg-purple-700 hover:bg-purple-800 text-white font-medium"
              >
                {createDonationMutation.isPending ? "Submitting..." : "Submit Community Request"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
