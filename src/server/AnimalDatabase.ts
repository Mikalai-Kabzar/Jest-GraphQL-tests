// AnimalDatabase.ts
import Animal from '../classes/Animal';
import { Carnivorous } from '../classes/Carnivorous';
import { Herbivorous } from '../classes/Herbivorous';
import { Insect } from '../classes/Insect';

export default class AnimalDatabase {
  private animals: Animal[] = [
    new Carnivorous("Lion", 5, 200, "Roar", "Meat"),
    new Herbivorous("Elephant", 10, 5000, "Trumpet", "Vegetables"),
    new Insect("Grasshopper", 0.3, 0.002, "Chirp", true, "Grass"),
    new Carnivorous("Tiger", 3, 150, "Roar", "Meat"),
    new Carnivorous("Penguin", 2, 20, "Squawk", "Fish"),
    new Herbivorous("Kangaroo", 6, 80, "Thump", "Grass"),
    new Carnivorous("Cheetah", 4, 150, "Growl", "Meat"),
    new Herbivorous("Hippopotamus", 7, 2500, "Grunt", "Grass"),
    new Herbivorous("Parrot", 1, 0.5, "Squawk", "Seeds"),
    new Herbivorous("Gorilla", 9, 400, "Grunt", "Fruits"),
    new Herbivorous("Zebra", 5, 300, "Neigh", "Grass"),
    new Carnivorous("Crocodile", 12, 500, "Roar", "Meat"),
    new Carnivorous("Peacock", 4, 5, "Scream", "Insects"),
    new Carnivorous("Snake", 2, 3, "Hiss", "Rodents"),
    new Carnivorous("Ostrich", 5, 150, "Boom", "Insects"),
    new Carnivorous("Dolphin", 8, 300, "Click", "Fish"),
    new Herbivorous("Chimpanzee", 6, 70, "Chatter", "Fruits"),
    new Herbivorous("Panda", 4, 200, "Growl", "Bamboo"),
    new Herbivorous("Koala", 3, 10, "Grunt", "Eucalyptus leaves"),
    new Carnivorous("Flamingo", 2, 8, "Honk", "Fish"),
    new Insect("Butterfly", 1, 0.01, "Flutter", false, ""),
    new Insect("Ant", 0.5, 0.001, "March", true, "Aphids"),
    new Insect("Dragonfly", 2, 0.02, "Buzz", true, "Mosquitoes"),
    new Insect("Bee", 0.5, 0.005, "Buzz", true, "Nectar"),
  ];

  getAnimals(): Animal[] {
    return this.animals;
  }
  getAnimalBySpecies(species: string): Animal | null {
    const animal = this.animals.find((a) => a.species === species);
    return animal || null;
  }

  addAnimal(animal: Animal): void {
    this.animals.push(animal);
  }

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
