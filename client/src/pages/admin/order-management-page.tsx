import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import AppShell from "@/components/layout/app-shell";
import OrderStatusUpdate from "@/components/admin/order-status-update";
import { Order, OrderStatus } from "@shared/schema";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import OrderStatusTimeline from "@/components/order-status";
import {
  Search,
  Filter,
  FileDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Package,
  User
} from "lucide-react";

export default function OrderManagementPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const pageSize = 10;

  // Fetch all orders
  const { data: orders = [], isLoading } = useQuery<(Order & { 
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
  })[]>({
    queryKey: ["/api/orders"],
    queryFn: async ({ queryKey }) => {
      const res = await fetch(queryKey[0] as string, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch orders");
      return res.json();
    },
    enabled: !!user && user.role === "admin",
  });

  const filteredOrders = orders.filter(order => {
  
    if (searchQuery) {
      const orderIdMatch = order.id.toString().includes(searchQuery);
      const customerMatch = order.contactEmail.toLowerCase().includes(searchQuery.toLowerCase());
      const productMatch = order.items.some(item => 
        item.product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (!orderIdMatch && !customerMatch && !productMatch) return false;
    }
    
    if (statusFilter !== "all" && order.status !== statusFilter) {
      return false;
    }
    
    return true;
  });


  const sortedOrders = [...filteredOrders].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const totalPages = Math.ceil(sortedOrders.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedOrders = sortedOrders.slice(startIndex, startIndex + pageSize);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  };

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); 
  };

  const exportToCsv = () => {
    const headers = ["Order ID", "Customer", "Date", "Status", "Items", "Total"];
    const csvRows = [headers];
    
    filteredOrders.forEach(order => {
      const items = order.items.map(item => `${item.quantity}x ${item.product.name}`).join(", ");
      const row = [
        order.id,
        order.contactEmail,
        new Date(order.createdAt).toISOString(),
        order.status,
        items,
        order.total
      ];
      csvRows.push(row);
    });
    
    const csvContent = csvRows.map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "orders.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const selectedOrder = selectedOrderId ? orders.find(order => order.id === selectedOrderId) : null;

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold font-poppins mb-2">Order Management</h1>
          <p className="text-neutral-600">View and manage customer orders</p>
        </div>

        {/* Action Bar */}
        <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center space-x-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value={OrderStatus.PENDING}>Pending</SelectItem>
                <SelectItem value={OrderStatus.CONFIRMED}>Confirmed</SelectItem>
                <SelectItem value={OrderStatus.PROCESSING}>Processing</SelectItem>
                <SelectItem value={OrderStatus.PACKED}>Packed</SelectItem>
                <SelectItem value={OrderStatus.IN_TRANSIT}>In Transit</SelectItem>
                <SelectItem value={OrderStatus.DELIVERED}>Delivered</SelectItem>
                <SelectItem value={OrderStatus.CANCELLED}>Cancelled</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              className="flex items-center"
              onClick={exportToCsv}
            >
              <FileDown className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
          
          <form onSubmit={handleSearch} className="relative">
            <Input
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-[250px] pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </form>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-4">
              <Skeleton className="h-10 w-full mb-4" />
              {[...Array(5)].map((_, index) => (
                <Skeleton key={index} className="h-16 w-full mb-4" />
              ))}
            </div>
          ) : sortedOrders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <h3 className="text-lg font-medium mb-2">No orders found</h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your filters to see more orders"
                  : "There are no orders yet"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedOrders.map(order => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        #{order.id.toString().padStart(5, '0')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center mr-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div>
                            <div className="text-sm font-medium">{order.contactEmail}</div>
                            <div className="text-xs text-muted-foreground">{order.contactPhone}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{formatDate(order.createdAt)}</div>
                        <div className="text-xs text-muted-foreground">
                          Est. Delivery: {formatDate(order.estimatedDelivery)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{order.items.length} items</div>
                        <div className="text-xs text-muted-foreground truncate max-w-[150px]">
                          {order.items.map(item => item.product.name).join(", ")}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">${order.total.toFixed(2)}</div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(order.status)}`}>
                          {order.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center"
                            onClick={() => setSelectedOrderId(order.id)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          
                          <OrderStatusUpdate
                            orderId={order.id}
                            currentStatus={order.status}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-5 py-5 bg-white border-t flex flex-col xs:flex-row items-center xs:justify-between">
                  <span className="text-xs text-neutral-500">
                    Showing {startIndex + 1} to {Math.min(startIndex + pageSize, sortedOrders.length)} of {sortedOrders.length} entries
                  </span>
                  <div className="mt-2 xs:mt-0">
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      
                      {[...Array(totalPages)].map((_, index) => {
                        const page = index + 1;
                        return (
                          <Button
                            key={page}
                            variant={page === currentPage ? "default" : "outline"}
                            className="relative inline-flex items-center px-4 py-2"
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </Button>
                        );
                      })}
                      
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </nav>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Order Detail Sidebar */}
        <Sheet open={!!selectedOrderId} onOpenChange={(open) => !open && setSelectedOrderId(null)}>
          <SheetContent className="sm:max-w-xl overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Order Details</SheetTitle>
              <SheetDescription>
                {selectedOrder && `Order #${selectedOrder.id.toString().padStart(5, '0')}`}
              </SheetDescription>
            </SheetHeader>
            
            {selectedOrder && (
              <div className="mt-6 space-y-6">
                {/* Order Status */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Order Status</h3>
                  <OrderStatusTimeline 
                    currentStatus={selectedOrder.status} 
                    estimatedDelivery={selectedOrder.estimatedDelivery as string}
                  />
                </div>
                
                <div className="py-2">
                  <OrderStatusUpdate
                    orderId={selectedOrder.id}
                    currentStatus={selectedOrder.status}
                  />
                </div>
                
                {/* Customer Information */}
                <Accordion type="single" collapsible defaultValue="customer-info">
                  <AccordionItem value="customer-info">
                    <AccordionTrigger>Customer Information</AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm text-muted-foreground mb-1">Contact</h4>
                          <p className="text-sm">{selectedOrder.contactEmail}</p>
                          <p className="text-sm">{selectedOrder.contactPhone}</p>
                        </div>
                        <div>
                          <h4 className="text-sm text-muted-foreground mb-1">Shipping Address</h4>
                          <p className="text-sm">{selectedOrder.address}</p>
                          <p className="text-sm">{selectedOrder.city}, {selectedOrder.state} {selectedOrder.zipCode}</p>
                        </div>
                      </div>
                      {selectedOrder.deliveryInstructions && (
                        <div className="mt-4">
                          <h4 className="text-sm text-muted-foreground mb-1">Delivery Instructions</h4>
                          <p className="text-sm">{selectedOrder.deliveryInstructions}</p>
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                
                {/* Order Items */}
                <Accordion type="single" collapsible defaultValue="order-items">
                  <AccordionItem value="order-items">
                    <AccordionTrigger>Order Items</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        {selectedOrder.items.map(item => (
                          <div key={item.id} className="flex items-center border-b pb-4">
                            <div className="h-12 w-12 rounded-md overflow-hidden">
                              {item.product.image ? (
                                <img 
                                  src={item.product.image} 
                                  alt={item.product.name} 
                                  className="h-full w-full object-cover" 
                                />
                              ) : (
                                <div className="h-full w-full bg-muted flex items-center justify-center">
                                  <Package className="h-6 w-6 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4 flex-1">
                              <h4 className="text-sm font-medium">{item.product.name}</h4>
                              <p className="text-xs text-muted-foreground">
                                {item.quantity} x ${item.unitPrice.toFixed(2)}
                              </p>
                            </div>
                            <div className="text-sm font-medium">
                              ${item.totalPrice.toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Order Summary */}
                      <div className="mt-4 pt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Subtotal</span>
                          <span>${selectedOrder.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Delivery Fee</span>
                          <span>${selectedOrder.deliveryFee.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Tax</span>
                          <span>${selectedOrder.tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm font-medium pt-2 border-t">
                          <span>Total</span>
                          <span>${selectedOrder.total.toFixed(2)}</span>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                
                {/* Order Timeline */}
                <Accordion type="single" collapsible>
                  <AccordionItem value="order-timeline">
                    <AccordionTrigger>Order Timeline</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        <div className="flex items-start">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mt-1">
                            <Package className="h-5 w-5 text-primary" />
                          </div>
                          <div className="ml-4">
                            <h4 className="text-sm font-medium">Order Placed</h4>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(selectedOrder.createdAt)}
                            </p>
                            <p className="text-sm mt-1">
                              Order was placed by customer
                            </p>
                          </div>
                        </div>
                        
                        {/* More timeline events would go here in a real implementation */}
                        <div className="flex items-start">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mt-1">
                            <Package className="h-5 w-5 text-primary" />
                          </div>
                          <div className="ml-4">
                            <h4 className="text-sm font-medium">Current Status: {selectedOrder.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</h4>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(selectedOrder.updatedAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </AppShell>
  );
}
