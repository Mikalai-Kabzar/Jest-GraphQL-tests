interface Carnivorous {
  hasSharpTeeth: boolean;
  huntingMethod: string;
}

interface Herbivorous {
  eatsPlants: boolean;
  favoritePlant: string;
}

export default class Animal implements Carnivorous, Herbivorous {
  species: string;
  age: number;
  weight: number;
  sound: string;
  hasSharpTeeth: boolean;
  huntingMethod: string;
  eatsPlants: boolean;
  favoritePlant: string;

  constructor(
    species: string,
    age: number,
    weight: number,
    sound: string,
    hasSharpTeeth: boolean,
    huntingMethod: string,
    eatsPlants: boolean,
    favoritePlant: string
  ) {
    this.species = species;
    this.age = age;
    this.weight = weight;
    this.sound = sound;
    this.hasSharpTeeth = hasSharpTeeth;
    this.huntingMethod = huntingMethod;
    this.eatsPlants = eatsPlants;
    this.favoritePlant = favoritePlant;
  }

  makeSound(): string {
    return `${this.species} makes the sound: ${this.sound}`;
  }
}
