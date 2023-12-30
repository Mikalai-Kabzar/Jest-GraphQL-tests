//Herbivorous.ts
import Animal from "./Animal";

export class Herbivorous extends Animal {
  favoritePlant: string;

  constructor(
    species: string,
    age: number,
    weight: number,
    sound: string,
    favoritePlant: string,
  ) {
    super(species, age, weight, sound);
    this.favoritePlant = favoritePlant;
  }
}  
