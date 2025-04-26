import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import AppShell from "@/components/layout/app-shell";
import OrderStatusTimeline from "@/components/order-status";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Order, OrderStatus } from "@shared/schema";
import { ArrowLeft, Package, HeadphonesIcon, RefreshCw } from "lucide-react";

interface OrderDetailPageParams {
  id: string;
}

export default function OrderDetailPage() {
  const { id } = useParams<OrderDetailPageParams>();
  const { user } = useAuth();
  const [, navigate] = useLocation();

  // Fetch order details
  const { data: order, isLoading, error, refetch } = useQuery<Order & { 
    items: Array<{ 
      id: number; 
      productId: number; 
      quantity: number; 
      unitPrice: number; 
      totalPrice: number;
      product: {
        id: number;
        name: string;
        image?: string;
        description: string;
      }
    }>;
  }>({
    queryKey: [`/api/orders/${id}`],
    queryFn: async ({ queryKey }) => {
      const res = await fetch(queryKey[0] as string, { credentials: "include" });
      if (res.status === 404) {
        throw new Error("Order not found");
      }
      if (!res.ok) throw new Error("Failed to fetch order details");
      return res.json();
    },
    enabled: !!user && !!id,
  });

  // Format date
  const formatDate = (dateString?: string | Date) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    }).format(date);
  };

  if (isLoading) {
    return (
      <AppShell>
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-12 w-1/3 mb-6" />
          <Skeleton className="h-64 w-full mb-6" />
          <Skeleton className="h-96 w-full mb-6" />
          <Skeleton className="h-64 w-full" />
        </div>
      </AppShell>
    );
  }

  if (error || !order) {
    return (
      <AppShell>
        <div className="max-w-4xl mx-auto text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
          <p className="text-neutral-600 mb-6">
            We couldn't find the order you're looking for.
          </p>
          <Button onClick={() => navigate("/orders")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate("/orders")} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Button>
          <h1 className="text-2xl font-bold font-poppins mb-2">Order Details</h1>
          <p className="text-neutral-600">Order #{order.id.toString().padStart(5, '0')}</p>
        </div>

        {/* Order Status Tracker */}
        <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-neutral-500 text-sm">Order Number</span>
              <p className="font-medium">#{order.id.toString().padStart(5, '0')}</p>
            </div>
            <div>
              <span className="text-neutral-500 text-sm">Order Date</span>
              <p className="font-medium">{formatDate(order.createdAt)}</p>
            </div>
            <div>
              <span className="text-neutral-500 text-sm">Estimated Delivery</span>
              <p className="font-medium">{formatDate(order.estimatedDelivery)}</p>
            </div>
            <div>
              <span className={`
                px-2 py-1 text-sm font-medium rounded-full 
                ${order.status === OrderStatus.IN_TRANSIT ? 'bg-primary/10 text-primary' : 
                  order.status === OrderStatus.DELIVERED ? 'bg-green-100 text-green-800' :
                  order.status === OrderStatus.CANCELLED ? 'bg-red-100 text-red-800' :
                  'bg-amber-100 text-amber-800'}
              `}>
                {order.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
            </div>
          </div>
          
          {/* Progress Tracker */}
          <OrderStatusTimeline 
            currentStatus={order.status} 
            estimatedDelivery={order.estimatedDelivery as string}
          />
        </div>
        
        {/* Order Details */}
        <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
          <h2 className="text-lg font-semibold font-poppins mb-4">Order Items</h2>
          
          <div className="divide-y divide-neutral-200">
            {order.items.map(item => (
              <div key={item.id} className="py-4 flex items-center">
                <div className="h-16 w-16 rounded-lg overflow-hidden">
                  {item.product.image ? (
                    <img 
                      src={item.product.image} 
                      alt={item.product.name} 
                      className="h-full w-full object-cover" 
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-neutral-200">
                      <Package className="h-8 w-8 text-neutral-500" />
                    </div>
                  )}
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="font-medium">{item.product.name}</h3>
                  <p className="text-sm text-neutral-500">
                    {item.quantity} × ${item.unitPrice.toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">${item.totalPrice.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Order Summary */}
          <div className="mt-6 pt-6 border-t border-neutral-200">
            <div className="flex justify-between mb-2">
              <span className="text-neutral-600">Subtotal</span>
              <span className="font-medium">${order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-neutral-600">Delivery Fee</span>
              <span className="font-medium">${order.deliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-neutral-600">Tax</span>
              <span className="font-medium">${order.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-neutral-200 mt-2">
              <span className="font-semibold">Total</span>
              <span className="font-semibold">${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        {/* Delivery Information */}
        <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
          <h2 className="text-lg font-semibold font-poppins mb-4">Delivery Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm text-neutral-500 mb-1">Delivery Address</h3>
              <p className="font-medium">{user?.fullName}</p>
              <p>{order.address}</p>
              <p>{order.city}, {order.state} {order.zipCode}</p>
            </div>
            
            <div>
              <h3 className="text-sm text-neutral-500 mb-1">Contact Information</h3>
              <p><span className="font-medium">Email:</span> {order.contactEmail}</p>
              <p><span className="font-medium">Phone:</span> {order.contactPhone}</p>
            </div>
          </div>
          
          {order.deliveryInstructions && (
            <div className="mt-6">
              <h3 className="text-sm text-neutral-500 mb-1">Delivery Instructions</h3>
              <p>{order.deliveryInstructions}</p>
            </div>
          )}
        </div>
        
        {/* Actions */}
        <div className="flex flex-wrap gap-4 justify-between">
          <Button variant="outline" className="flex items-center">
            <HeadphonesIcon className="mr-2 h-4 w-4" />
            Contact Support
          </Button>
          
          <Button onClick={() => refetch()} className="flex items-center">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Order Status
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
