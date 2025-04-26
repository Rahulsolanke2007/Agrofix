import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import AppShell from "@/components/layout/app-shell";
import ProductCard from "@/components/product-card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Package } from "lucide-react";
import { Product, Category } from "@shared/schema";

export default function ProductsPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { addToCart } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentSearchQuery, setCurrentSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;

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
    queryKey: ["/api/products", categoryFilter !== "all" ? categoryFilter : null],
    queryFn: async ({ queryKey }) => {
      const url = categoryFilter !== "all" 
        ? `${queryKey[0]}?categoryId=${categoryFilter}` 
        : queryKey[0] as string;
      
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch products");
      return res.json();
    },
  });

  // Filter and sort products
  const filteredProducts = products.filter(product => {
    if (currentSearchQuery) {
      const searchLower = currentSearchQuery.toLowerCase();
      return (
        product.name.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      default:
        return 0;
    }
  });

  // Calculate pagination
  const totalPages = Math.ceil(sortedProducts.length / productsPerPage);
  const displayProducts = sortedProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [categoryFilter, currentSearchQuery, sortBy]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentSearchQuery(searchQuery);
  };

  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value);
  };

  const handleAddToCart = (productId: number) => {
    if (!user) {
      navigate("/auth");
      return;
    }
    addToCart.mutate({ productId, quantity: 1 });
  };

  const getCategoryName = (categoryId?: number) => {
    if (!categoryId) return "Uncategorized";
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : "Uncategorized";
  };

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold font-poppins mb-2">Shop Products</h1>
          <p className="text-neutral-600">Browse our selection of fresh organic produce</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
            <form onSubmit={handleSearch} className="relative flex-1">
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Button type="submit" className="absolute right-1 top-1/2 transform -translate-y-1/2">
                Search
              </Button>
            </form>
            
            <div className="flex flex-wrap gap-3">
              <Select value={categoryFilter} onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                  <SelectItem value="price-low">Price (Low to High)</SelectItem>
                  <SelectItem value="price-high">Price (High to Low)</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {productsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <Skeleton key={index} className="h-80 w-full rounded-xl" />
            ))}
          </div>
        ) : displayProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
              {displayProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8 mb-6">
                <nav className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </Button>
                  
                  {Array.from({ length: totalPages }).map((_, index) => {
                    const pageNumber = index + 1;
                    // Show only current page, first, last, and adjacent pages
                    if (
                      pageNumber === 1 ||
                      pageNumber === totalPages ||
                      (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1) ||
                      (currentPage === 1 && pageNumber <= 3) ||
                      (currentPage === totalPages && pageNumber >= totalPages - 2)
                    ) {
                      return (
                        <Button
                          key={pageNumber}
                          variant={currentPage === pageNumber ? 'default' : 'outline'}
                          onClick={() => setCurrentPage(pageNumber)}
                        >
                          {pageNumber}
                        </Button>
                      );
                    } else if (
                      (pageNumber === currentPage - 2 && currentPage > 3) ||
                      (pageNumber === currentPage + 2 && currentPage < totalPages - 2)
                    ) {
                      return (
                        <span key={pageNumber} className="px-2">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Button>
                </nav>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No products found</h3>
            <p className="text-muted-foreground mb-6">
              {currentSearchQuery
                ? `No products matching "${currentSearchQuery}"`
                : categoryFilter !== "all"
                ? `No products in ${getCategoryName(parseInt(categoryFilter))}`
                : "No products available"}
            </p>
            {currentSearchQuery && (
              <Button onClick={() => setCurrentSearchQuery("")} variant="outline">
                Clear Search
              </Button>
            )}
            {categoryFilter !== "all" && (
              <Button onClick={() => setCategoryFilter("all")} variant="outline" className="ml-2">
                Show All Categories
              </Button>
            )}
          </div>
        )}

        {/* Categories Section */}
        <div className="mt-12 mb-8">
          <h2 className="text-xl font-semibold font-poppins mb-4">Browse by Category</h2>
          {categoriesLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_, index) => (
                <Skeleton key={index} className="h-24 w-full rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {categories.map(category => (
                <div
                  key={category.id}
                  className={`bg-white rounded-xl p-4 text-center shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer ${
                    categoryFilter === category.id.toString() ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleCategoryChange(category.id.toString())}
                >
                  <div className="w-12 h-12 bg-primary-light/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <i className={`${category.icon} text-xl text-primary`}></i>
                  </div>
                  <h3 className="font-medium text-sm">{category.name}</h3>
                </div>
              ))}
              <div
                className={`bg-white rounded-xl p-4 text-center shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer ${
                  categoryFilter === 'all' ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => handleCategoryChange('all')}
              >
                <div className="w-12 h-12 bg-primary-light/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className="ri-apps-line text-xl text-primary"></i>
                </div>
                <h3 className="font-medium text-sm">All Products</h3>
              </div>
            </div>
          )}
        </div>

        {/* Informational Sections */}
        <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
          <h2 className="text-xl font-semibold font-poppins mb-4">Why Choose GreenGrocer?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="w-12 h-12 bg-primary-light/20 rounded-full flex items-center justify-center mb-4">
                <i className="ri-leaf-line text-xl text-primary"></i>
              </div>
              <h3 className="font-semibold mb-2">100% Organic</h3>
              <p className="text-sm text-neutral-600">All our products are certified organic and grown without harmful pesticides or chemicals.</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-primary-light/20 rounded-full flex items-center justify-center mb-4">
                <i className="ri-truck-line text-xl text-primary"></i>
              </div>
              <h3 className="font-semibold mb-2">Farm to Table</h3>
              <p className="text-sm text-neutral-600">We deliver directly from local farms to your doorstep within 24 hours of harvest.</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-primary-light/20 rounded-full flex items-center justify-center mb-4">
                <i className="ri-heart-line text-xl text-primary"></i>
              </div>
              <h3 className="font-semibold mb-2">Support Local Farmers</h3>
              <p className="text-sm text-neutral-600">Your purchases help support sustainable farming practices and local agricultural communities.</p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
