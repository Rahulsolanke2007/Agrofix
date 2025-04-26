import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

interface CartItem {
  id: number;
  cartId: number;
  productId: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    description: string;
    price: number;
    image: string;
    unit: string;
    stock: number;
    status: string;
  };
}

interface Cart {
  id: number;
  userId: number;
  updatedAt: string;
  items: CartItem[];
}

export function useCart() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch cart data
  const { data: cart, isLoading, error, refetch } = useQuery<Cart>({
    queryKey: ["/api/cart"],
    queryFn: async ({ queryKey }) => {
      if (!user) return { id: 0, userId: 0, updatedAt: "", items: [] };
      
      const res = await fetch(queryKey[0] as string, { credentials: "include" });
      if (res.status === 401) return { id: 0, userId: 0, updatedAt: "", items: [] };
      if (!res.ok) throw new Error("Failed to fetch cart");
      
      return res.json();
    },
    enabled: !!user,
  });

  // Add item to cart
  const addToCart = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: number, quantity: number }) => {
      if (!user) throw new Error("You need to be logged in to add items to your cart");
      
      return apiRequest("POST", "/api/cart/items", { productId, quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Item added to cart",
        description: "The item has been added to your cart successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add item",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update cart item quantity
  const updateCartItem = useMutation({
    mutationFn: async ({ id, quantity }: { id: number, quantity: number }) => {
      return apiRequest("PUT", `/api/cart/items/${id}`, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update item",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Remove item from cart
  const removeFromCart = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/cart/items/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Item removed",
        description: "The item has been removed from your cart.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to remove item",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Clear cart
  const clearCart = useMutation({
    mutationFn: async () => {
      return apiRequest("DELETE", "/api/cart");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Cart cleared",
        description: "Your cart has been cleared successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to clear cart",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Calculate cart totals
  const cartItems = cart?.items || [];
  const cartItemCount = cartItems.reduce((count, item) => count + item.quantity, 0);
  const cartSubtotal = cartItems.reduce(
    (total, item) => total + item.quantity * item.product.price,
    0
  );

  return {
    cart,
    cartItems,
    cartItemCount,
    cartSubtotal,
    isLoading,
    error,
    refetch,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
  };
}
