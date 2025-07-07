import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, CreditCard, RefreshCw, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface SubscriptionData {
  subscribed: boolean;
  subscription_tier?: string;
  subscription_end?: string;
}

export const SubscriptionStatus = () => {
  const [subscription, setSubscription] = useState<SubscriptionData>({ subscribed: false });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const checkSubscription = async () => {
    try {
      setRefreshing(true);
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) throw error;
      
      setSubscription(data);
    } catch (error) {
      console.error('Error checking subscription:', error);
      toast.error("Failed to check subscription status");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const openCustomerPortal = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast.error("Failed to open subscription management");
    }
  };

  useEffect(() => {
    checkSubscription();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(checkSubscription, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Subscription Status
            </CardTitle>
            <CardDescription>
              Manage your subscription and billing
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={checkSubscription}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="font-medium">Status:</span>
          <Badge variant={subscription.subscribed ? "default" : "secondary"}>
            {subscription.subscribed ? "Active" : "Free"}
          </Badge>
        </div>
        
        {subscription.subscription_tier && (
          <div className="flex items-center justify-between">
            <span className="font-medium">Plan:</span>
            <Badge variant="outline">{subscription.subscription_tier}</Badge>
          </div>
        )}
        
        {subscription.subscription_end && (
          <div className="flex items-center justify-between">
            <span className="font-medium">Renewal Date:</span>
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 mr-1" />
              {format(new Date(subscription.subscription_end), 'MMM dd, yyyy')}
            </div>
          </div>
        )}
        
        {subscription.subscribed && (
          <Button
            onClick={openCustomerPortal}
            className="w-full mt-4"
            variant="outline"
          >
            <Settings className="h-4 w-4 mr-2" />
            Manage Subscription
          </Button>
        )}
      </CardContent>
    </Card>
  );
};