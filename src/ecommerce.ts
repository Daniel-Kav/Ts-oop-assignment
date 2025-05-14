// 2. Advanced E-Commerce System﻿
// Description: Create a multi-vendor e-commerce platform supporting different product types, user roles (admin, customer, seller), discounts, and order tracking.

// Key Elements:﻿
// Product (abstract) → extended by ElectronicProduct, ClothingProduct, FurnitureProduct

// User → extended by Admin, Seller, Customer

// Cart → holds products, calculates total with tax and discount

// Order → links to Shipping, Payment, and Customer

// Strategy Pattern: Discount strategy applied at checkout
abstract class Product {
    public available: boolean = true;
    protected discount: number = 0;
    public tax: number = 0.07; // 7% tax
    public shippingCost: number = 5.00; // flat rate shipping cost
    constructor(public name: string, public price: number, public quantity:number) {}

    isAvailable(): boolean {
        if (this.quantity > 0) {
            this.available = true;
        } else {
            this.available = false;
        }
        console.log(`Product: ${this.name}, Available: ${this.available}`);
        return this.available;
    }
    reduceQuantity(quantity: number): void {
        if (quantity > this.quantity) {
            console.log(`Not enough quantity available for ${this.name}.`);
            return;
        }
        this. quantity -= quantity;
    }


    
}
class ElectronicProduct extends Product {
    constructor(name: string, price: number, quantity:number) {
        super(name, price, quantity);
    }
 
}
class ClothingProduct extends Product {
    constructor(name: string, price: number, quantity:number) {
        super(name, price, quantity);
    }
}
class FurnitureProduct extends Product {
    constructor(name: string, price: number, quantity:number) {
        super(name, price, quantity);
    }
}   
class User {
    protected role: 'customer' | 'admin' | 'seller' = 'customer';
    constructor(public name: string, public email: string) {}
}
class Admin extends User {
    constructor(name: string, email: string) {
        super(name, email);
        this.role = 'admin';
    }
}
class Seller extends User {
    constructor(name: string, email: string) {
        super(name, email);
        this.role = 'seller';
    }
}
class Customer extends User {
    constructor(name: string, email: string) {
        super(name, email);
        this.role = 'customer';
    }
}


class Cart {
    private products: Product[] = [];
    private total: number = 0;
    constructor() {}

    addProduct(product: Product): void {
        if (product.isAvailable()) {
            this.products.push(product);
            this.total += product.price + product.price * product.tax + product.shippingCost;
            console.log(`Added ${product.name} to cart. Total: $${this.total}`);
        } else {
            console.log(`${product.name} is not available.`);
        }
        console.log(this.products)
    }

    getTotal(): number {
        return this.total;
    }
}
class Order {
    constructor(public cart: Cart, public user: User) {}
    placeOrder(): void {


        console.log(`Order placed by ${this.user.name}. Total: $${this.cart.getTotal()}`);
    }
}

// customer
const customer = new Customer("John Doe", "john@gmail.com")
const customer2 = new Customer("Jane Doe", "jane@gmail.com")

const laptop = new ElectronicProduct("Laptop", 1200, 5);
const shirt = new ClothingProduct("Shirt", 20, 10);

const cart1 = new Cart();
const cart2 = new Cart();
cart2.addProduct(shirt);
cart1.addProduct(laptop);

const order = new Order(cart1,customer);
order.placeOrder();

const order2 = new Order(cart2,customer2);
order2.placeOrder();
















