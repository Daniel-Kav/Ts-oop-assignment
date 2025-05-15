

// --- User Hierarchy ---
abstract class User {
  constructor(public id: number, public name: string, public email: string) {}
}

class Passenger extends User {
  rideHistory: Ride[] = [];
  requestRide(pickup: string, dropoff: string, system: RideSharingSystem) {
    return system.createRide(this, pickup, dropoff);
  }
}

class Driver extends User {
  vehicle: Vehicle;
  isAvailable: boolean = true;
  rideHistory: Ride[] = [];
  constructor(id: number, name: string, email: string, vehicle: Vehicle) {
    super(id, name, email);
    this.vehicle = vehicle;
  }
}

// --- Vehicle Management ---
class Vehicle {
  constructor(public make: string, public model: string, public plate: string) {}
}

// --- Rating Encapsulation ---
class Rating {
  private ratings: number[] = [];
  addRating(rating: number) {
    if (rating >= 1 && rating <= 5) this.ratings.push(rating);
  }
  get average(): number {
    if (this.ratings.length === 0) return 0;
    return this.ratings.reduce((a, b) => a + b, 0) / this.ratings.length;
  }
}

// --- Pricing Strategy Pattern ---
interface PricingStrategy {
  calculateFare(distance: number, baseFare: number): number;
}

class StandardPricing implements PricingStrategy {
  calculateFare(distance: number, baseFare: number): number {
    return baseFare + distance * 1.5;
  }
}

class PeakTimePricing implements PricingStrategy {
  calculateFare(distance: number, baseFare: number): number {
    return baseFare * 1.5 + distance * 2.5;
  }
}

class TrafficPricing implements PricingStrategy {
  calculateFare(distance: number, baseFare: number): number {
    return baseFare + distance * 2.0 + 5; // extra for traffic
  }
}

// --- Ride Factory Pattern ---
class RideFactory {
  static createRide(
    passenger: Passenger,
    driver: Driver,
    pickup: string,
    dropoff: string,
    pricingStrategy: PricingStrategy
  ): Ride {
    return new Ride(passenger, driver, pickup, dropoff, pricingStrategy);
  }
}

// --- Ride Class ---
class Ride {
  private static idCounter = 1;
  public id: number;
  public fare: number = 0;
  public rating: Rating = new Rating();
  public completed: boolean = false;
  constructor(
    public passenger: Passenger,
    public driver: Driver,
    public pickup: string,
    public dropoff: string,
    private pricingStrategy: PricingStrategy
  ) {
    this.id = Ride.idCounter++;
  }
  complete(distance: number, baseFare: number) {
    this.fare = this.pricingStrategy.calculateFare(distance, baseFare);
    this.completed = true;
    this.passenger.rideHistory.push(this);
    this.driver.rideHistory.push(this);
    this.driver.isAvailable = true;
  }
  rate(rating: number) {
    this.rating.addRating(rating);
  }
}

// --- Matching Algorithm (Nearest Driver Selection, simplified) ---
class RideSharingSystem {
  private users: User[] = [];
  private drivers: Driver[] = [];
  private passengers: Passenger[] = [];
  private rides: Ride[] = [];

  registerPassenger(name: string, email: string): Passenger {
    const passenger = new Passenger(this.users.length + 1, name, email);
    this.users.push(passenger);
    this.passengers.push(passenger);
    return passenger;
  }

  registerDriver(name: string, email: string, vehicle: Vehicle): Driver {
    const driver = new Driver(this.users.length + 1, name, email, vehicle);
    this.users.push(driver);
    this.drivers.push(driver);
    return driver;
  }

  // Simulate GPS: just pick the first available driver
  private findNearestDriver(): Driver | null {
    return this.drivers.find((d) => d.isAvailable) || null;
  }

  // Dynamic pricing based on time/traffic (simplified)
  private getPricingStrategy(): PricingStrategy {
    const hour = new Date().getHours();
    if (hour >= 7 && hour <= 9) return new PeakTimePricing();
    if (hour >= 17 && hour <= 19) return new TrafficPricing();
    return new StandardPricing();
  }

  createRide(passenger: Passenger, pickup: string, dropoff: string): Ride | null {
    const driver = this.findNearestDriver();
    if (!driver) {
      console.log('No drivers available!');
      return null;
    }
    driver.isAvailable = false;
    const pricingStrategy = this.getPricingStrategy();
    const ride = RideFactory.createRide(passenger, driver, pickup, dropoff, pricingStrategy);
    this.rides.push(ride);
    return ride;
  }

  getRideHistory(user: User): Ride[] {
    if (user instanceof Passenger) return user.rideHistory;
    if (user instanceof Driver) return user.rideHistory;
    return [];
  }
}

// --- DEMO ---
const system = new RideSharingSystem();
const alice = system.registerPassenger('Alice', 'alice@email.com');
const bob = system.registerDriver('Bob', 'bob@email.com', new Vehicle('Toyota', 'Prius', 'XYZ123'));
const carol = system.registerDriver('Carol', 'carol@email.com', new Vehicle('Honda', 'Civic', 'ABC789'));

const ride1 = alice.requestRide('Central Park', 'Times Square', system);
if (ride1) {
  ride1.complete(10, 5); // 10km, $5 base fare
  ride1.rate(5);
  console.log(`Ride ${ride1.id} fare: $${ride1.fare.toFixed(2)}, rating: ${ride1.rating.average}`);
}

const ride2 = alice.requestRide('Times Square', 'Brooklyn', system);
if (ride2) {
  ride2.complete(15, 5);
  ride2.rate(4);
  console.log(`Ride ${ride2.id} fare: $${ride2.fare.toFixed(2)}, rating: ${ride2.rating.average}`);
}

console.log('Alice ride history:', system.getRideHistory(alice).map(r => r.id));
console.log('Bob ride history:', system.getRideHistory(bob).map(r => r.id)); 