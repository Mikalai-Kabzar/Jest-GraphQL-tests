//Insect.ts
import Animal from "./Animal";

export class Insect extends Animal {
    constructor(
      species: string,
      age: number,
      weight: number,
      sound: string,
      eatsInsects: boolean,
      favoriteInsect: string
    ) {
      super(species, age, weight, sound);
      this.eatsInsects = eatsInsects;
      this.favoriteInsect = favoriteInsect;
    }
  
    eatsInsects: boolean;
    favoriteInsect: string;
  }
  