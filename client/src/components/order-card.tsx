import { Order, OrderStatus } from "@shared/schema";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { PackageOpen, Truck, Info } from "lucide-react";
import { Link } from "wouter";

interface OrderCardProps {
  order: Order & { 
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
      }
    }> 
  };
}

export default function OrderCard({ order }: OrderCardProps) {
  // Format date
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    }).format(date);
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case OrderStatus.PENDING:
        return "bg-amber-100 text-amber-800";
      case OrderStatus.CONFIRMED:
        return "bg-blue-100 text-blue-800";
      case OrderStatus.PROCESSING:
      case OrderStatus.PACKED:
        return "bg-indigo-100 text-indigo-800";
      case OrderStatus.IN_TRANSIT:
        return "bg-primary/10 text-primary";
      case OrderStatus.DELIVERED:
        return "bg-green-100 text-green-800";
      case OrderStatus.CANCELLED:
        return "bg-red-100 text-red-800";
      default:
        return "bg-neutral-100 text-neutral-800";
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case OrderStatus.IN_TRANSIT:
        return <Truck className="h-4 w-4 mr-1" />;
      case OrderStatus.DELIVERED:
        return <PackageOpen className="h-4 w-4 mr-1" />;
      default:
        return <Info className="h-4 w-4 mr-1" />;
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-all duration-300">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-medium">{`Order #${order.id.toString().padStart(5, '0')}`}</h3>
            <p className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</p>
          </div>
          <Badge className={`flex items-center px-2 py-1 ${getStatusColor(order.status)}`}>
            {getStatusIcon(order.status)}
            <span>{order.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
          </Badge>
        </div>
        
        <div className="space-y-3">
          {/* Order Items Preview - show up to 2 items */}
          {order.items.slice(0, 2).map(item => (
            <div key={item.id} className="flex items-center">
              <div className="h-12 w-12 bg-neutral-100 rounded-md overflow-hidden mr-3 flex-shrink-0">
                {item.product.image ? (
                  <img 
                    src={item.product.image} 
                    alt={item.product.name} 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-neutral-200">
                    <PackageOpen className="h-6 w-6 text-neutral-500" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.product.name}</p>
                <p className="text-xs text-muted-foreground">
                  {item.quantity} × ${item.unitPrice.toFixed(2)}
                </p>
              </div>
            </div>
          ))}
          
          {/* If there are more items than shown */}
          {order.items.length > 2 && (
            <p className="text-xs text-muted-foreground mt-1">
              +{order.items.length - 2} more items
            </p>
          )}
        </div>
        
        {/* Order Totals */}
        <div className="mt-4 pt-3 border-t">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Total</span>
            <span className="font-semibold">${order.total.toFixed(2)}</span>
          </div>
          {order.estimatedDelivery && (
            <p className="text-xs text-muted-foreground mt-1">
              {order.status !== OrderStatus.DELIVERED ? "Estimated delivery" : "Delivered"}: {" "}
              {formatDate(order.estimatedDelivery)}
            </p>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 border-t">
        <Link href={`/orders/${order.id}`}>
          <Button variant="outline" className="w-full">
            View Order Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
