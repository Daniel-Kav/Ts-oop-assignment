// Advanced Library Management System﻿
// Description: Design a system for managing a full-service library, including book lending, user accounts, overdue fines, and digital resources.

// Key Elements:﻿
// LibraryItem (abstract) → base for Book, DVD, EBook

// UserAccount → handles login, borrowing history, fine calculation

// Borrowable Interface → enforces checkOut() and returnItem() for physical items only

// Librarian vs Member (inherit from User)

// Feature: Fine is auto-calculated based on return date

abstract class LibraryItem {
    protected dateCheckedOut: Date | null = null;
    protected maxCheckoutDuration: number = 7; // days
    protected fine: number = 0;
    protected fineRate: number = 0.5; // Fine rate per day
    protected dueDate: Date | null = null;
    protected returnDate: Date | null = null;
    
    constructor(public available :boolean, public title : string){}

    isAvavailable(): boolean {
        console.log( this.available);
        return this.available;
    }

    getFine(): number {
        if (this.returnDate && this.dueDate) {
            const overdueDays = Math.ceil((this.returnDate.getTime() - this.dueDate.getTime()) / (1000 * 3600 * 24));
            if (overdueDays > 0) {
                return overdueDays * this.fineRate;
            }
        }
        return 0;
    }
    setReturnDate(date: Date): void {
        this.dueDate = date;
    }
    

    checkOut(): void {
        if (this.available) {
            this.available = false;
            this.dateCheckedOut = new Date();
            this.dueDate = new Date(this.dateCheckedOut.getTime() + this.maxCheckoutDuration * 24 * 60 * 60 * 1000);
            console.log(`Checked out ${this.title}. Return by ${this.dueDate.toLocaleDateString()}.`);
            // console.log(`${this.title} has been checked out.`);
        } else {
            console.log(`${this.title} is not available for checkout.`);
        }
    }
    returnItem(returnDate: Date): void {
        this.returnDate = returnDate;
        if (this.returnDate && this.dueDate && this.returnDate > this.dueDate) {
            this.fine = this.getFine();
            console.log(`Item is overdue. Fine: $${this.getFine().toFixed(2)}`);
        }
        console.log(`Returned ${this.title} on  ${this.returnDate}.`);
        this.available = true;
        this.dateCheckedOut = null;
    }
}

class Book extends LibraryItem {
    public author: string;
    constructor(isAvailable: boolean,title: string,author: string,){  
            super(isAvailable, title);
            this.author = author;
        }
}

class DVD extends LibraryItem {
    public director: string;
    constructor(isAvailable: boolean,title: string,director: string,){  
            super(isAvailable, title);
            this.director = director;
        }

        
}
// Interface for borrowable items

class EBook extends LibraryItem {
    public fileSize: number;
    constructor(isAvailable: boolean,title: string,fileSize: number,){  
            super(isAvailable, title);
            this.fileSize = fileSize;
        }

    download(): void {
        if (this.available) {
            console.log(`Downloading ${this.title}...`);
        } else {
            console.log(`${this.title} is not available for download.`);
        }
    }

    checkOut(): void {
        console.log(`EBook ${this.title} cannot be checked out in the traditional sense.`);
    }
}

// User Account Class
class User {
    public userName: string;
    protected IsLoggedin: boolean=false;
    public role: "Member" | "Librarian";
    constructor(userName: string, role: "Member" | "Librarian") {
        this.userName = userName;
        this.role = role;

    }
    login(): void {
        this.IsLoggedin = true;
        console.log(`User ${this.userName} logged in.`);
        console.log(`${this.userName} logged in as ${this.role}.`);
    }
    logout(): void {
        this.IsLoggedin = false;
        console.log(`${this.userName} logged out.`);
    }

}

class Member extends User {
    constructor(userName: string) {
        super(userName, "Member");
    }
    borrowItem(item: LibraryItem): void {
        if(this.IsLoggedin){

            
            item.checkOut();
        }
        else{
            console.log(`Please login to borrow items.`);
        }
    }
    returnItem(item: LibraryItem, returnDate: Date): void {
        if(this.IsLoggedin){

            item.returnItem(returnDate);
        }
        else{
            console.log(`Please login to return items.`);
        }
    }

}

const book1 = new Book(true, "The Great Gatsby", "F. Scott Fitzgerald");
book1.isAvavailable();
const user1 = new Member("John Doe");
user1.login();
user1.borrowItem(book1);
user1.logout()
book1.isAvavailable();
user1.login();
user1.returnItem(book1,new Date("2025-10-15"));        

// user1.borrowItem(book1);
// const EBoo1 = new EBook(true, "EBook Title", 5);
// EBoo1.checkOut();