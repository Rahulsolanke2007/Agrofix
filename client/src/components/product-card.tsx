// import { useState } from "react";
// import { useMutation } from "@tanstack/react-query";
// import { apiRequest, queryClient } from "@/lib/queryClient";
// import { useAuth } from "@/hooks/use-auth";
// import { useToast } from "@/hooks/use-toast";
// import { Card, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Product } from "@shared/schema";
// import { Heart, Package, Check, ShoppingCart, Star } from "lucide-react";

// interface ProductCardProps {
//   product: Product;
// }

// export default function ProductCard({ product }: ProductCardProps) {
//   const { user } = useAuth();
//   const { toast } = useToast();
//   const [isFavorite, setIsFavorite] = useState(false);
//   const [isAddedToCart, setIsAddedToCart] = useState(false);

//   // Add to cart mutation
//   const addToCartMutation = useMutation({
//     mutationFn: async (productId: number) => {
//       await apiRequest("POST", "/api/cart/items", {
//         productId,
//         quantity: 1
//       });
//     },
//     onSuccess: () => {
//       setIsAddedToCart(true);
//       setTimeout(() => setIsAddedToCart(false), 1500);
      
//       toast({
//         title: "Added to cart",
//         description: `${product.name} has been added to your cart`,
//       });
      
//       queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
//     },
//     onError: (error) => {
//       toast({
//         title: "Failed to add to cart",
//         description: error.message,
//         variant: "destructive",
//       });
//     },
//   });

//   // Toggle favorite mutation
//   const toggleFavoriteMutation = useMutation({
//     mutationFn: async () => {
//       if (isFavorite) {
//         // Remove from favorites - this is a placeholder as we don't have the favorite id
//         // await apiRequest("DELETE", `/api/favorites/${favoriteId}`);
//       } else {
//         await apiRequest("POST", "/api/favorites", { productId: product.id });
//       }
//     },
//     onSuccess: () => {
//       setIsFavorite(!isFavorite);
//       toast({
//         title: isFavorite ? "Removed from favorites" : "Added to favorites",
//         description: `${product.name} has been ${isFavorite ? "removed from" : "added to"} your favorites`,
//       });
//       queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
//     },
//     onError: (error) => {
//       toast({
//         title: "Action failed",
//         description: error.message,
//         variant: "destructive",
//       });
//     },
//   });

//   const handleAddToCart = () => {
//     if (!user) {
//       toast({
//         title: "Please login",
//         description: "You need to be logged in to add items to your cart",
//         variant: "destructive",
//       });
//       return;
//     }

//     addToCartMutation.mutate(product.id);
//   };

//   const handleToggleFavorite = () => {
//     if (!user) {
//       toast({
//         title: "Please login",
//         description: "You need to be logged in to add items to your favorites",
//         variant: "destructive",
//       });
//       return;
//     }

//     toggleFavoriteMutation.mutate();
//   };
//   console.log(product.image)
//   const prodImage = product.image
//   console.log(prodImage)

//   return (
//     <Card className="overflow-hidden hover:shadow-md transition-all duration-300">
//       <div className="relative">
//         {product.image ? (
//           <img 
//             src={prodImage|| " "} 
//             alt={product.name} 
//             className="w-full h-48 object-cover"
//           />
//         ) : (
//           <div className="w-full h-48 bg-muted flex items-center justify-center">
//             <Package className="h-12 w-12 text-muted-foreground" />
//           </div>
//         )}
//         <div className="absolute top-2 right-2">
//           <Button
//             variant="ghost"
//             size="icon"
//             className="w-8 h-8 rounded-full bg-white shadow hover:text-primary"
//             onClick={handleToggleFavorite}
//             disabled={toggleFavoriteMutation.isPending}
//           >
//             <Heart className={`h-4 w-4 ${isFavorite ? "fill-primary text-primary" : ""}`} />
//           </Button>
//         </div>
//         {product.isOrganic && (
//           <div className="absolute top-2 left-2">
//             <span className="px-2 py-1 text-xs font-medium bg-primary text-white rounded-full">
//               Organic
//             </span>
//           </div>
//         )}
//         {product.status === "low_stock" && (
//           <div className="absolute bottom-2 left-2">
//             <span className="px-2 py-1 text-xs font-medium bg-amber-500 text-white rounded-full">
//               Low Stock
//             </span>
//           </div>
//         )}
//         {product.status === "out_of_stock" && (
//           <div className="absolute bottom-2 left-2">
//             <span className="px-2 py-1 text-xs font-medium bg-destructive text-white rounded-full">
//               Out of Stock
//             </span>
//           </div>
//         )}
//       </div>
//       <CardContent className="p-4">
//         <h3 className="font-medium mb-1">{product.name}</h3>
//         <p className="text-sm text-muted-foreground mb-2">{product.description}</p>
//         <div className="flex items-center justify-between mb-4">
//           <div>
//             <span className="text-lg font-semibold">${product.price.toFixed(2)}</span>
//             <span className="text-sm text-muted-foreground ml-2">/ {product.unit}</span>
//           </div>
//           <div className="flex items-center">
//             <span className="flex items-center text-sm">
//               <Star className="h-4 w-4 mr-1 text-amber-400 fill-amber-400" />
//               {product.rating.toFixed(1)}
//             </span>
//           </div>
//         </div>
//         <Button
//           className="w-full py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition duration-300 flex items-center justify-center"
//           onClick={handleAddToCart}
//           disabled={addToCartMutation.isPending || product.status === "out_of_stock"}
//         >
//           {isAddedToCart ? (
//             <>
//               <Check className="mr-2 h-4 w-4" />
//               Added
//             </>
//           ) : (
//             <>
//               <ShoppingCart className="mr-2 h-4 w-4" />
//               Add to Cart
//             </>
//           )}
//         </Button>
//       </CardContent>
//     </Card>
//   );
// }

import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Product } from "@shared/schema";
import { Heart, Package, Check, ShoppingCart, Star } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [directImageUrl, setDirectImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (product.image) {
      // Extract the direct image URL from Google redirect URL
      try {
        const urlObj = new URL(product.image);
        if (urlObj.hostname === "www.google.com" && urlObj.pathname === "/url") {
          const params = new URLSearchParams(urlObj.search);
          const actualUrl = params.get("url");
          if (actualUrl) {
            setDirectImageUrl(actualUrl);
          } else {
            setDirectImageUrl(product.image);
          }
        } else {
          setDirectImageUrl(product.image);
        }
      } catch (error) {
        setDirectImageUrl(product.image);
        console.error("Error parsing image URL:", error);
      }
    }
  }, [product.image]);

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async (productId: number) => {
      await apiRequest("POST", "/api/cart/items", {
        productId,
        quantity: 1
      });
    },
    onSuccess: () => {
      setIsAddedToCart(true);
      setTimeout(() => setIsAddedToCart(false), 1500);
      
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart`,
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to add to cart",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Toggle favorite mutation
  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      if (isFavorite) {
        // Remove from favorites - this is a placeholder as we don't have the favorite id
        // await apiRequest("DELETE", `/api/favorites/${favoriteId}`);
      } else {
        await apiRequest("POST", "/api/favorites", { productId: product.id });
      }
    },
    onSuccess: () => {
      setIsFavorite(!isFavorite);
      toast({
        title: isFavorite ? "Removed from favorites" : "Added to favorites",
        description: `${product.name} has been ${isFavorite ? "removed from" : "added to"} your favorites`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
    },
    onError: (error) => {
      toast({
        title: "Action failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddToCart = () => {
    if (!user) {
      toast({
        title: "Please login",
        description: "You need to be logged in to add items to your cart",
        variant: "destructive",
      });
      return;
    }

    addToCartMutation.mutate(product.id);
  };

  const handleToggleFavorite = () => {
    if (!user) {
      toast({
        title: "Please login",
        description: "You need to be logged in to add items to your favorites",
        variant: "destructive",
      });
      return;
    }

    toggleFavoriteMutation.mutate();
  };

  const handleImageError = () => {
    setImageError(true);
  };

  // Fallback to a placeholder if we can't load the image
  const getImageUrl = () => {
    if (imageError || !directImageUrl) {
      // Use a placeholder image with product name
      return `https://placehold.co/600x400?text=${encodeURIComponent(product.name)}`;
    }
    return directImageUrl;
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-all duration-300">
      <div className="relative">
        {(directImageUrl || product.image) && !imageError ? (
          <img 
            src={getImageUrl()} 
            alt={product.name} 
            className="w-full h-48 object-cover"
            onError={handleImageError}
            crossOrigin="anonymous"
          />
        ) : (
          <div className="w-full h-48 bg-muted flex items-center justify-center">
            <Package className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 rounded-full bg-white shadow hover:text-primary"
            onClick={handleToggleFavorite}
            disabled={toggleFavoriteMutation.isPending}
          >
            <Heart className={`h-4 w-4 ${isFavorite ? "fill-primary text-primary" : ""}`} />
          </Button>
        </div>
        {product.isOrganic && (
          <div className="absolute top-2 left-2">
            <span className="px-2 py-1 text-xs font-medium bg-primary text-white rounded-full">
              Organic
            </span>
          </div>
        )}
        {product.status === "low_stock" && (
          <div className="absolute bottom-2 left-2">
            <span className="px-2 py-1 text-xs font-medium bg-amber-500 text-white rounded-full">
              Low Stock
            </span>
          </div>
        )}
        {product.status === "out_of_stock" && (
          <div className="absolute bottom-2 left-2">
            <span className="px-2 py-1 text-xs font-medium bg-destructive text-white rounded-full">
              Out of Stock
            </span>
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="font-medium mb-1">{product.name}</h3>
        <p className="text-sm text-muted-foreground mb-2">{product.description}</p>
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-lg font-semibold">₹{product.price.toFixed(2)}</span>
            <span className="text-sm text-muted-foreground ml-2">/ {product.unit}</span>
          </div>
          <div className="flex items-center">
            <span className="flex items-center text-sm">
              <Star className="h-4 w-4 mr-1 text-amber-400 fill-amber-400" />
              {product.rating.toFixed(1)}
            </span>
          </div>
        </div>
        <Button
          className="w-full py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition duration-300 flex items-center justify-center"
          onClick={handleAddToCart}
          disabled={addToCartMutation.isPending || product.status === "out_of_stock"}
        >
          {isAddedToCart ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Added
            </>
          ) : (
            <>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add to Cart
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
