// AnimalDatabase.ts
import Animal from './Animal';

export default class AnimalDatabase {
    private animals: Animal[] = [
        new Animal("Lion", 5, 200, "Roar"),
        new Animal("Elephant", 10, 5000, "Trumpet"),
        new Animal("Tiger", 3, 150, "Roar"),
        new Animal("Giraffe", 8, 1200, "Hum"),
        new Animal("Penguin", 2, 20, "Squawk"),
        new Animal("Kangaroo", 6, 80, "Thump"),
        // Add more animals as needed
      ];

  getAnimals(): Animal[] {
    return this.animals;
  }

  getAnimalBySpecies(species: string): Animal | undefined {
    return this.animals.find((animal) => animal.species === species);
  }

  addAnimal(animal: Animal): void {
    this.animals.push(animal);
  }

  // New setter methods
  setAnimalBySpecies(species: string, updatedAnimal: Animal): void {
    const index = this.animals.findIndex((animal) => animal.species === species);

    if (index !== -1) {
      this.animals[index] = updatedAnimal;
    }
  }

  deleteAnimalBySpecies(species: string): void {
    this.animals = this.animals.filter((animal) => animal.species !== species);
  }
}
