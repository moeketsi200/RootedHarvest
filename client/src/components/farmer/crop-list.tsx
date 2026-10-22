import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingBag } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface CropListProps {
  farmerId: string;
}

export default function CropList({ farmerId }: CropListProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: crops, isLoading } = useQuery({
    queryKey: ["/api/crops", farmerId],
  });

  const toggleDonationMutation = useMutation({
    mutationFn: async ({ cropId, donationFlag }: { cropId: string; donationFlag: boolean }) => {
      const res = await apiRequest("PATCH", `/api/crops/${cropId}`, { donationFlag });
      return res.json();
    },
    onSuccess: (_, { donationFlag }) => {
      toast({
        title: donationFlag ? "Marked for Donation 💜" : "Marked for Sale 🛒",
        description: donationFlag
          ? "This crop is now available for local community surplus sharing."
          : "This crop is now listed for sale on the Buyer Marketplace.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/crops", farmerId] });
      queryClient.invalidateQueries({ queryKey: ["/api/crops/marketplace"] });
      queryClient.invalidateQueries({ queryKey: ["/api/donations"] });
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Current Crops</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-100 animate-pulse rounded-lg h-16"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">Current Crops</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {!crops || !Array.isArray(crops) || crops.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No crops added yet. Add your first crop to get started!</p>
          ) : (
            crops.map((crop: any) => (
              <div key={crop.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h5 className="font-semibold text-gray-900">{crop.cropName}</h5>
                    <p className="text-sm text-gray-600">
                      {crop.quantity} kg • R{crop.price}/kg • Harvest: {new Date(crop.harvestDate).toLocaleDateString("en-ZA")}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge
                      className={
                        crop.donationFlag
                          ? "bg-purple-100 text-purple-800 font-medium"
                          : "bg-green-100 text-green-800 font-medium"
                      }
                    >
                      {crop.donationFlag ? "For Donation (Surplus)" : "For Commercial Sale"}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        toggleDonationMutation.mutate({
                          cropId: crop.id,
                          donationFlag: !crop.donationFlag,
                        })
                      }
                      disabled={toggleDonationMutation.isPending}
                      className={`text-xs h-8 ${
                        crop.donationFlag
                          ? "text-gray-700 hover:bg-gray-100"
                          : "text-purple-700 border-purple-200 hover:bg-purple-50 hover:text-purple-800"
                      }`}
                    >
                      {crop.donationFlag ? (
                        <>
                          <ShoppingBag className="mr-1.5 h-3.5 w-3.5" />
                          Switch to Sale
                        </>
                      ) : (
                        <>
                          <Heart className="mr-1.5 h-3.5 w-3.5 text-purple-600" />
                          Donate Surplus
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
