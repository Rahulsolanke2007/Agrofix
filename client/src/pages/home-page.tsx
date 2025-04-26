import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import AppShell from "@/components/layout/app-shell";
import ProductCard from "@/components/product-card";
import CategoryCard from "@/components/category-card";
import FeatureCard from "@/components/feature-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Product, Category } from "@shared/schema";

export default function HomePage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<string>("all");
  const [visibleProducts, setVisibleProducts] = useState<number>(8);

  // Fetch categories
  const { data: categories = [], isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    queryFn: async ({ queryKey }) => {
      const res = await fetch(queryKey[0] as string);
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    },
  });

  // Fetch products
  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products", filter !== "all" ? filter : null],
    queryFn: async ({ queryKey }) => {
      const url = filter !== "all" 
        ? `${queryKey[0]}?categoryId=${filter}` 
        : queryKey[0] as string;
      
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch products");
      return res.json();
    },
  });

  // Reset visible products when filter changes
  useEffect(() => {
    setVisibleProducts(8);
  }, [filter]);

  // Load more products
  const handleLoadMore = () => {
    setVisibleProducts(prev => prev + 4);
  };

  // Filtered and limited products for display
  const displayProducts = products.slice(0, visibleProducts);

  return (
    <AppShell>
      {/* Hero Banner */}
      <div className="relative rounded-xl overflow-hidden mb-6 bg-white shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-dark/80 to-primary/50"></div>
        <img 
          src="https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80" 
          alt="Fresh organic vegetables" 
          className="w-full h-48 md:h-64 object-cover"
        />
        <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-12">
          <h1 className="text-2xl md:text-4xl font-bold text-white font-poppins mb-2">Fresh Organic Produce</h1>
          <p className="text-white text-sm md:text-base mb-4 max-w-md">Farm-to-table vegetables delivered to your doorstep within 24 hours of harvest</p>
          <Button 
            className="bg-accent hover:bg-accent-dark text-white font-medium py-2 px-6 rounded-lg w-fit transition duration-300"
          >
            Shop Now
          </Button>
        </div>
      </div>

      {/* Categories */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 font-poppins">Categories</h2>
        {categoriesLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, index) => (
              <Skeleton key={index} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.map(category => (
              <CategoryCard 
                key={category.id} 
                category={category} 
                onClick={() => setFilter(category.id.toString())}
                isActive={filter === category.id.toString()}
              />
            ))}
            <CategoryCard 
              category={{ id: 0, name: "All", icon: "ri-more-2-fill" }}
              onClick={() => setFilter("all")}
              isActive={filter === "all"}
            />
          </div>
        )}
      </div>

      {/* Products */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold font-poppins">Featured Products</h2>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter: All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Products</SelectItem>
              {categories.map(category => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Product Grid */}
        {productsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <Skeleton key={index} className="h-80 w-full rounded-xl" />
            ))}
          </div>
        ) : displayProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {displayProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <h3 className="text-lg font-medium mb-2">No products found</h3>
            <p className="text-muted-foreground">Try changing your filter or check back later</p>
          </div>
        )}

        {/* Load More */}
        {!productsLoading && products.length > visibleProducts && (
          <div className="text-center mt-8">
            <Button 
              variant="outline" 
              className="px-6 py-2 border-primary text-primary hover:bg-primary hover:text-white rounded-lg transition duration-300"
              onClick={handleLoadMore}
            >
              Load More
            </Button>
          </div>
        )}
      </div>

      {/* Features */}
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard
            icon="ri-truck-line"
            title="Fast Delivery"
            description="Same-day delivery on orders placed before 11 AM"
          />
          <FeatureCard
            icon="ri-leaf-line"
            title="100% Organic"
            description="All products are certified organic and sustainably grown"
          />
          <FeatureCard
            icon="ri-refresh-line"
            title="Easy Returns"
            description="Not satisfied? Get a refund or replacement within 24 hours"
          />
        </div>
      </div>
    </AppShell>
  );
}
