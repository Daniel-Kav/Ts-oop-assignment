// ========== 1. LIBRARY ITEM HIERARCHY (Abstraction, Inheritance, Polymorphism) ==========

abstract class LibraryItem {
    constructor(
        public itemId: string,
        public title: string,
        public subject: string,
        public publicationDate: Date
    ) {}

    abstract getDetails(): string; // Polymorphic method
    abstract get itemType(): string; 
}

// ========== 2. BORROWABLE INTERFACE ==========
interface Borrowable {
    dueDate?: Date;
    isCheckedOut: boolean;
    checkOut(memberId: string, daysToBorrow?: number): boolean;
    returnItem(): boolean;
    calculateFine(returnDate: Date): number;
}

// ========== 3. CONCRETE LIBRARY ITEMS ==========

class Book extends LibraryItem implements Borrowable {
    public isCheckedOut: boolean = false;
    public dueDate?: Date;
    public borrowerId?: string;
    private readonly FINE_PER_DAY = 0.5; 

    constructor(
        itemId: string,
        title: string,
        subject: string,
        publicationDate: Date,
        public author: string,
        public isbn: string,
        public pageCount: number
    ) {
        super(itemId, title, subject, publicationDate);
    }

    get itemType(): string {
        return "Book";
    }

    getDetails(): string {
        let details = `ID: ${this.itemId}
Type: Book
Title: ${this.title} (Author: ${this.author})
Subject: ${this.subject}
Published: ${this.publicationDate.toLocaleDateString()}
ISBN: ${this.isbn}
Pages: ${this.pageCount}`;
        if (this.isCheckedOut) {
            details += `\nStatus: Checked Out (Due: ${this.dueDate?.toLocaleDateString()}, Borrower: ${this.borrowerId})`;
        } else {
            details += `\nStatus: Available`;
        }
        return details;
    }

    checkOut(memberId: string, daysToBorrow: number = 14): boolean {
        if (!this.isCheckedOut) {
            this.isCheckedOut = true;
            this.borrowerId = memberId;
            this.dueDate = new Date();
            this.dueDate.setDate(this.dueDate.getDate() + daysToBorrow);
            console.log(`Book "${this.title}" checked out by ${memberId}. Due: ${this.dueDate.toLocaleDateString()}.`);
            return true;
        }
        console.warn(`Book "${this.title}" is already checked out.`);
        return false;
    }

    returnItem(): boolean {
        if (this.isCheckedOut) {
            const fine = this.calculateFine(new Date()); // Calculate fine on return
            if (fine > 0) {
                console.log(`Book "${this.title}" returned by ${this.borrowerId}. Fine incurred: $${fine.toFixed(2)}.`);
            } else {
                console.log(`Book "${this.title}" returned on time by ${this.borrowerId}.`);
            }
            this.isCheckedOut = false;
            delete this.borrowerId;
            delete this.dueDate;
            return true;
        }
        console.warn(`Book "${this.title}" was not checked out.`);
        return false;
    }

    calculateFine(returnDate: Date): number {
        if (!this.isCheckedOut || !this.dueDate || returnDate <= this.dueDate) {
            return 0;
        }
        const diffTime = Math.abs(returnDate.getTime() - this.dueDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays * this.FINE_PER_DAY;
    }
}

class DVD extends LibraryItem implements Borrowable {
    public isCheckedOut: boolean = false;
    public dueDate?: Date;
    public borrowerId?: string;
    private readonly FINE_PER_DAY = 1.0; 

    constructor(
        itemId: string,
        title: string,
        subject: string,
        publicationDate: Date,
        public director: string,
        public runtimeMinutes: number
    ) {
        super(itemId, title, subject, publicationDate);
    }

    get itemType(): string {
        return "DVD";
    }

    getDetails(): string {
        let details = `ID: ${this.itemId}
Type: DVD
Title: ${this.title} (Director: ${this.director})
Subject: ${this.subject}
Runtime: ${this.runtimeMinutes} minutes
Published: ${this.publicationDate.toLocaleDateString()}`;
        if (this.isCheckedOut) {
            details += `\nStatus: Checked Out (Due: ${this.dueDate?.toLocaleDateString()}, Borrower: ${this.borrowerId})`;
        } else {
            details += `\nStatus: Available`;
        }
        return details;
    }

    checkOut(memberId: string, daysToBorrow: number = 7): boolean {
        if (!this.isCheckedOut) {
            this.isCheckedOut = true;
            this.borrowerId = memberId;
            this.dueDate = new Date();
            this.dueDate.setDate(this.dueDate.getDate() + daysToBorrow);
            console.log(`DVD "${this.title}" checked out by ${memberId}. Due: ${this.dueDate.toLocaleDateString()}.`);
            return true;
        }
        console.warn(`DVD "${this.title}" is already checked out.`);
        return false;
    }

    returnItem(): boolean {
        if (this.isCheckedOut) {
            const fine = this.calculateFine(new Date());
            if (fine > 0) {
                console.log(`DVD "${this.title}" returned by ${this.borrowerId}. Fine incurred: $${fine.toFixed(2)}.`);
            } else {
                console.log(`DVD "${this.title}" returned on time by ${this.borrowerId}.`);
            }
            this.isCheckedOut = false;
            delete this.borrowerId;
            delete this.dueDate;
            return true;
        }
        console.warn(`DVD "${this.title}" was not checked out.`);
        return false;
    }

    calculateFine(returnDate: Date): number {
        if (!this.isCheckedOut || !this.dueDate || returnDate <= this.dueDate) {
            return 0;
        }
        const diffTime = Math.abs(returnDate.getTime() - this.dueDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays * this.FINE_PER_DAY;
    }
}

class EBook extends LibraryItem {
    constructor(
        itemId: string,
        title: string,
        subject: string,
        publicationDate: Date,
        public author: string,
        public format: "PDF" | "EPUB" | "MOBI",
        public fileSizeMB: number
    ) {
        super(itemId, title, subject, publicationDate);
    }

    get itemType(): string {
        return "EBook";
    }

    getDetails(): string {
        return `ID: ${this.itemId}
Type: EBook
Title: ${this.title} (Author: ${this.author})
Subject: ${this.subject}
Format: ${this.format}, Size: ${this.fileSizeMB}MB
Published: ${this.publicationDate.toLocaleDateString()}
Status: Always Available (Digital)`;
    }

    accessResource(memberId: string): void {
        console.log(`EBook "${this.title}" accessed by member ${memberId}. Format: ${this.format}.`);
    }
}

// ========== 4. USER HIERARCHY (Inheritance) ==========

class User {
    constructor(
        public userId: string,
        public name: string,
        public email: string
    ) {}

    login(): void {
        console.log(`${this.name} (ID: ${this.userId}) logged in.`);
    }

    logout(): void {
        console.log(`${this.name} (ID: ${this.userId}) logged out.`);
    }

    getProfile(): string {
        return `User ID: ${this.userId}, Name: ${this.name}, Email: ${this.email}`;
    }
}

interface BorrowedItemRecord {
    item: Borrowable & LibraryItem; 
    checkoutDate: Date;
    dueDate: Date;
    returnDate?: Date;
    finePaid: number;
}

// USER ACCOUNT (Encapsulation of borrowing history and fine logic)
class Member extends User {
    public borrowingHistory: BorrowedItemRecord[] = [];
    public currentFines: number = 0;
    private currentlyBorrowedItems: (Borrowable & LibraryItem)[] = []; // Items currently checked out
    public maxBorrowLimit: number = 5;


    constructor(userId: string, name: string, email: string) {
        super(userId, name, email);
    }

    checkOutItem(item: LibraryItem): boolean {
        if (this.currentlyBorrowedItems.length >= this.maxBorrowLimit) {
            console.warn(`${this.name} has reached the borrowing limit of ${this.maxBorrowLimit} items.`);
            return false;
        }

        if ('checkOut' in item && typeof (item as any).checkOut === 'function') {
            const borrowableItem = item as Borrowable & LibraryItem;
            if (borrowableItem.checkOut(this.userId)) {
                this.currentlyBorrowedItems.push(borrowableItem);
                // Record in history (initial record, returnDate and finePaid will be updated later)
                this.borrowingHistory.push({
                    item: borrowableItem,
                    checkoutDate: new Date(),
                    dueDate: borrowableItem.dueDate!, // Assert non-null as checkout sets it
                    finePaid: 0
                });
                return true;
            }
        } else {
            console.warn(`Item "${item.title}" (ID: ${item.itemId}) is not borrowable.`);
        }
        return false;
    }

    returnItem(item: LibraryItem): boolean {
        if ('returnItem' in item && typeof (item as any).returnItem === 'function') {
            const borrowableItem = item as Borrowable & LibraryItem;
            const returnDate = new Date();
            const fine = borrowableItem.calculateFine(returnDate); // Fine calculated by item itself

            if (borrowableItem.returnItem()) { // Item updates its own status
                this.currentlyBorrowedItems = this.currentlyBorrowedItems.filter(
                    (bItem) => bItem.itemId !== item.itemId
                );

                // Update borrowing history
                const record = this.borrowingHistory.find(
                    (r) => r.item.itemId === item.itemId && !r.returnDate
                );
                if (record) {
                    record.returnDate = returnDate;
                    if (fine > 0) {
                        record.finePaid = 0; // Fine is pending, not yet paid
                        this.currentFines += fine; // Add to member's total current fines
                        console.log(`${this.name} has a pending fine of $${fine.toFixed(2)} for "${item.title}". Total current fines: $${this.currentFines.toFixed(2)}`);
                    }
                }
                return true;
            }
        } else {
            console.warn(`Item "${item.title}" (ID: ${item.itemId}) is not a returnable item type here.`);
        }
        return false;
    }

    accessDigitalItem(item: LibraryItem): void {
        if (item instanceof EBook) {
            item.accessResource(this.userId);
        } else {
            console.warn(`"${item.title}" is not a digital resource or not an EBook.`);
        }
    }

    payFine(amount: number): void {
        if (amount <= 0) {
            console.warn("Payment amount must be positive.");
            return;
        }
        if (this.currentFines === 0) {
            console.log(`${this.name} has no outstanding fines.`);
            return;
        }
        const payment = Math.min(amount, this.currentFines);
        this.currentFines -= payment;
        console.log(`${this.name} paid $${payment.toFixed(2)}. Remaining fines: $${this.currentFines.toFixed(2)}.`);
    }

    viewBorrowingHistory(): void {
        console.log(`\n--- Borrowing History for ${this.name} (ID: ${this.userId}) ---`);
        if (this.borrowingHistory.length === 0) {
            console.log("No borrowing history.");
            return;
        }
        this.borrowingHistory.forEach(record => {
            let historyEntry = `- "${record.item.title}" (ID: ${record.item.itemId})
  Checked Out: ${record.checkoutDate.toLocaleDateString()}
  Due Date: ${record.dueDate.toLocaleDateString()}`;
            if (record.returnDate) {
                historyEntry += `\n  Returned On: ${record.returnDate.toLocaleDateString()}`;
                const fineForThisItem = record.item.calculateFine(record.returnDate); // Re-calculate for display if needed
                if (fineForThisItem > 0) {
                    historyEntry += `\n  Fine Incurred: $${fineForThisItem.toFixed(2)} (Paid: $${record.finePaid.toFixed(2)})`;
                } else {
                    historyEntry += `\n  Returned On Time.`;
                }
            } else {
                historyEntry += `\n  Status: Currently Borrowed`;
                 const potentialFine = record.item.calculateFine(new Date());
                 if (potentialFine > 0) {
                    historyEntry += `\n  OVERDUE! Potential Fine: $${potentialFine.toFixed(2)}`;
                 }
            }
            console.log(historyEntry);
        });
        console.log(`Total Current Fines Due: $${this.currentFines.toFixed(2)}`);
        console.log(`----------------------------------------------`);
    }

    getProfile(): string {
        return `${super.getProfile()}, Role: Member, Current Fines: $${this.currentFines.toFixed(2)}`;
    }
}

class Librarian extends User {
    constructor(userId: string, name: string, email: string) {
        super(userId, name, email);
    }

    addItemToLibrary(item: LibraryItem, library: Library): void {
        library.addLibraryItem(item);
        console.log(`Librarian ${this.name} added "${item.title}" (ID: ${item.itemId}) to the library.`);
    }

    removeItemFromLibrary(itemId: string, library: Library): void {
        library.removeLibraryItem(itemId);
        console.log(`Librarian ${this.name} removed item ID ${itemId} from the library.`);
    }

    registerMember(member: Member, library: Library): void {
        library.addMember(member);
        console.log(`Librarian ${this.name} registered member: ${member.name} (ID: ${member.userId}).`);
    }

    viewAllCheckedOutItems(library: Library): void {
        console.log(`\n--- All Checked Out Items (Viewed by Librarian ${this.name}) ---`);
        const checkedOut = library.getAllItems().filter(item => 'isCheckedOut' in item && (item as any).isCheckedOut);
        if (checkedOut.length === 0) {
            console.log("No items are currently checked out.");
            return;
        }
        checkedOut.forEach(item => {
            console.log(item.getDetails());
            console.log("---");
        });
    }

    getProfile(): string {
        return `${super.getProfile()}, Role: Librarian`;
    }
}

// ========== 5. LIBRARY (Manages items and users) ==========
class Library {
    private items: Map<string, LibraryItem> = new Map();
    private members: Map<string, Member> = new Map();

    constructor(public libraryName: string) {}

    addLibraryItem(item: LibraryItem): void {
        if (this.items.has(item.itemId)) {
            console.warn(`Item with ID ${item.itemId} already exists.`);
            return;
        }
        this.items.set(item.itemId, item);
    }

    removeLibraryItem(itemId: string): void {
        if (this.items.has(itemId)) {
            const item = this.items.get(itemId)!;
            if ('isCheckedOut' in item && (item as any).isCheckedOut) {
                console.warn(`Cannot remove item "${item.title}" (ID: ${itemId}) as it is currently checked out.`);
                return;
            }
            this.items.delete(itemId);
            console.log(`Item "${item.title}" (ID: ${itemId}) removed from library inventory.`);
        } else {
            console.warn(`Item with ID ${itemId} not found.`);
        }
    }

    findItem(itemId: string): LibraryItem | undefined {
        return this.items.get(itemId);
    }

    getAllItems(): LibraryItem[] {
        return Array.from(this.items.values());
    }

    addMember(member: Member): void {
        if (this.members.has(member.userId)) {
            console.warn(`Member with ID ${member.userId} already registered.`);
            return;
        }
        this.members.set(member.userId, member);
    }

    findMember(memberId: string): Member | undefined {
        return this.members.get(memberId);
    }

    displayCatalog(): void {
        console.log(`\n--- ${this.libraryName} Catalog ---`);
        if (this.items.size === 0) {
            console.log("The library catalog is empty.");
            return;
        }
        this.items.forEach(item => {
            console.log(item.getDetails());
            console.log("---");
        });
    }
}


// ========== SAMPLE USAGE ==========

console.log("===== Library Management System Initialization =====\n");

// --- 1. Create Library ---
const centralLibrary = new Library("Central City Library");

// --- 2. Create Users (Librarian, Members) ---
const librarianJane = new Librarian("L001", "Jane Doe", "jane.doe@library.org");
const memberAlice = new Member("M001", "Alice Smith", "alice.s@example.com");
const memberBob = new Member("M002", "Bob Johnson", "bob.j@example.com");

librarianJane.login();
memberAlice.login();

librarianJane.registerMember(memberAlice, centralLibrary);
librarianJane.registerMember(memberBob, centralLibrary);
console.log("\n");

// --- 3. Librarian Adds Items to Library ---
console.log("===== Librarian Adding Items =====");
const book1 = new Book("B001", "The Great Gatsby", "Classic Literature", new Date(1925, 4, 10), "F. Scott Fitzgerald", "978-0743273565", 180);
const book2 = new Book("B002", "Learning TypeScript", "Programming", new Date(2023, 0, 15), "Some Tech Author", "978-1234567890", 350);
const dvd1 = new DVD("D001", "Inception", "Sci-Fi Thriller", new Date(2010, 6, 16), "Christopher Nolan", 148);
const ebook1 = new EBook("E001", "Digital Minimalism", "Self-Help", new Date(2019, 1, 5), "Cal Newport", "EPUB", 2.5);

librarianJane.addItemToLibrary(book1, centralLibrary);
librarianJane.addItemToLibrary(book2, centralLibrary);
librarianJane.addItemToLibrary(dvd1, centralLibrary);
librarianJane.addItemToLibrary(ebook1, centralLibrary);
console.log("\n");

centralLibrary.displayCatalog();
console.log("\n");

// --- 4. Member Interactions ---
console.log("===== Member Interactions: Alice =====");
// Alice checks out a book and a DVD
memberAlice.checkOutItem(book1); // Regular checkout (14 days for book)
memberAlice.checkOutItem(dvd1);  // Regular checkout (7 days for DVD)
memberAlice.checkOutItem(book2); // Another book

// Alice tries to check out an EBook (should fail as it's not Borrowable via checkOutItem)
memberAlice.checkOutItem(ebook1);

// Alice accesses an EBook
memberAlice.accessDigitalItem(ebook1);
memberAlice.accessDigitalItem(book1); // Try to access a non-ebook

console.log("\n--- After Alice's initial checkouts ---");
console.log(book1.getDetails());
console.log(dvd1.getDetails());
memberAlice.viewBorrowingHistory();
console.log("\n");


console.log("===== Member Interactions: Bob =====");
memberBob.checkOutItem(book2); // Bob tries to check out book2, Alice has it. (This needs item to be available)
if (book2.isCheckedOut && book2.borrowerId === memberAlice.userId) {
    console.log("Simulating Alice returning book2 for Bob to check out...");
    memberAlice.returnItem(book2);
}
memberBob.checkOutItem(book2);
memberBob.viewBorrowingHistory();
console.log("\n");


// --- 5. Simulating Time Passing and Item Returns (with Fines) ---
console.log("===== Simulating Time & Returns =====");

// Simulate book1 (Gatsby) being returned LATE by Alice
// Let's assume today is more than 14 days after Alice borrowed book1
// To do this, we'll "time travel" the due date of book1 to be in the past
if (book1.dueDate) {
    const originalDueDate = new Date(book1.dueDate);
    const simulatedReturnDate = new Date(originalDueDate);
    simulatedReturnDate.setDate(originalDueDate.getDate() + 5); // Returned 5 days late

    console.log(`Simulating Alice returning "${book1.title}" on ${simulatedReturnDate.toLocaleDateString()} (Due: ${book1.dueDate.toLocaleDateString()})`);
    // Let's imagine Alice checked out book1 20 days ago, due in 14 days (so 6 days overdue now)
    const checkoutDateForFineSim = new Date();
    checkoutDateForFineSim.setDate(new Date().getDate() - 20); // Checked out 20 days ago
    book1.isCheckedOut = true; // Re-checkout for simulation if needed
    book1.borrowerId = memberAlice.userId;
    book1.dueDate = new Date(checkoutDateForFineSim);
    book1.dueDate.setDate(checkoutDateForFineSim.getDate() + 14); // Due 14 days after that, so 6 days ago
    console.log(`Adjusted for simulation: "${book1.title}" due date is now ${book1.dueDate.toLocaleDateString()}`);
}
memberAlice.returnItem(book1); // Fine should be calculated
memberAlice.viewBorrowingHistory();

// Alice pays some fines
memberAlice.payFine(2.00);
memberAlice.payFine(10.00); // Tries to pay more than due
memberAlice.payFine(0.00);  // Tries to pay zero
console.log("\n");

// Simulate DVD1 being returned on time by Alice
if (dvd1.dueDate && dvd1.dueDate >= new Date()) {
    console.log(`Simulating Alice returning "${dvd1.title}" on time.`);
    memberAlice.returnItem(dvd1);
} else if (dvd1.isCheckedOut) {
    console.log(`Simulating Alice returning "${dvd1.title}" (may be late depending on original checkout).`);
    // dvd1.dueDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000); // Due tomorrow
    memberAlice.returnItem(dvd1);
}
memberAlice.viewBorrowingHistory();
console.log("\n");

// --- 6. Librarian Views ---
console.log("===== Librarian Views =====");
librarianJane.viewAllCheckedOutItems(centralLibrary);
console.log("\n");

centralLibrary.displayCatalog(); // Show status changes
console.log("\n");

console.log(memberAlice.getProfile());
console.log(librarianJane.getProfile());

memberAlice.logout();
librarianJane.logout();

console.log("===== Library Management System Demo End =====\n");