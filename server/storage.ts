import { 
  users, User, InsertUser, 
  products, Product, InsertProduct,
  categories, Category, InsertCategory,
  orders, Order, InsertOrder,
  orderItems, OrderItem, InsertOrderItem,
  orderStatusHistory,
  carts, Cart, InsertCart,
  cartItems, CartItem, InsertCartItem,
  favorites, Favorite, InsertFavorite
} from "@shared/schema";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { db, pool } from "./db";
import { eq, and, count } from "drizzle-orm";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // Users
  getAllUsers(): Promise<User[]>;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;

  // Categories
  getAllCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;

  // Products
  getAllProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  getProductsByCategoryId(categoryId: number): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;

  // Orders
  getAllOrders(): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  getOrdersByUserId(userId: number): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string, notes?: string): Promise<Order | undefined>;
  
  // Order Items
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  addOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  
  // Cart
  getCart(userId: number): Promise<Cart | undefined>;
  createCart(userId: number): Promise<Cart>;
  getCartItems(cartId: number): Promise<CartItem[]>;
  addCartItem(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, quantity: number): Promise<CartItem | undefined>;
  removeCartItem(id: number): Promise<boolean>;
  clearCart(cartId: number): Promise<boolean>;
  
  // Favorites
  getUserFavorites(userId: number): Promise<Favorite[]>;
  addFavorite(favorite: InsertFavorite): Promise<Favorite>;
  removeFavorite(id: number): Promise<boolean>;
  
  // Session store
  sessionStore: any; // Using 'any' for session store to avoid typing issues
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private products: Map<number, Product>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  private orderStatusHistory: Map<number, typeof orderStatusHistory.$inferSelect>;
  private carts: Map<number, Cart>;
  private cartItems: Map<number, CartItem>;
  private favorites: Map<number, Favorite>;
  
  private currentUserId: number;
  private currentCategoryId: number;
  private currentProductId: number;
  private currentOrderId: number;
  private currentOrderItemId: number;
  private currentOrderStatusHistoryId: number;
  private currentCartId: number;
  private currentCartItemId: number;
  private currentFavoriteId: number;
  
  sessionStore: any;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.products = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.orderStatusHistory = new Map();
    this.carts = new Map();
    this.cartItems = new Map();
    this.favorites = new Map();
    
    this.currentUserId = 1;
    this.currentCategoryId = 1;
    this.currentProductId = 1;
    this.currentOrderId = 1;
    this.currentOrderItemId = 1;
    this.currentOrderStatusHistoryId = 1;
    this.currentCartId = 1;
    this.currentCartItemId = 1;
    this.currentFavoriteId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 hours
    });
    
    // Initialize with some default categories
    this.createCategory({ name: "Vegetables", icon: "ri-leaf-line" });
    this.createCategory({ name: "Fruits", icon: "ri-apple-line" });
    this.createCategory({ name: "Organic", icon: "ri-seedling-line" });
    this.createCategory({ name: "Fresh Herbs", icon: "ri-plant-line" });
    this.createCategory({ name: "Dairy", icon: "ri-cup-line" });
  }

  // User methods
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const createdAt = new Date();
    const user: User = { ...insertUser, id, createdAt };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Category methods
  async getAllCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }
  
  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }
  
  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.currentCategoryId++;
    const newCategory: Category = { ...category, id };
    this.categories.set(id, newCategory);
    return newCategory;
  }
  
  async updateCategory(id: number, categoryData: Partial<InsertCategory>): Promise<Category | undefined> {
    const category = await this.getCategory(id);
    if (!category) return undefined;
    
    const updatedCategory = { ...category, ...categoryData };
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }
  
  async deleteCategory(id: number): Promise<boolean> {
    return this.categories.delete(id);
  }
  
  // Product methods
  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }
  
  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }
  
  async getProductsByCategoryId(categoryId: number): Promise<Product[]> {
    return Array.from(this.products.values()).filter(product => product.categoryId === categoryId);
  }
  
  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.currentProductId++;
    const now = new Date();
    const newProduct: Product = { 
      ...product, 
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.products.set(id, newProduct);
    return newProduct;
  }
  
  async updateProduct(id: number, productData: Partial<InsertProduct>): Promise<Product | undefined> {
    const product = await this.getProduct(id);
    if (!product) return undefined;
    
    const updatedProduct = { 
      ...product, 
      ...productData, 
      updatedAt: new Date() 
    };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }
  
  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }
  
  // Order methods
  async getAllOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }
  
  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }
  
  async getOrdersByUserId(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(order => order.userId === userId);
  }
  
  async createOrder(order: InsertOrder): Promise<Order> {
    const id = this.currentOrderId++;
    const now = new Date();
    const newOrder: Order = { 
      ...order, 
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.orders.set(id, newOrder);
    
    // Add order status history entry
    this.orderStatusHistory.set(this.currentOrderStatusHistoryId++, {
      id: this.currentOrderStatusHistoryId,
      orderId: id,
      status: order.status,
      timestamp: now,
      notes: 'Order created'
    });
    
    return newOrder;
  }
  
  async updateOrderStatus(id: number, status: string, notes?: string): Promise<Order | undefined> {
    const order = await this.getOrder(id);
    if (!order) return undefined;
    
    const now = new Date();
    const updatedOrder = { 
      ...order, 
      status, 
      updatedAt: now 
    };
    this.orders.set(id, updatedOrder);
    
    // Add status history entry
    this.orderStatusHistory.set(this.currentOrderStatusHistoryId++, {
      id: this.currentOrderStatusHistoryId,
      orderId: id,
      status,
      timestamp: now,
      notes
    });
    
    return updatedOrder;
  }
  
  // Order Items methods
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values()).filter(item => item.orderId === orderId);
  }
  
  async addOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const id = this.currentOrderItemId++;
    const newOrderItem: OrderItem = { ...orderItem, id };
    this.orderItems.set(id, newOrderItem);
    return newOrderItem;
  }
  
  // Cart methods
  async getCart(userId: number): Promise<Cart | undefined> {
    return Array.from(this.carts.values()).find(cart => cart.userId === userId);
  }
  
  async createCart(userId: number): Promise<Cart> {
    const id = this.currentCartId++;
    const now = new Date();
    const newCart: Cart = { 
      id, 
      userId,
      updatedAt: now 
    };
    this.carts.set(id, newCart);
    return newCart;
  }
  
  async getCartItems(cartId: number): Promise<CartItem[]> {
    return Array.from(this.cartItems.values()).filter(item => item.cartId === cartId);
  }
  
  async addCartItem(cartItem: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const existingItem = Array.from(this.cartItems.values()).find(
      item => item.cartId === cartItem.cartId && item.productId === cartItem.productId
    );
    
    if (existingItem) {
      // Update quantity of existing item
      return this.updateCartItem(existingItem.id, existingItem.quantity + cartItem.quantity) as Promise<CartItem>;
    }
    
    // Add new item
    const id = this.currentCartItemId++;
    const newCartItem: CartItem = { ...cartItem, id };
    this.cartItems.set(id, newCartItem);
    
    // Update the cart updated_at timestamp
    const cart = await this.carts.get(cartItem.cartId);
    if (cart) {
      this.carts.set(cartItem.cartId, { ...cart, updatedAt: new Date() });
    }
    
    return newCartItem;
  }
  
  async updateCartItem(id: number, quantity: number): Promise<CartItem | undefined> {
    const cartItem = this.cartItems.get(id);
    if (!cartItem) return undefined;
    
    if (quantity <= 0) {
      return this.removeCartItem(id) ? undefined : cartItem;
    }
    
    const updatedItem: CartItem = { ...cartItem, quantity };
    this.cartItems.set(id, updatedItem);
    
    // Update the cart updated_at timestamp
    const cart = await this.carts.get(cartItem.cartId);
    if (cart) {
      this.carts.set(cartItem.cartId, { ...cart, updatedAt: new Date() });
    }
    
    return updatedItem;
  }
  
  async removeCartItem(id: number): Promise<boolean> {
    const cartItem = this.cartItems.get(id);
    if (cartItem) {
      // Update the cart updated_at timestamp
      const cart = await this.carts.get(cartItem.cartId);
      if (cart) {
        this.carts.set(cartItem.cartId, { ...cart, updatedAt: new Date() });
      }
    }
    
    return this.cartItems.delete(id);
  }
  
  async clearCart(cartId: number): Promise<boolean> {
    const itemsToRemove = Array.from(this.cartItems.values())
      .filter(item => item.cartId === cartId)
      .map(item => item.id);
      
    itemsToRemove.forEach(id => this.cartItems.delete(id));
    
    // Update the cart updated_at timestamp
    const cart = await this.carts.get(cartId);
    if (cart) {
      this.carts.set(cartId, { ...cart, updatedAt: new Date() });
    }
    
    return true;
  }
  
  // Favorites methods
  async getUserFavorites(userId: number): Promise<Favorite[]> {
    return Array.from(this.favorites.values()).filter(fav => fav.userId === userId);
  }
  
  async addFavorite(favorite: InsertFavorite): Promise<Favorite> {
    // Check if already exists
    const existing = Array.from(this.favorites.values()).find(
      fav => fav.userId === favorite.userId && fav.productId === favorite.productId
    );
    
    if (existing) {
      return existing;
    }
    
    const id = this.currentFavoriteId++;
    const now = new Date();
    const newFavorite: Favorite = { ...favorite, id, createdAt: now };
    this.favorites.set(id, newFavorite);
    return newFavorite;
  }
  
  async removeFavorite(id: number): Promise<boolean> {
    return this.favorites.delete(id);
  }
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ pool, createTableIfMissing: true });
  }

  // User methods
  async getAllUsers(): Promise<User[]> {
    return db.select().from(users);
  }
  
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser || undefined;
  }

  // Category methods
  async getAllCategories(): Promise<Category[]> {
    return db.select().from(categories);
  }
  
  async getCategory(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category || undefined;
  }
  
  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }
  
  async updateCategory(id: number, categoryData: Partial<InsertCategory>): Promise<Category | undefined> {
    const [updatedCategory] = await db
      .update(categories)
      .set(categoryData)
      .where(eq(categories.id, id))
      .returning();
    return updatedCategory || undefined;
  }
  
  async deleteCategory(id: number): Promise<boolean> {
    const result = await db.delete(categories).where(eq(categories.id, id));
    return !!result;
  }
  
  // Product methods
  async getAllProducts(): Promise<Product[]> {
    return db.select().from(products);
  }
  
  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }
  
  async getProductsByCategoryId(categoryId: number): Promise<Product[]> {
    return db.select().from(products).where(eq(products.categoryId, categoryId));
  }
  
  async createProduct(product: InsertProduct): Promise<Product> {
    const now = new Date();
    const [newProduct] = await db
      .insert(products)
      .values({
        ...product,
        createdAt: now,
        updatedAt: now
      })
      .returning();
    return newProduct;
  }
  
  async updateProduct(id: number, productData: Partial<InsertProduct>): Promise<Product | undefined> {
    const [updatedProduct] = await db
      .update(products)
      .set({
        ...productData,
        updatedAt: new Date()
      })
      .where(eq(products.id, id))
      .returning();
    return updatedProduct || undefined;
  }
  
  async deleteProduct(id: number): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id));
    return !!result;
  }
  
  // Order methods
  async getAllOrders(): Promise<Order[]> {
    return db.select().from(orders);
  }
  
  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order || undefined;
  }
  
  async getOrdersByUserId(userId: number): Promise<Order[]> {
    return db.select().from(orders).where(eq(orders.userId, userId));
  }
  
  async createOrder(order: InsertOrder): Promise<Order> {
    const now = new Date();
    const [newOrder] = await db
      .insert(orders)
      .values({
        ...order,
        createdAt: now,
        updatedAt: now
      })
      .returning();
    
    // Add order status history entry
    await db.insert(orderStatusHistory).values({
      orderId: newOrder.id,
      status: order.status,
      timestamp: now,
      notes: 'Order created'
    });
    
    return newOrder;
  }
  
  async updateOrderStatus(id: number, status: string, notes?: string): Promise<Order | undefined> {
    const now = new Date();
    const [updatedOrder] = await db
      .update(orders)
      .set({
        status,
        updatedAt: now
      })
      .where(eq(orders.id, id))
      .returning();
    
    if (updatedOrder) {
      // Add status history entry
      await db.insert(orderStatusHistory).values({
        orderId: id,
        status,
        timestamp: now,
        notes: notes || undefined
      });
    }
    
    return updatedOrder || undefined;
  }
  
  // Order Items methods
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }
  
  async addOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const [newOrderItem] = await db.insert(orderItems).values(orderItem).returning();
    return newOrderItem;
  }
  
  // Cart methods
  async getCart(userId: number): Promise<Cart | undefined> {
    const [cart] = await db.select().from(carts).where(eq(carts.userId, userId));
    return cart || undefined;
  }
  
  async createCart(userId: number): Promise<Cart> {
    const [newCart] = await db
      .insert(carts)
      .values({
        userId,
        updatedAt: new Date()
      })
      .returning();
    return newCart;
  }
  
  async getCartItems(cartId: number): Promise<CartItem[]> {
    return db.select().from(cartItems).where(eq(cartItems.cartId, cartId));
  }
  
  async addCartItem(cartItem: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const [existingItem] = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.cartId, cartItem.cartId),
          eq(cartItems.productId, cartItem.productId)
        )
      );
    
    if (existingItem) {
      // Update quantity of existing item
      return await this.updateCartItem(existingItem.id, existingItem.quantity + cartItem.quantity) as CartItem;
    }
    
    // Add new item
    const [newCartItem] = await db.insert(cartItems).values(cartItem).returning();
    
    // Update the cart updated_at timestamp
    await db
      .update(carts)
      .set({ updatedAt: new Date() })
      .where(eq(carts.id, cartItem.cartId));
    
    return newCartItem;
  }
  
  async updateCartItem(id: number, quantity: number): Promise<CartItem | undefined> {
    if (quantity <= 0) {
      const success = await this.removeCartItem(id);
      return undefined;
    }
    
    const [cartItem] = await db
      .select()
      .from(cartItems)
      .where(eq(cartItems.id, id));
    
    if (!cartItem) return undefined;
    
    const [updatedItem] = await db
      .update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, id))
      .returning();
    
    // Update the cart updated_at timestamp
    await db
      .update(carts)
      .set({ updatedAt: new Date() })
      .where(eq(carts.id, cartItem.cartId));
    
    return updatedItem || undefined;
  }
  
  async removeCartItem(id: number): Promise<boolean> {
    const [cartItem] = await db
      .select()
      .from(cartItems)
      .where(eq(cartItems.id, id));
    
    if (cartItem) {
      // Update the cart updated_at timestamp
      await db
        .update(carts)
        .set({ updatedAt: new Date() })
        .where(eq(carts.id, cartItem.cartId));
    }
    
    const result = await db.delete(cartItems).where(eq(cartItems.id, id));
    return !!result;
  }
  
  async clearCart(cartId: number): Promise<boolean> {
    const result = await db.delete(cartItems).where(eq(cartItems.cartId, cartId));
    
    // Update the cart updated_at timestamp
    await db
      .update(carts)
      .set({ updatedAt: new Date() })
      .where(eq(carts.id, cartId));
    
    return true;
  }
  
  // Favorites methods
  async getUserFavorites(userId: number): Promise<Favorite[]> {
    return db.select().from(favorites).where(eq(favorites.userId, userId));
  }
  
  async addFavorite(favorite: InsertFavorite): Promise<Favorite> {
    // Check if already exists
    const [existing] = await db
      .select()
      .from(favorites)
      .where(
        and(
          eq(favorites.userId, favorite.userId),
          eq(favorites.productId, favorite.productId)
        )
      );
    
    if (existing) {
      return existing;
    }
    
    const [newFavorite] = await db
      .insert(favorites)
      .values({
        ...favorite,
        createdAt: new Date()
      })
      .returning();
    
    return newFavorite;
  }
  
  async removeFavorite(id: number): Promise<boolean> {
    const result = await db.delete(favorites).where(eq(favorites.id, id));
    return !!result;
  }
}

// Initialize the database with default categories
async function seedDefaultCategories() {
  const categoryCount = await db.select().from(categories);
  
  if (categoryCount.length === 0) {
    await db.insert(categories).values([
      { name: "Vegetables", icon: "ri-leaf-line" },
      { name: "Fruits", icon: "ri-apple-line" },
      { name: "Organic", icon: "ri-seedling-line" },
      { name: "Fresh Herbs", icon: "ri-plant-line" },
      { name: "Dairy", icon: "ri-cup-line" }
    ]);
  }
}

// Create the database storage
export const storage = new DatabaseStorage();

// Seed default data
seedDefaultCategories().catch(console.error);
