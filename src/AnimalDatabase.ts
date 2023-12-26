// AnimalDatabase.ts
import Animal from './Animal';

export default class AnimalDatabase {
    private animals: any[] = [
      new Animal("Lion", 5, 200, "Roar", true, "Meat", false, ""),
      new Animal("Elephant", 10, 5000, "Trumpet", false, "", true, "Vegetables"),
      new Animal("Tiger", 3, 150, "Roar", true, "Meat", false, ""),
      new Animal("Penguin", 2, 20, "Squawk", true, "Fish", false, ""),
      new Animal("Kangaroo", 6, 80, "Thump", false, "", true, "Grass"),
      new Animal("Cheetah", 4, 150, "Growl", true, "Meat", false, ""),
      new Animal("Hippopotamus", 7, 2500, "Grunt", false, "", true, "Grass"),
      new Animal("Parrot", 1, 0.5, "Squawk", false, "", true, "Seeds"),
      new Animal("Gorilla", 9, 400, "Grunt", false, "", true, "Fruits"),
      new Animal("Zebra", 5, 300, "Neigh", false, "", true, "Grass"),
      new Animal("Crocodile", 12, 500, "Roar", true, "Meat", false, ""),
      new Animal("Peacock", 4, 5, "Scream", true, "Insects", false, ""),
      new Animal("Snake", 2, 3, "Hiss", true, "Rodents", false, ""),
      new Animal("Ostrich", 5, 150, "Boom", true, "Insects", false, ""),
      new Animal("Dolphin", 8, 300, "Click", true, "Fish", false, ""),
      new Animal("Chimpanzee", 6, 70, "Chatter", false, "", true, "Fruits"),
      new Animal("Panda", 4, 200, "Growl", false, "", true, "Bamboo"),
      new Animal("Koala", 3, 10, "Grunt", false, "", true, "Eucalyptus leaves"),
      new Animal("Flamingo", 2, 8, "Honk", true, "Fish", false, ""),

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
