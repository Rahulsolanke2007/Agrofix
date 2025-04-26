import { OrderStatus } from "@shared/schema";
import { Check, Truck, Home, Package, ClipboardCheck, AlertCircle } from "lucide-react";

interface OrderStatusTimelineProps {
  currentStatus: string;
  statusHistory?: Array<{
    status: string;
    timestamp: string;
    notes?: string;
  }>;
  estimatedDelivery?: string;
}

const statusSteps = [
  { name: OrderStatus.PENDING, label: "Order Placed", icon: ClipboardCheck },
  { name: OrderStatus.CONFIRMED, label: "Confirmed", icon: Check },
  { name: OrderStatus.PROCESSING, label: "Processing", icon: Package },
  { name: OrderStatus.PACKED, label: "Packed", icon: Package },
  { name: OrderStatus.IN_TRANSIT, label: "In Transit", icon: Truck },
  { name: OrderStatus.DELIVERED, label: "Delivered", icon: Home },
];

export default function OrderStatusTimeline({ 
  currentStatus, 
  statusHistory = [],
  estimatedDelivery
}: OrderStatusTimelineProps) {
  const currentIndex = statusSteps.findIndex(step => step.name === currentStatus);
  const isCancelled = currentStatus === OrderStatus.CANCELLED;

  // Format date string to a more readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  };

  // Get the timestamp for a specific status
  const getStatusTimestamp = (status: string) => {
    const historyItem = statusHistory.find(item => item.status === status);
    return historyItem ? formatDate(historyItem.timestamp) : null;
  };

  return (
    <div className="relative">
      {/* Progress Line */}
      {!isCancelled && (
        <div className="absolute top-5 left-0 right-0 h-1 bg-neutral-200">
          <div 
            className="absolute h-full bg-primary" 
            style={{ width: `${Math.min(100, (currentIndex / (statusSteps.length - 1)) * 100)}%` }}
          ></div>
        </div>
      )}
      
      {/* Cancelled Status */}
      {isCancelled ? (
        <div className="flex justify-center">
          <div className="text-center">
            <div className="w-12 h-12 bg-destructive rounded-full flex items-center justify-center mx-auto text-white mb-2">
              <AlertCircle className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium">Order Cancelled</p>
            <p className="text-xs text-muted-foreground">
              {getStatusTimestamp(OrderStatus.CANCELLED) || "N/A"}
            </p>
          </div>
        </div>
      ) : (
        /* Steps */
        <div className="relative flex justify-between">
          {statusSteps.map((step, index) => {
            const StepIcon = step.icon;
            const isCompleted = currentIndex >= index;
            const isCurrent = currentIndex === index;
            
            return (
              <div key={step.name} className="text-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 relative z-10
                  ${isCompleted 
                    ? 'bg-primary text-white' 
                    : 'bg-white border-2 border-neutral-300 text-neutral-300'
                  }
                  ${isCurrent ? 'border-2 border-primary bg-white text-primary' : ''}
                `}>
                  <StepIcon className="h-5 w-5" />
                </div>
                <p className={`text-sm font-medium ${!isCompleted && !isCurrent ? 'text-neutral-400' : ''}`}>
                  {step.label}
                </p>
                <p className="text-xs text-muted-foreground">
                  {getStatusTimestamp(step.name) || (
                    isCurrent && step.name === OrderStatus.DELIVERED && estimatedDelivery
                      ? `Est. ${formatDate(estimatedDelivery)}`
                      : "Pending"
                  )}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
