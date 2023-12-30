//Animal.ts
export default class Animal {
  species: string;
  age: number;
  weight: number;
  sound: string;

  constructor(
    species: string,
    age: number,
    weight: number,
    sound: string,
  ) {
    this.species = species;
    this.age = age;
    this.weight = weight;
    this.sound = sound;
  }

  makeSound(): string {
    return `${this.species} makes the sound: ${this.sound}`;
  }
}