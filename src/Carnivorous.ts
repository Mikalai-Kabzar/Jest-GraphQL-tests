//Carnivorous.ts
import Animal from "./Animal";

export class Carnivorous extends Animal {
  favoriteFood: string;
  
    constructor(
      species: string,
      age: number,
      weight: number,
      sound: string,
      favoriteFood: string,
    ) {
      super(species, age, weight, sound);
      this.favoriteFood = favoriteFood;
    }

    // static __resolveType(animal: Carnivorous): string {
    //     return 'Carnivorous';
    //   }
  }