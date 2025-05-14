// ========== 1. PRODUCT HIERARCHY (Inheritance) ==========

abstract class Product {
    constructor(
        public productId: string,
        public name: string,
        public description: string,
        public basePrice: number,
        public sellerId: string,
        public stockQuantity: number,
        public category: string
    ) {}

    abstract getProductDetails(): string;

    calculatePrice(): number {
        return this.basePrice;
    }
}

class ElectronicProduct extends Product {
    constructor(
        productId: string,
        name: string,
        description: string,
        basePrice: number,
        sellerId: string,
        stockQuantity: number,
        public brand: string,
        public model: string,
        public warrantyPeriod: string
    ) {
        super(productId, name, description, basePrice, sellerId, stockQuantity, "Electronics");
    }

    getProductDetails(): string {
        return `Type: Electronic
Name: ${this.name} (Brand: ${this.brand}, Model: ${this.model})
Price: $${this.calculatePrice().toFixed(2)}
Warranty: ${this.warrantyPeriod}
Stock: ${this.stockQuantity}
Seller: ${this.sellerId}`;
    }
}

class ClothingProduct extends Product {
    constructor(
        productId: string,
        name: string,
        description: string,
        basePrice: number,
        sellerId: string,
        stockQuantity: number,
        public size: string,
        public color: string,
        public material: string
    ) {
        super(productId, name, description, basePrice, sellerId, stockQuantity, "Clothing");
    }

    getProductDetails(): string {
        return `Type: Clothing
Name: ${this.name} (Color: ${this.color}, Size: ${this.size})
Price: $${this.calculatePrice().toFixed(2)}
Material: ${this.material}
Stock: ${this.stockQuantity}
Seller: ${this.sellerId}`;
    }
}

class FurnitureProduct extends Product {
    constructor(
        productId: string,
        name: string,
        description: string,
        basePrice: number,
        sellerId: string,
        stockQuantity: number,
        public dimensions: string,
        public material: string,
        public assemblyRequired: boolean
    ) {
        super(productId, name, description, basePrice, sellerId, stockQuantity, "Furniture");
    }

    getProductDetails(): string {
        return `Type: Furniture
Name: ${this.name} (Material: ${this.material})
Price: $${this.calculatePrice().toFixed(2)}
Dimensions: ${this.dimensions}
Assembly Required: ${this.assemblyRequired ? 'Yes' : 'No'}
Stock: ${this.stockQuantity}
Seller: ${this.sellerId}`;
    }
}

// ========== 2. USER HIERARCHY (Inheritance) ==========

class User {
    constructor(
        public userId: string,
        public username: string,
        protected email: string, // Encapsulated, accessible by subclasses
        public firstName: string,
        public lastName: string
    ) {}

    login(): void {
        console.log(`${this.username} logged in.`);
    }

    logout(): void {
        console.log(`${this.username} logged out.`);
    }

    updateProfile(details: { email?: string; firstName?: string; lastName?: string }): void {
        if (details.email) this.email = details.email;
        if (details.firstName) this.firstName = details.firstName;
        if (details.lastName) this.lastName = details.lastName;
        console.log(`${this.username}'s profile updated.`);
    }

    getProfileInfo(): string {
        return `User ID: ${this.userId}, Name: ${this.firstName} ${this.lastName}, Email: ${this.email}`;
    }
}

class Admin extends User {
    constructor(userId: string, username: string, email: string, firstName: string, lastName: string) {
        super(userId, username, email, firstName, lastName);
    }

    manageUsers(): void {
        console.log(`${this.username} (Admin) is managing users.`);
    }

    viewPlatformAnalytics(): void {
        console.log(`${this.username} (Admin) is viewing platform analytics.`);
    }
}

class Seller extends User {
    public products: Product[] = [];
    constructor(
        userId: string,
        username: string,
        email: string,
        firstName: string,
        lastName: string,
        public storeName: string
    ) {
        super(userId, username, email, firstName, lastName);
    }

    addProduct(product: Product, factory: ProductFactory, type: ProductType, attributes: any): Product {
        const newProduct = factory.createProduct(type, { ...attributes, sellerId: this.userId });
        if (newProduct) {
            this.products.push(newProduct);
            console.log(`${this.storeName} (Seller: ${this.username}) added product: ${newProduct.name}`);
            return newProduct;
        }
        throw new Error("Failed to create product via factory for seller.");
    }

    viewSalesReports(): void {
        console.log(`${this.storeName} (Seller: ${this.username}) is viewing sales reports.`);
    }
}

class Customer extends User {
    public shippingAddresses: Address[] = [];
    public orderHistory: Order[] = [];

    constructor(userId: string, username: string, email: string, firstName: string, lastName: string) {
        super(userId, username, email, firstName, lastName);
    }

    addShippingAddress(address: Address): void {
        this.shippingAddresses.push(address);
        console.log(`Shipping address added for ${this.username}.`);
    }

    placeOrder(order: Order): void {
        this.orderHistory.push(order);
        console.log(`${this.username} placed an order (ID: ${order.orderId}).`);
    }
}

// ========== 3. ADDRESS (Helper Class) ==========
class Address {
    constructor(
        public street: string,
        public city: string,
        public state: string,
        public zipCode: string,
        public country: string
    ) {}

    getFullAddress(): string {
        return `${this.street}, ${this.city}, ${this.state} ${this.zipCode}, ${this.country}`;
    }
}


// ========== 4. DISCOUNT STRATEGY PATTERN ==========
interface DiscountStrategy {
    calculateDiscount(itemsValue: number): number;
    getDescription(): string;
}

class NoDiscount implements DiscountStrategy {
    calculateDiscount(_itemsValue: number): number {
        return 0;
    }
    getDescription(): string {
        return "No discount applied.";
    }
}

class PercentageDiscount implements DiscountStrategy {
    constructor(private percentage: number) {
        if (percentage < 0 || percentage > 100) {
            throw new Error("Percentage must be between 0 and 100.");
        }
    }

    calculateDiscount(itemsValue: number): number {
        return itemsValue * (this.percentage / 100);
    }
    getDescription(): string {
        return `${this.percentage}% off.`;
    }
}

class FixedAmountDiscount implements DiscountStrategy {
    constructor(private amount: number) {
        if (amount < 0) {
            throw new Error("Fixed discount amount cannot be negative.");
        }
    }

    calculateDiscount(itemsValue: number): number {
        return Math.min(this.amount, itemsValue); // Cannot discount more than the total
    }
    getDescription(): string {
        return `$${this.amount.toFixed(2)} off.`;
    }
}


// ========== 5. CART (Encapsulation, uses DiscountStrategy) ==========
interface CartItem {
    product: Product;
    quantity: number;
}

class Cart {
    private items: CartItem[] = [];
    private discountStrategy: DiscountStrategy = new NoDiscount(); // Default
    private taxRatePercentage: number = 10; // Example tax rate (10%)

    constructor(public cartId: string, public customerId: string) {}

    addItem(product: Product, quantity: number = 1): void {
        if (quantity <= 0) {
            console.warn("Quantity must be positive.");
            return;
        }
        if (product.stockQuantity < quantity) {
            console.warn(`Not enough stock for ${product.name}. Available: ${product.stockQuantity}`);
            return;
        }

        const existingItem = this.items.find(item => item.product.productId === product.productId);
        if (existingItem) {
            if (product.stockQuantity < existingItem.quantity + quantity) {
                 console.warn(`Not enough stock to add more ${product.name}. Available: ${product.stockQuantity}, In cart: ${existingItem.quantity}`);
                 return;
            }
            existingItem.quantity += quantity;
        } else {
            this.items.push({ product, quantity });
        }
        console.log(`${quantity} x ${product.name} added to cart ${this.cartId}.`);
    }

    removeItem(productId: string): void {
        const itemIndex = this.items.findIndex(item => item.product.productId === productId);
        if (itemIndex > -1) {
            const removedItem = this.items.splice(itemIndex, 1)[0];
            console.log(`${removedItem.product.name} removed from cart ${this.cartId}.`);
        } else {
            console.warn(`Product ID ${productId} not found in cart.`);
        }
    }

    updateQuantity(productId: string, newQuantity: number): void {
        if (newQuantity <= 0) {
            this.removeItem(productId);
            return;
        }
        const item = this.items.find(cartItem => cartItem.product.productId === productId);
        if (item) {
            if (item.product.stockQuantity < newQuantity) {
                console.warn(`Not enough stock for ${item.product.name}. Available: ${item.product.stockQuantity}. Requested: ${newQuantity}`);
                item.quantity = item.product.stockQuantity; // Adjust to max available
            } else {
                item.quantity = newQuantity;
            }
            console.log(`Quantity of ${item.product.name} updated to ${item.quantity} in cart ${this.cartId}.`);
        } else {
            console.warn(`Product ID ${productId} not found in cart for quantity update.`);
        }
    }

    setDiscountStrategy(strategy: DiscountStrategy): void {
        this.discountStrategy = strategy;
        console.log(`Discount strategy set to: ${strategy.getDescription()}`);
    }

    calculateSubtotal(): number {
        return this.items.reduce((sum, item) => sum + item.product.calculatePrice() * item.quantity, 0);
    }

    calculateDiscountAmount(): number {
        const subtotal = this.calculateSubtotal();
        return this.discountStrategy.calculateDiscount(subtotal);
    }

    calculateTax(): number {
        const subtotalAfterDiscount = this.calculateSubtotal() - this.calculateDiscountAmount();
        return subtotalAfterDiscount * (this.taxRatePercentage / 100);
    }

    calculateTotal(): number {
        const subtotal = this.calculateSubtotal();
        const discount = this.calculateDiscountAmount();
        const totalAfterDiscount = subtotal - discount;
        const tax = totalAfterDiscount * (this.taxRatePercentage / 100); // Tax on discounted price
        return totalAfterDiscount + tax;
    }

    viewCart(): void {
        console.log(`\n--- Cart ID: ${this.cartId} (Customer: ${this.customerId}) ---`);
        if (this.items.length === 0) {
            console.log("Cart is empty.");
            return;
        }
        this.items.forEach(item => {
            console.log(`- ${item.product.name} (ID: ${item.product.productId}) x ${item.quantity} @ $${item.product.calculatePrice().toFixed(2)} each`);
        });
        const subtotal = this.calculateSubtotal();
        const discount = this.calculateDiscountAmount();
        const tax = this.calculateTax(); // Tax is calculated on subtotal - discount
        const total = this.calculateTotal();

        console.log(`Subtotal: $${subtotal.toFixed(2)}`);
        console.log(`Discount (${this.discountStrategy.getDescription()}): -$${discount.toFixed(2)}`);
        console.log(`Tax (${this.taxRatePercentage}%): +$${tax.toFixed(2)}`);
        console.log(`TOTAL: $${total.toFixed(2)}`);
        console.log(`------------------------------------`);
    }

    getItems(): Readonly<CartItem[]> { // Readonly access to items for order creation
        return this.items;
    }

    clearCart(): void {
        this.items = [];
        this.discountStrategy = new NoDiscount();
        console.log(`Cart ${this.cartId} cleared.`);
    }
}


// ========== 6. PAYMENT METHOD (Polymorphism) ==========
interface PaymentMethod {
    paymentType: string;
    processPayment(amount: number): PaymentTransaction; // Returns a transaction object
}

class CreditCardPayment implements PaymentMethod {
    paymentType = "CreditCard";
    constructor(private cardNumber: string, private expiryDate: string, private cvv: string) {}

    processPayment(amount: number): PaymentTransaction {
        console.log(`Processing Credit Card payment of $${amount.toFixed(2)} with card ending ${this.cardNumber.slice(-4)}.`);
        // Simulate payment processing
        const success = Math.random() > 0.1; // 90% success rate
        return new PaymentTransaction(
            `txn_${Date.now()}`,
            this.paymentType,
            amount,
            success ? "Completed" : "Failed",
            new Date()
        );
    }
}

class WalletPayment implements PaymentMethod {
    paymentType = "Wallet";
    constructor(private walletId: string, private balance: number) {}

    processPayment(amount: number): PaymentTransaction {
        console.log(`Processing Wallet payment of $${amount.toFixed(2)} from wallet ${this.walletId}.`);
        if (this.balance >= amount) {
            this.balance -= amount;
            console.log(`Deducted $${amount.toFixed(2)}. New wallet balance: $${this.balance.toFixed(2)}.`);
            return new PaymentTransaction(
                `txn_${Date.now()}`,
                this.paymentType,
                amount,
                "Completed",
                new Date()
            );
        } else {
            console.error("Wallet payment failed: Insufficient balance.");
            return new PaymentTransaction(
                `txn_${Date.now()}`,
                this.paymentType,
                amount,
                "Failed",
                new Date(),
                "Insufficient balance"
            );
        }
    }
}

class CashOnDelivery implements PaymentMethod {
    paymentType = "CashOnDelivery";
    processPayment(amount: number): PaymentTransaction {
        console.log(`Payment of $${amount.toFixed(2)} will be collected upon delivery (COD).`);
        // COD is typically marked as pending until delivery
        return new PaymentTransaction(
            `txn_${Date.now()}`,
            this.paymentType,
            amount,
            "Pending - COD",
            new Date()
        );
    }
}

// ========== 7. PAYMENT TRANSACTION (Entity) ==========
class PaymentTransaction {
    constructor(
        public transactionId: string,
        public paymentMethodType: string,
        public amount: number,
        public status: "Pending" | "Completed" | "Failed" | "Pending - COD",
        public paymentDate: Date,
        public failureReason?: string
    ) {}

    getDetails(): string {
        let details = `Transaction ID: ${this.transactionId}, Method: ${this.paymentMethodType}, Amount: $${this.amount.toFixed(2)}, Status: ${this.status}, Date: ${this.paymentDate.toLocaleString()}`;
        if (this.failureReason) {
            details += `, Reason: ${this.failureReason}`;
        }
        return details;
    }
}


// ========== 8. SHIPPING ==========
class Shipping {
    public trackingNumber?: string;
    public carrier?: string;
    public estimatedDeliveryDate?: Date;
    public actualDeliveryDate?: Date;

    constructor(
        public shippingId: string,
        public orderId: string,
        public shippingAddress: Address,
        public shippingMethod: "Standard" | "Express",
        public shippingCost: number
    ) {}

    updateTrackingInfo(trackingNumber: string, carrier: string, estimatedDelivery: Date): void {
        this.trackingNumber = trackingNumber;
        this.carrier = carrier;
        this.estimatedDeliveryDate = estimatedDelivery;
        console.log(`Order ${this.orderId}: Shipping tracking updated - ${carrier} #${trackingNumber}, ETA: ${estimatedDelivery.toLocaleDateString()}`);
    }

    markAsDelivered(): void {
        this.actualDeliveryDate = new Date();
        console.log(`Order ${this.orderId}: Marked as delivered on ${this.actualDeliveryDate.toLocaleDateString()}`);
    }

    getShippingDetails(): string {
        let details = `Shipping ID: ${this.shippingId} for Order ${this.orderId}
Method: ${this.shippingMethod}, Cost: $${this.shippingCost.toFixed(2)}
Address: ${this.shippingAddress.getFullAddress()}`;
        if (this.trackingNumber) {
            details += `\nTracking: ${this.carrier} #${this.trackingNumber}`;
            if (this.estimatedDeliveryDate) details += `, ETA: ${this.estimatedDeliveryDate.toLocaleDateString()}`;
        }
        if (this.actualDeliveryDate) details += `\nDelivered On: ${this.actualDeliveryDate.toLocaleDateString()}`;
        return details;
    }
}


// ========== 9. ORDER ==========
interface OrderItem {
    product: Product; // A snapshot or reference; consider storing price at time of order
    quantity: number;
    pricePerUnit: number; // Price at the time of purchase
}

class Order {
    public orderStatus: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled" = "Pending";
    public sellerIds: Set<string> = new Set(); // To track multiple sellers in one order

    constructor(
        public orderId: string,
        public customer: Customer,
        public items: OrderItem[],
        public totalAmount: number, // Final amount after discounts and tax
        public discountApplied: number,
        public taxAmount: number,
        public shippingInfo: Shipping,
        public paymentTransaction: PaymentTransaction // Link to payment
    ) {
        items.forEach(item => this.sellerIds.add(item.product.sellerId));
    }

    updateStatus(newStatus: "Processing" | "Shipped" | "Delivered" | "Cancelled"): void {
        this.orderStatus = newStatus;
        console.log(`Order ${this.orderId} status updated to: ${newStatus}`);
        if (newStatus === "Shipped" && this.shippingInfo) {
            this.shippingInfo.updateTrackingInfo(`TRK${Date.now()}`, "GlobalShip", new Date(Date.now() + 5 * 24 * 60 * 60 * 1000));
        }
        if (newStatus === "Delivered" && this.shippingInfo) {
            this.shippingInfo.markAsDelivered();
        }
    }

    getOrderDetails(): string {
        let details = `\n--- Order ID: ${this.orderId} ---
Customer: ${this.customer.username} (ID: ${this.customer.userId})
Status: ${this.orderStatus}
Date: ${this.paymentTransaction.paymentDate.toLocaleString()}
Items:`;
        this.items.forEach(item => {
            details += `\n  - ${item.product.name} x ${item.quantity} @ $${item.pricePerUnit.toFixed(2)} each (Seller: ${item.product.sellerId})`;
        });
        details += `\nSubtotal (sum of items): $${(this.totalAmount - this.taxAmount + this.discountApplied).toFixed(2)}`;
        details += `\nDiscount Applied: -$${this.discountApplied.toFixed(2)}`;
        details += `\nTax Amount: +$${this.taxAmount.toFixed(2)}`;
        details += `\nTotal Amount Paid: $${this.totalAmount.toFixed(2)}`;
        details += `\nPayment: ${this.paymentTransaction.getDetails()}`;
        details += `\nShipping: ${this.shippingInfo.getShippingDetails()}`;
        details += `\nSellers Involved: ${Array.from(this.sellerIds).join(', ')}`;
        details += `\n--------------------------`;
        return details;
    }
}


// ========== 10. PRODUCT FACTORY PATTERN ==========
type ProductType = "electronic" | "clothing" | "furniture";

interface ProductAttributes {
    productId: string;
    name: string;
    description: string;
    basePrice: number;
    sellerId: string; // This will often be set by the system/seller context
    stockQuantity: number;
    // Type-specific attributes
    brand?: string;
    model?: string;
    warrantyPeriod?: string;
    size?: string;
    color?: string;
    material?: string; // Can be for clothing or furniture
    dimensions?: string;
    assemblyRequired?: boolean;
}

class ProductFactory {
    public createProduct(type: ProductType, attrs: ProductAttributes): Product | null {
        switch (type) {
            case "electronic":
                if (!attrs.brand || !attrs.model || !attrs.warrantyPeriod) {
                    console.error("Missing attributes for ElectronicProduct");
                    return null;
                }
                return new ElectronicProduct(
                    attrs.productId, attrs.name, attrs.description, attrs.basePrice,
                    attrs.sellerId, attrs.stockQuantity, attrs.brand, attrs.model, attrs.warrantyPeriod
                );
            case "clothing":
                if (!attrs.size || !attrs.color || !attrs.material) {
                    console.error("Missing attributes for ClothingProduct");
                    return null;
                }
                return new ClothingProduct(
                    attrs.productId, attrs.name, attrs.description, attrs.basePrice,
                    attrs.sellerId, attrs.stockQuantity, attrs.size, attrs.color, attrs.material
                );
            case "furniture":
                if (!attrs.dimensions || !attrs.material || attrs.assemblyRequired === undefined) {
                    console.error("Missing attributes for FurnitureProduct");
                    return null;
                }
                return new FurnitureProduct(
                    attrs.productId, attrs.name, attrs.description, attrs.basePrice,
                    attrs.sellerId, attrs.stockQuantity, attrs.dimensions, attrs.material, attrs.assemblyRequired
                );
            default:
                console.error(`Unknown product type: ${type}`);
                return null;
        }
    }
}


// ========== SAMPLE USAGE ==========
console.log("===== E-Commerce System Initialization =====\n");

// --- 1. Create Users ---
const adminUser = new Admin("admin001", "SuperAdmin", "admin@example.com", "System", "Administrator");
const seller1 = new Seller("seller001", "TechGizmo", "tech@gizmo.com", "John", "Doe", "TechGizmo Store");
const seller2 = new Seller("seller002", "FashionHub", "fashion@hub.com", "Jane", "Smith", "FashionHub Boutique");
const customer1 = new Customer("cust001", "AliceC", "alice@example.com", "Alice", "Wonder");

adminUser.login();
seller1.login();
customer1.login();
console.log(customer1.getProfileInfo());
console.log("\n");

// --- 2. Create Product Factory ---
const productFactory = new ProductFactory();

// --- 3. Sellers Add Products (using Factory) ---
console.log("===== Sellers Adding Products =====");
const laptop = seller1.addProduct(
    null as any, // Placeholder, as factory creates the actual product instance
    productFactory,
    "electronic",
    {
        productId: "E001", name: "UltraBook Pro", description: "High-end laptop", basePrice: 1200, stockQuantity: 50,
        brand: "TechBrand", model: "X1 Pro", warrantyPeriod: "2 years"
    }
);

const tShirt = seller2.addProduct(null as any, productFactory, "clothing", {
    productId: "C001", name: "Cotton T-Shirt", description: "Comfortable cotton t-shirt", basePrice: 25, stockQuantity: 200,
    size: "M", color: "Blue", material: "Cotton"
});

const desk = seller1.addProduct(null as any, productFactory, "furniture", {
    productId: "F001", name: "Standing Desk", description: "Ergonomic standing desk", basePrice: 350, stockQuantity: 30,
    dimensions: "120x60x75-110cm", material: "Wood/Steel", assemblyRequired: true
});

if (laptop) console.log(laptop.getProductDetails());
if (tShirt) console.log(tShirt.getProductDetails());
if (desk) console.log(desk.getProductDetails());
console.log("\n");


// --- 4. Customer Interaction & Cart ---
console.log("===== Customer Cart Interaction =====");
const customerCart = new Cart("cart001", customer1.userId);

if (laptop) customerCart.addItem(laptop, 1);
if (tShirt) customerCart.addItem(tShirt, 2);
if (desk) customerCart.addItem(desk, 1); // Customer buys from seller1 again

customerCart.viewCart();

// Apply a discount
customerCart.setDiscountStrategy(new PercentageDiscount(10)); // 10% off
customerCart.viewCart();

customerCart.updateQuantity("C001", 3); // Update T-Shirt quantity
customerCart.removeItem("E001"); // Remove Laptop
customerCart.viewCart();


// Apply a different discount
customerCart.setDiscountStrategy(new FixedAmountDiscount(50));
customerCart.viewCart();
console.log("\n");

// --- 5. Checkout Process ---
console.log("===== Checkout Process =====");
// Customer adds shipping address
const shippingAddr = new Address("123 Main St", "Techville", "CA", "90210", "USA");
customer1.addShippingAddress(shippingAddr);

// Get cart details for order
const cartItemsForOrder = customerCart.getItems();
const orderSubtotal = customerCart.calculateSubtotal();
const orderDiscount = customerCart.calculateDiscountAmount();
const orderTax = customerCart.calculateTax();
const orderTotal = customerCart.calculateTotal();

if (cartItemsForOrder.length === 0) {
    console.log("Cart is empty. Cannot proceed to checkout.");
} else {
    // Choose Payment Method (Polymorphism)
    let paymentMethod: PaymentMethod;
    // paymentMethod = new CreditCardPayment("1234-5678-9012-3456", "12/28", "123");
    paymentMethod = new WalletPayment("walletAlice123", 200); // Alice has $200 in her wallet

    const paymentTransaction = paymentMethod.processPayment(orderTotal);
    console.log(paymentTransaction.getDetails());

    if (paymentTransaction.status === "Completed" || paymentTransaction.status === "Pending - COD") {
        // Create Shipping Info
        const shippingDetails = new Shipping("ship001", `order_${Date.now()}`, shippingAddr, "Standard", 15.00);

        // Create Order Items (snapshotting price)
        const orderItems: OrderItem[] = cartItemsForOrder.map(ci => ({
            product: ci.product,
            quantity: ci.quantity,
            pricePerUnit: ci.product.calculatePrice() // Price at time of order
        }));

        // Create Order
        const newOrder = new Order(
            `order_${Date.now()}`,
            customer1,
            orderItems,
            orderTotal,
            orderDiscount,
            orderTax,
            shippingDetails,
            paymentTransaction
        );

        // Link order to customer
        customer1.placeOrder(newOrder);

        // Update product stock (simplified)
        newOrder.items.forEach(orderItem => {
            const productInSystem = [laptop, tShirt, desk].find(p => p?.productId === orderItem.product.productId);
            if (productInSystem) {
                productInSystem.stockQuantity -= orderItem.quantity;
            }
        });

        // Clear cart
        customerCart.clearCart();

        console.log(newOrder.getOrderDetails());

        // Simulate order progression
        newOrder.updateStatus("Processing");
        if (paymentTransaction.status !== "Pending - COD") { // COD ships before payment "completion"
             newOrder.updateStatus("Shipped");
        }
        // Simulate delivery later 
        // setTimeout(() => {
        //     newOrder.updateStatus("Delivered");
        //     console.log(newOrder.getOrderDetails());
        // }, 2000); // Simulate 2 seconds for delivery update

    } else {
        console.error("Order placement failed due to payment failure.");
    }
}
console.log("\n");

// --- 6. Admin Overview (Simple Demo) ---
console.log("===== Admin Overview =====");
adminUser.manageUsers();
adminUser.viewPlatformAnalytics();
console.log("All Products in System (from Seller's perspective for simplicity):");
const allProducts: Product[] = [];
[seller1, seller2].forEach(s => allProducts.push(...s.products));

if (allProducts.length > 0) {
    allProducts.forEach(p => {
        if (p) console.log(`- ${p.name} (ID: ${p.productId}), Stock: ${p.stockQuantity}, Seller: ${p.sellerId}`);
    });
} else {
    console.log("No products found in the system.");
}

console.log("\nCustomer Order History:");
customer1.orderHistory.forEach(order => console.log(order.getOrderDetails()));

console.log("\n===== E-Commerce System Demo End =====\n");

// --- Verify stock changes ---
console.log("===== Stock Verification After Order =====");
if (tShirt) console.log(`${tShirt.name} stock: ${tShirt.stockQuantity}`); // Should be 200 - 3 = 197
if (desk) console.log(`${desk.name} stock: ${desk.stockQuantity}`);   // Should be 30 - 1 = 29
if (laptop) console.log(`${laptop.name} stock: ${laptop.stockQuantity}`); // Laptop was removed from cart, stock should be original 50