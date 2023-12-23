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
        new Animal("Cheetah", 4, 150, "Growl"),
        new Animal("Hippopotamus", 7, 2500, "Grunt"),
        new Animal("Parrot", 1, 0.5, "Squawk"),
        new Animal("Gorilla", 9, 400, "Grunt"),
        new Animal("Zebra", 5, 300, "Neigh"),
        new Animal("Crocodile", 12, 500, "Roar"),
        new Animal("Peacock", 4, 5, "Scream"),
        new Animal("Snake", 2, 3, "Hiss"),
        new Animal("Ostrich", 5, 150, "Boom"),
        new Animal("Dolphin", 8, 300, "Click"),
        new Animal("Chimpanzee", 6, 70, "Chatter"),
        new Animal("Panda", 4, 200, "Growl"),
        new Animal("Koala", 3, 10, "Grunt"),
        new Animal("Flamingo", 2, 8, "Honk"),
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
