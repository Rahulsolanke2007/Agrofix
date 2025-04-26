import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import AppShell from "@/components/layout/app-shell";
import OrderCard from "@/components/order-card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { OrderStatus } from "@shared/schema";

export default function OrdersPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch orders
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["/api/orders"],
    queryFn: async ({ queryKey }) => {
      const res = await fetch(queryKey[0] as string, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch orders");
      return res.json();
    },
    enabled: !!user,
  });

  // Filter orders by status and search query
  const filteredOrders = orders.filter(order => {
    // Filter by status
    if (statusFilter !== "all" && order.status !== statusFilter) {
      return false;
    }

    // Filter by search query (order id or product name)
    if (searchQuery) {
      const orderIdMatch = order.id.toString().includes(searchQuery);
      const productNameMatch = order.items.some(item => 
        item.product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      return orderIdMatch || productNameMatch;
    }

    return true;
  });

  // Group active vs completed orders
  const activeOrders = filteredOrders.filter(order => 
    order.status !== OrderStatus.DELIVERED && order.status !== OrderStatus.CANCELLED
  );
  
  const completedOrders = filteredOrders.filter(order => 
    order.status === OrderStatus.DELIVERED || order.status === OrderStatus.CANCELLED
  );

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold font-poppins mb-2">My Orders</h1>
          <p className="text-neutral-600">View and track your orders</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 sm:items-center">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Search by order number or product name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </span>
          </div>
          
          <div>
            <Tabs defaultValue="all" value={statusFilter} onValueChange={setStatusFilter}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value={OrderStatus.PROCESSING}>Processing</TabsTrigger>
                <TabsTrigger value={OrderStatus.IN_TRANSIT}>In Transit</TabsTrigger>
                <TabsTrigger value={OrderStatus.DELIVERED}>Delivered</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <Skeleton key={index} className="h-64 w-full rounded-xl" />
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-primary-light/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-shopping-bag-line text-2xl text-primary"></i>
            </div>
            <h3 className="text-lg font-medium mb-2">No orders found</h3>
            <p className="text-neutral-600 mb-6">
              {searchQuery || statusFilter !== "all" 
                ? "Try adjusting your filters to see more orders" 
                : "You haven't placed any orders yet"}
            </p>
            {!searchQuery && statusFilter === "all" && (
              <a href="/" className="px-4 py-2 bg-primary text-white rounded-lg inline-block hover:bg-primary-dark transition-colors">
                Browse Products
              </a>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Active Orders */}
            {activeOrders.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Active Orders</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeOrders.map(order => (
                    <OrderCard key={order.id} order={order} />
                  ))}
                </div>
              </div>
            )}

            {/* Completed Orders */}
            {completedOrders.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Completed Orders</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {completedOrders.map(order => (
                    <OrderCard key={order.id} order={order} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
