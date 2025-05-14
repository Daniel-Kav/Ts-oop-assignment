// prettier-ignore
// 5. Intelligent Zoo Management System
// Description: Develop a smart zoo system with intelligent feeding schedules, sensor-driven habitat monitoring, and animal behavior tracking.

// Key Elements:
// Animal (abstract) → extended by Bird, Mammal, Reptile

// Habitat → includes temperature, feeding schedule, cleanliness

// Observer Pattern: Animal health alerts via sensors

// FeedingStrategy Interface → different feeding logic for herbivores, carnivores, omnivores

// Zookeeper & Vet Roles for monitoring
// Animal abstract class
// Simple Intelligent Zoo Management System

// Feeding strategies for different animal types

interface FeedingStrategy {
  feed(animalName: string): void;
}

class HerbivoreFeedingStrategy implements FeedingStrategy {
  feed(animalName: string): void {
    console.log(`Feeding ${animalName} with plants and vegetables`);
  }
}

class CarnivoreFeedingStrategy implements FeedingStrategy {
  feed(animalName: string): void {
    console.log(`Feeding ${animalName} with meat`);
  }
}

class OmnivoreFeedingStrategy implements FeedingStrategy {
  feed(animalName: string): void {
    console.log(`Feeding ${animalName} with mixed diet of plants and meat`);
  }
}

abstract class Animal {
  constructor(
    public name: string,
    public species: string,
    public age: number,
    public feedingStrategy: FeedingStrategy,
    public habitat: Habitat
  ) {
    habitat.addAnimal(this);
  }

  feed(): void {
    this.feedingStrategy.feed(this.name);
  }

  abstract makeSound(): void;
}

class Mammal extends Animal {
  makeSound(): void {
    console.log(`${this.name} the ${this.species} makes a mammal sound`);
  }
}

class Bird extends Animal {
  makeSound(): void {
    console.log(`${this.name} the ${this.species} chirps`);
  }
}

class Reptile extends Animal {
  makeSound(): void {
    console.log(`${this.name} the ${this.species} hisses`);
  }
}

class Habitat {
  private animals: Animal[] = [];
  private temperature: number;
  private cleanliness: number;

  constructor(public name: string, initialTemp: number) {
    this.temperature = initialTemp;
    this.cleanliness = 10;
  }

  addAnimal(animal: Animal): void {
    this.animals.push(animal);
    console.log(`${animal.name} added to ${this.name} habitat`);
  }

  getAnimals(): Animal[] {
    return this.animals;
  }

  updateTemperature(newTemp: number): void {
    this.temperature = newTemp;
    console.log(`${this.name} habitat temperature updated to ${newTemp}°C`);
    this.checkConditions();
  }

  clean(): void {
    this.cleanliness = 10;
    console.log(`${this.name} habitat has been cleaned`);
  }

  checkConditions(): void {
    if (this.cleanliness < 5) {
      console.log(`ALERT: ${this.name} habitat needs cleaning!`);
    }

    if (this.temperature < 15 || this.temperature > 35) {
      console.log(
        `ALERT: ${this.name} habitat temperature is out of safe range!`
      );
    }
  }
}

class Zookeeper {
  constructor(public name: string) {}

  feedAnimal(animal: Animal): void {
    console.log(`${this.name} is feeding ${animal.name}`);
    animal.feed();
  }

  cleanHabitat(habitat: Habitat): void {
    console.log(`${this.name} is cleaning ${habitat.name}`);
    habitat.clean();
  }
}

class Veterinarian {
  constructor(public name: string) {}

  checkAnimal(animal: Animal): void {
    console.log(`Vet ${this.name} is checking ${animal.name}`);
  }
}

const savanna = new Habitat("African Savanna", 28);
const jungle = new Habitat("Jungle", 26);

const herbivoreStrategy = new HerbivoreFeedingStrategy();
const carnivoreStrategy = new CarnivoreFeedingStrategy();
const omnivoreStrategy = new OmnivoreFeedingStrategy();

// prettier-ignore
const lion = new Mammal("Simba", "Lion", 5, carnivoreStrategy, savanna);
const parrot = new Bird("Rio", "Macaw", 3, herbivoreStrategy, jungle);

// prettier-ignore
const iguana = new Reptile("Spike", "Green Iguana", 4, herbivoreStrategy, jungle);
const zookeeper = new Zookeeper("John");
const vet = new Veterinarian("Dr. Smith");

lion.makeSound();
zookeeper.feedAnimal(lion);
savanna.updateTemperature(36);
zookeeper.cleanHabitat(jungle);
vet.checkAnimal(parrot);
