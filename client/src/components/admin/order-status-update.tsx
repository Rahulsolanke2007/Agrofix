import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { OrderStatus } from "@shared/schema";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

interface OrderStatusUpdateProps {
  orderId: number;
  currentStatus: string;
  onSuccess?: () => void;
}

export default function OrderStatusUpdate({ 
  orderId, 
  currentStatus, 
  onSuccess 
}: OrderStatusUpdateProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>(currentStatus);
  const [notes, setNotes] = useState("");

  const updateMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("PUT", `/api/orders/${orderId}/status`, {
        status: selectedStatus,
        notes
      });
    },
    onSuccess: () => {
      toast({
        title: "Order status updated",
        description: `Order #${orderId} status has been updated to ${selectedStatus.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}.`
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: [`/api/orders/${orderId}`] });
      
      setOpen(false);
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Failed to update status",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Filter out status options that don't make sense
  const getAvailableStatuses = () => {
    const allStatuses = Object.values(OrderStatus);
    
    // If already delivered or cancelled, don't allow status change
    if (currentStatus === OrderStatus.DELIVERED || currentStatus === OrderStatus.CANCELLED) {
      return [currentStatus];
    }
    
    // Get status index
    const currentIndex = allStatuses.indexOf(currentStatus as OrderStatus);
    
    // Allow status change to any future status or to cancelled
    return allStatuses.filter((status, index) => 
      status === OrderStatus.CANCELLED || 
      (index >= currentIndex && index <= currentIndex + 2) // Allow up to 2 steps ahead
    );
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setSelectedStatus(currentStatus);
      setNotes("");
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        <Button>Update Status</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Update Order Status</AlertDialogTitle>
          <AlertDialogDescription>
            Change the status of order #{orderId.toString().padStart(5, '0')} from{" "}
            <span className="font-medium">
              {currentStatus.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">New Status</label>
            <Select 
              value={selectedStatus} 
              onValueChange={setSelectedStatus}
              disabled={updateMutation.isPending}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                {getAvailableStatuses().map(status => (
                  <SelectItem key={status} value={status}>
                    {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Notes (Optional)</label>
            <Textarea
              placeholder="Add any notes about this status change"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={updateMutation.isPending}
              className="resize-none"
            />
          </div>
        </div>
        
        <AlertDialogFooter>
          <AlertDialogCancel disabled={updateMutation.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={updateMutation.isPending || selectedStatus === currentStatus}
            className="bg-primary hover:bg-primary/90"
            onClick={(e) => {
              e.preventDefault();
              updateMutation.mutate();
            }}
          >
            {updateMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Update Status
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
