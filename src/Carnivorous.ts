//Carnivorous.ts
import Animal from "./Animal";

export class Carnivorous extends Animal {
    huntingMethod: string;
  
    constructor(
      species: string,
      age: number,
      weight: number,
      sound: string,
      huntingMethod: string,
    ) {
      super(species, age, weight, sound);
      this.huntingMethod = huntingMethod;
    }

    static __resolveType(animal: Carnivorous): string {
        return 'Carnivorous';
      }
  }