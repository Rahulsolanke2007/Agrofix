import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Menu, ShoppingCart, Bell, X, Trash, Plus, Minus, LayoutDashboard, Package } from "lucide-react";

interface TopbarProps {
  onToggleSidebar: () => void;
}

export default function Topbar({ onToggleSidebar }: TopbarProps) {
  const { user } = useAuth();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch cart data
  const { data: cart, isLoading: isCartLoading } = useQuery({
    queryKey: ["/api/cart"],
    queryFn: async ({ queryKey }) => {
      if (!user) return null;
      const res = await fetch(queryKey[0] as string, { credentials: "include" });
      if (res.status === 401) return null;
      if (!res.ok) throw new Error("Failed to fetch cart");
      return res.json();
    },
    enabled: !!user,
  });

  // Update cart item quantity
  const updateCartItemMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: number; quantity: number }) => {
      await apiRequest("PUT", `/api/cart/items/${id}`, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
  });

  // Remove item from cart
  const removeCartItemMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/cart/items/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
  });

  // Clear entire cart
  const clearCartMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", "/api/cart");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      setIsCartOpen(false);
    },
  });

  // Calculate cart totals
  const cartItems = cart?.items || [];
  const cartTotal = cartItems.reduce((total: number, item: any) => {
    return total + (item.product.price * item.quantity);
  }, 0).toFixed(2);
  const cartItemCount = cartItems.reduce((count: number, item: any) => count + item.quantity, 0);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
    console.log("Searching for:", searchQuery);
  };

  const handleUpdateQuantity = (id: number, quantity: number) => {
    updateCartItemMutation.mutate({ id, quantity });
  };

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="flex justify-between items-center px-4 py-3">
        {/* Mobile menu button */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden text-neutral-500 hover:text-neutral-900 focus:outline-none"
          onClick={onToggleSidebar}
        >
          <Menu className="h-6 w-6" />
        </Button>
        
        {/* Search */}
        <div className="relative flex-1 max-w-xs ml-4 mr-6">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Input
                type="text" 
                className="w-full py-2 pl-10 pr-4 text-sm bg-neutral-100 border border-transparent rounded-lg focus:outline-none focus:bg-white focus:border-primary"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </span>
            </div>
          </form>
        </div>
        
        {/* Right side navigation */}
        <div className="flex items-center space-x-4">
          {/* Admin Dashboard Link */}
          {user && user.role === "admin" && (
            <div className="relative hidden sm:block">
              <Button
                variant="outline"
                size="sm"
                className="text-primary border-primary/30 hover:bg-primary/10"
                onClick={() => window.location.href = "/admin"}
              >
                <LayoutDashboard className="h-4 w-4 mr-1" /> Admin
              </Button>
            </div>
          )}
          
          {/* Cart */}
          <div className="relative">
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative p-2 text-neutral-600 hover:text-primary"
              onClick={() => setIsCartOpen(true)}
              disabled={!user}
            >
              <ShoppingCart className="h-5 w-5" />
              {user && cartItemCount > 0 && (
                <span className="absolute top-0 right-0 flex items-center justify-center w-4 h-4 text-xs text-white bg-primary rounded-full">
                  {cartItemCount}
                </span>
              )}
            </Button>
          </div>
          
          {/* Notifications */}
          <div className="relative">
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative p-2 text-neutral-600 hover:text-primary"
              disabled={!user}
            >
              <Bell className="h-5 w-5" />
              {user && (
                <span className="absolute top-0 right-0 flex items-center justify-center w-4 h-4 text-xs text-white bg-primary rounded-full">
                  0
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Cart Dialog */}
      <AlertDialog open={isCartOpen} onOpenChange={setIsCartOpen}>
        <AlertDialogContent className="max-w-md max-h-[80vh] overflow-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex justify-between items-center">
              <span>Your Cart</span>
              <Button variant="ghost" size="icon" onClick={() => setIsCartOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </AlertDialogTitle>
            <AlertDialogDescription>
              {cartItems.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p>Your cart is empty</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mt-4 max-h-[40vh] overflow-auto">
                    {cartItems.map((item: any) => (
                      <div key={item.id} className="flex items-center justify-between border-b pb-4">
                        <div className="flex items-center">
                          <div className="h-16 w-16 rounded-md overflow-hidden bg-muted">
                            {item.product.image ? (
                              <img 
                                src={item.product.image} 
                                alt={item.product.name} 
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center bg-muted">
                                <Package className="h-8 w-8 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <h4 className="font-medium">{item.product.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              ${item.product.price.toFixed(2)} / {item.product.unit}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className="flex items-center border rounded-md mr-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 rounded-l-md"
                              onClick={() => handleUpdateQuantity(item.id, Math.max(0, item.quantity - 1))}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 rounded-r-md"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive hover:text-destructive"
                            onClick={() => removeCartItemMutation.mutate(item.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-4 border-t">
                    <div className="flex justify-between mb-2">
                      <span>Subtotal</span>
                      <span className="font-medium">${cartTotal}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Shipping and taxes calculated at checkout
                    </p>
                  </div>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            {cartItems.length > 0 && (
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => clearCartMutation.mutate()}
              >
                Clear Cart
              </Button>
            )}
            <Button
              className="w-full sm:w-auto"
              disabled={cartItems.length === 0}
              onClick={() => {
                setIsCartOpen(false);
                window.location.href = "/checkout";
              }}
            >
              Checkout
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </header>
  );
}
