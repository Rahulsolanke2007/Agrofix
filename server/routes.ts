import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, isAdmin } from "./auth";
import { z } from "zod";
import { 
  insertProductSchema, 
  insertOrderSchema, 
  insertOrderItemSchema, 
  insertCartItemSchema,
  OrderStatus
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {

  setupAuth(app);

  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  // Product routes
  app.get("/api/products", async (req, res) => {
    try {
      const { categoryId } = req.query;
      let products;
      
      if (categoryId && !isNaN(Number(categoryId))) {
        products = await storage.getProductsByCategoryId(Number(categoryId));
      } else {
        products = await storage.getAllProducts();
      }
      
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const product = await storage.getProduct(id);
      
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  // Admin product management routes
  // app.post("/api/products", isAdmin, async (req, res) => {
  //   try {
  //     const validationResult = insertProductSchema.safeParse(req.body);
      
  //     if (!validationResult.success) {
  //       return res.status(400).json({ 
  //         error: "Validation failed", 
  //         details: validationResult.error.format() 
  //       });
  //     }
      
  //     const product = await storage.createProduct(validationResult.data);
  //     res.status(201).json(product);
  //   } catch (error) {
  //     res.status(500).json({ error: "Failed to create product" });
  //   }
  // });

app.post("/api/products", isAdmin, async (req, res) => {
  try {
    
    const result = insertProductSchema.safeParse(req.body);

    if (!result.success) {
      
      const errors = result.error.flatten().fieldErrors;
      return res.status(400).json({ 
        error: "Validation failed", 
        errors 
      });
    }

    const validData = result.data;

   
    if (!validData.image) {
      validData.image = "https://example.com/default-product-image.jpg"; // put a proper default image URL
    }

    const newProduct = await storage.createProduct(validData);

    res.status(201).json({
      message: "Product created successfully",
      product: newProduct,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

  app.put("/api/products/:id", isAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const validationResult = insertProductSchema.partial().safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Validation failed", 
          details: validationResult.error.format() 
        });
      }
      
      const product = await storage.updateProduct(id, validationResult.data);
      
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", isAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const success = await storage.deleteProduct(id);
      
      if (!success) {
        return res.status(404).json({ error: "Product not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete product" });
    }
  });

  // Cart routes
  app.get("/api/cart", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as Express.User).id;
      let cart = await storage.getCart(userId);
      
      
      if (!cart) {
        cart = await storage.createCart(userId);
      }
      
      const cartItems = await storage.getCartItems(cart.id);
      
      const cartWithItems = {
        ...cart,
        items: await Promise.all(cartItems.map(async (item) => {
          const product = await storage.getProduct(item.productId);
          return {
            ...item,
            product
          };
        }))
      };
      
      res.json(cartWithItems);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch cart" });
    }
  });

  app.post("/api/cart/items", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as Express.User).id;
      let cart = await storage.getCart(userId);
      
      if (!cart) {
        cart = await storage.createCart(userId);
      }
      
      const cartItemSchema = insertCartItemSchema.omit({ cartId: true }).extend({
        productId: z.number(),
        quantity: z.number().positive()
      });
      
      const validationResult = cartItemSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Validation failed", 
          details: validationResult.error.format() 
        });
      }
      
      const cartItem = await storage.addCartItem({
        cartId: cart.id,
        ...validationResult.data
      });
    
      const product = await storage.getProduct(cartItem.productId);
      
      res.status(201).json({
        ...cartItem,
        product
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to add item to cart" });
    }
  });

  app.put("/api/cart/items/:id", isAuthenticated, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { quantity } = req.body;
      
      if (typeof quantity !== 'number' || quantity < 0) {
        return res.status(400).json({ error: "Invalid quantity" });
      }
      
      const cartItem = await storage.updateCartItem(id, quantity);
      
      if (!cartItem && quantity > 0) {
        return res.status(404).json({ error: "Cart item not found" });
      }
      
      if (quantity === 0) {
        return res.status(204).send();
      }
      
    
      const product = await storage.getProduct(cartItem.productId);
      
      res.json({
        ...cartItem,
        product
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to update cart item" });
    }
  });

  app.delete("/api/cart/items/:id", isAuthenticated, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const success = await storage.removeCartItem(id);
      
      if (!success) {
        return res.status(404).json({ error: "Cart item not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to remove cart item" });
    }
  });

  app.delete("/api/cart", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as Express.User).id;
      const cart = await storage.getCart(userId);
      
      if (cart) {
        await storage.clearCart(cart.id);
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to clear cart" });
    }
  });

  // Favorites routes
  app.get("/api/favorites", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as Express.User).id;
      const favorites = await storage.getUserFavorites(userId);
      
      // Get complete product details for each favorite
      const favoritesWithProducts = await Promise.all(favorites.map(async (fav) => {
        const product = await storage.getProduct(fav.productId);
        return {
          ...fav,
          product
        };
      }));
      
      res.json(favoritesWithProducts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch favorites" });
    }
  });

  app.post("/api/favorites", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as Express.User).id;
      const { productId } = req.body;
      
      if (typeof productId !== 'number') {
        return res.status(400).json({ error: "Invalid product ID" });
      }
      
      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      
      const favorite = await storage.addFavorite({
        userId,
        productId
      });
      
      res.status(201).json({
        ...favorite,
        product
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to add favorite" });
    }
  });

  app.delete("/api/favorites/:id", isAuthenticated, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const success = await storage.removeFavorite(id);
      
      if (!success) {
        return res.status(404).json({ error: "Favorite not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to remove favorite" });
    }
  });

  // Order routes
  app.get("/api/orders", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as Express.User;
      let orders;
      
      if (user.role === 'admin') {
        
        orders = await storage.getAllOrders();
      } else {
        // Customers can only see their own orders
        orders = await storage.getOrdersByUserId(user.id);
      }
      
      const ordersWithItems = await Promise.all(orders.map(async (order) => {
        const items = await storage.getOrderItems(order.id);
        
        const itemsWithProducts = await Promise.all(items.map(async (item) => {
          const product = await storage.getProduct(item.productId);
          return {
            ...item,
            product
          };
        }));
        
        return {
          ...order,
          items: itemsWithProducts
        };
      }));
      
      res.json(ordersWithItems);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:id", isAuthenticated, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const order = await storage.getOrder(id);
      
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      
      const user = req.user as Express.User;
      
      if (user.role !== 'admin' && order.userId !== user.id) {
        return res.status(403).json({ error: "Not authorized to view this order" });
      }
      
      const items = await storage.getOrderItems(order.id);
      
      const itemsWithProducts = await Promise.all(items.map(async (item) => {
        const product = await storage.getProduct(item.productId);
        return {
          ...item,
          product
        };
      }));
      
      res.json({
        ...order,
        items: itemsWithProducts
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch order" });
    }
  });

  app.post("/api/orders", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as Express.User).id;
      
      const cart = await storage.getCart(userId);
      if (!cart) {
        return res.status(400).json({ error: "Cart is empty" });
      }
      
      const cartItems = await storage.getCartItems(cart.id);
      if (cartItems.length === 0) {
        return res.status(400).json({ error: "Cart is empty" });
      }
      
      const orderValidationSchema = insertOrderSchema
        .omit({ userId: true, status: true, subtotal: true, tax: true, total: true })
        .extend({
          deliveryFee: z.number().nonnegative()
        });
      
      const validationResult = orderValidationSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Validation failed", 
          details: validationResult.error.format() 
        });
      }
      
      const orderData = validationResult.data;
      
      let subtotal = 0;
      for (const item of cartItems) {
        const product = await storage.getProduct(item.productId);
        if (!product) {
          return res.status(400).json({ error: `Product with ID ${item.productId} not found` });
        }
        
        if (product.stock < item.quantity) {
          return res.status(400).json({ 
            error: `Not enough stock for ${product.name}. Available: ${product.stock}` 
          });
        }
        
        subtotal += product.price * item.quantity;
      }
      
      const tax = subtotal * 0.10; // 10% tax
      const total = subtotal + tax + orderData.deliveryFee;
    
      const order = await storage.createOrder({
        ...orderData,
        userId,
        status: OrderStatus.PENDING,
        subtotal,
        tax,
        total
      });
      
      for (const item of cartItems) {
        const product = await storage.getProduct(item.productId);
        if (!product) continue;
        
        await storage.addOrderItem({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: product.price,
          totalPrice: product.price * item.quantity
        });
        
        await storage.updateProduct(product.id, {
          stock: product.stock - item.quantity,
          status: product.stock - item.quantity <= 0 
            ? 'out_of_stock' 
            : (product.stock - item.quantity < 10 ? 'low_stock' : 'active')
        });
      }
      
      await storage.clearCart(cart.id);
      
      const items = await storage.getOrderItems(order.id);
      const itemsWithProducts = await Promise.all(items.map(async (item) => {
        const product = await storage.getProduct(item.productId);
        return {
          ...item,
          product
        };
      }));
      
      res.status(201).json({
        ...order,
        items: itemsWithProducts
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to create order" });
    }
  });

  app.put("/api/orders/:id/status", isAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { status, notes } = req.body;
      
      if (!Object.values(OrderStatus).includes(status)) {
        return res.status(400).json({ error: "Invalid order status" });
      }
      
      const order = await storage.updateOrderStatus(id, status, notes);
      
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      
      const items = await storage.getOrderItems(order.id);
      const itemsWithProducts = await Promise.all(items.map(async (item) => {
        const product = await storage.getProduct(item.productId);
        return {
          ...item,
          product
        };
      }));
      
      res.json({
        ...order,
        items: itemsWithProducts
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to update order status" });
    }
  });

  // Admin dashboard statistics
  app.get("/api/admin/stats", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const orders = await storage.getAllOrders();
      const products = await storage.getAllProducts();
      
      const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
      
      let productsSold = 0;
      for (const order of orders) {
        const items = await storage.getOrderItems(order.id);
        productsSold += items.reduce((sum, item) => sum + item.quantity, 0);
      }
      
      res.json({
        customerCount: users.filter((user: any) => user.role === "customer").length,
        orderCount: orders.length,
        totalRevenue,
        productsSold,
        productCount: products.length
      });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).send("Internal server error");
    }
  });

  app.get("/api/admin/orders/recent", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const orders = await storage.getAllOrders();
      const recentOrders = [...orders]
        .sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt) : new Date();
          const dateB = b.createdAt ? new Date(b.createdAt) : new Date();
          return dateB.getTime() - dateA.getTime();
        })
        .slice(0, 5);
      
      res.json(recentOrders);
    } catch (error) {
      console.error("Error fetching recent orders:", error);
      res.status(500).send("Internal server error");
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
