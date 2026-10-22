import { Bell, X, Check, AlertCircle, Heart, ShoppingCart, Send, MapPin, Calendar, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface Notification {
  id: string;
  type: 'crop_update' | 'donation_request' | 'purchase_inquiry' | 'weather_alert';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionable?: boolean;
  requester?: string;
  location?: string;
  details?: string;
}

// Mock South African notifications data
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'donation_request',
    title: 'New Donation Request',
    message: 'Khayelitsha Kitchen requested 50 kg of tomatoes',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    read: false,
    actionable: true,
    requester: 'Gift of the Givers Community Kitchen',
    location: 'Khayelitsha, Western Cape',
    details: 'Urgent request for 50 kg of tomatoes to support the weekend community feeding scheme serving 350 vulnerable families.'
  },
  {
    id: '2',
    type: 'purchase_inquiry',
    title: 'Purchase Inquiry',
    message: 'Cape Fresh Market is interested in your bell peppers',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    read: false,
    actionable: true,
    requester: 'Cape Fresh Market (Greenmarket Square)',
    location: 'Cape Town, Western Cape',
    details: 'Looking to purchase 100 kg of crisp bell peppers at R32/kg for delivery by Friday morning.'
  },
  {
    id: '3',
    type: 'weather_alert',
    title: 'Weather Alert',
    message: 'Heavy rain expected in Western Cape tomorrow - protect outdoor crops',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: true,
    location: 'Western Cape',
    details: 'Cold front moving through Western Cape bringing 25mm of rain and strong gusting winds. Secure shade netting and clear drainage furrows.'
  },
  {
    id: '4',
    type: 'crop_update',
    title: 'Harvest Reminder',
    message: 'Your baby spinach crop is ready for harvest',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    read: true,
    details: 'Estimated 80 kg ready for picking today to ensure optimal crispness and market value.'
  }
];

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [isOpen, setIsOpen] = useState(false);
  const [detailsNotification, setDetailsNotification] = useState<Notification | null>(null);
  const [respondingNotification, setRespondingNotification] = useState<Notification | null>(null);
  const [responseText, setResponseText] = useState("");
  const { toast } = useToast();

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleOpenDetails = (notification: Notification) => {
    markAsRead(notification.id);
    setDetailsNotification(notification);
    setIsOpen(false);
  };

  const handleOpenRespond = (notification: Notification) => {
    markAsRead(notification.id);
    setRespondingNotification(notification);
    setResponseText(
      notification.type === 'donation_request'
        ? "Hi! We'd be happy to donate the requested produce. We can have it ready for collection tomorrow at 10:00."
        : "Hi! Yes, we have this available in inventory and can supply your order. Please let us know your preferred delivery slot."
    );
    setIsOpen(false);
  };

  const handleSendResponse = () => {
    if (!respondingNotification) return;

    toast({
      title: "Response Sent! 📩",
      description: `Your response has been sent to ${respondingNotification.requester || "the requester"}.`,
    });

    // Mark as handled
    setNotifications(prev =>
      prev.map(n => n.id === respondingNotification.id ? { ...n, actionable: false, read: true } : n)
    );

    setRespondingNotification(null);
    setResponseText("");
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'donation_request':
        return <Heart className="h-4 w-4 text-red-500" />;
      case 'purchase_inquiry':
        return <ShoppingCart className="h-4 w-4 text-blue-500" />;
      case 'weather_alert':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'crop_update':
        return <Check className="h-4 w-4 text-green-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="relative p-2">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96 p-0" align="end">
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Notifications</CardTitle>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs text-rooted-primary hover:text-rooted-secondary"
                  >
                    Mark all as read
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-96">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    No notifications
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 hover:bg-gray-50 transition-colors ${
                          !notification.read ? 'bg-green-50/40' : ''
                        }`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <div className="mt-0.5">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm ${!notification.read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                                {notification.title}
                              </p>
                              <p className="text-xs text-gray-600 mt-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {formatTimestamp(notification.timestamp)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {!notification.read && (
                              <div className="w-2 h-2 bg-rooted-primary rounded-full"></div>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                dismissNotification(notification.id);
                              }}
                              className="p-1 h-auto text-gray-400 hover:text-gray-600"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        {notification.actionable && (
                          <div className="mt-3 flex space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-xs h-7 hover:bg-gray-100"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenDetails(notification);
                              }}
                            >
                              View Details
                            </Button>
                            <Button 
                              size="sm" 
                              className="text-xs h-7 bg-rooted-primary hover:bg-rooted-secondary text-white"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenRespond(notification);
                              }}
                            >
                              Respond
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </PopoverContent>
      </Popover>

      {/* 1. View Details Dialog */}
      <Dialog open={!!detailsNotification} onOpenChange={(open) => !open && setDetailsNotification(null)}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              {detailsNotification && getNotificationIcon(detailsNotification.type)}
              <DialogTitle className="text-lg font-bold text-gray-900">
                {detailsNotification?.title}
              </DialogTitle>
            </div>
            <DialogDescription className="text-sm text-gray-500">
              {detailsNotification && formatTimestamp(detailsNotification.timestamp)}
            </DialogDescription>
          </DialogHeader>

          {detailsNotification && (
            <div className="space-y-4 py-2">
              <div className="bg-gray-50 p-3.5 rounded-lg border border-gray-200 space-y-2">
                <p className="text-sm font-semibold text-gray-900">
                  {detailsNotification.message}
                </p>
                {detailsNotification.details && (
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {detailsNotification.details}
                  </p>
                )}
              </div>

              {detailsNotification.requester && (
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-blue-50/50 p-2.5 rounded border border-blue-100">
                    <span className="text-gray-500 block">Requested by:</span>
                    <span className="font-semibold text-gray-800">{detailsNotification.requester}</span>
                  </div>
                  {detailsNotification.location && (
                    <div className="bg-emerald-50/50 p-2.5 rounded border border-emerald-100 flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-emerald-600 shrink-0" />
                      <div>
                        <span className="text-gray-500 block">Location:</span>
                        <span className="font-semibold text-gray-800">{detailsNotification.location}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDetailsNotification(null)}>
              Close
            </Button>
            {detailsNotification?.actionable && (
              <Button
                className="bg-rooted-primary hover:bg-rooted-secondary text-white"
                onClick={() => {
                  const notif = detailsNotification;
                  setDetailsNotification(null);
                  handleOpenRespond(notif);
                }}
              >
                Respond Now
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2. Respond Dialog */}
      <Dialog open={!!respondingNotification} onOpenChange={(open) => !open && setRespondingNotification(null)}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Send className="h-4 w-4 text-rooted-primary" />
              Respond to {respondingNotification?.requester || respondingNotification?.title}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              Send a direct confirmation message to coordinate collection or delivery.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="bg-green-50 p-3 rounded-lg border border-green-200 text-xs text-green-900">
              <span className="font-semibold">Subject:</span> {respondingNotification?.message}
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                Your Message
              </label>
              <Textarea
                rows={4}
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Type your message here..."
                className="text-sm"
              />
            </div>

            {/* Quick response chips */}
            <div className="space-y-1">
              <span className="text-xs text-gray-500">Quick suggestions:</span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setResponseText("Yes, this is packed and ready for collection at our farm gate.")}
                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full px-2.5 py-1 transition-colors"
                >
                  Ready for collection
                </button>
                <button
                  type="button"
                  onClick={() => setResponseText("We can supply half the quantity today, remainder on Friday.")}
                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full px-2.5 py-1 transition-colors"
                >
                  Partial supply
                </button>
                <button
                  type="button"
                  onClick={() => setResponseText("Please contact us on WhatsApp to coordinate transport.")}
                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full px-2.5 py-1 transition-colors"
                >
                  Coordinate on WhatsApp
                </button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRespondingNotification(null)}>
              Cancel
            </Button>
            <Button
              className="bg-rooted-primary hover:bg-rooted-secondary text-white flex items-center gap-1.5"
              onClick={handleSendResponse}
              disabled={!responseText.trim()}
            >
              <Send className="h-3.5 w-3.5" />
              Send Response
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}