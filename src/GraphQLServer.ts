// GraphQLServer.ts
import express from 'express';
import { ApolloServer, gql } from 'apollo-server-express';
import AnimalDatabase from './AnimalDatabase';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { Carnivorous } from './Carnivorous';
import { Herbivorous } from './Herbivorous';
import { Insect } from './Insect';

export class GraphQLServer {
    public server: any;
    private app: express.Express;
  
    constructor() {
      this.app = express();
      this.initializeApolloServer();
    }
  

    private schema = `
    interface Animal {
      species: String
      age: Float
      weight: Float
      sound: String
    }
    
    type Carnivorous implements Animal{
      species: String
      age: Float
      weight: Float
      sound: String
      favoriteFood: String
    }
    
    type Herbivorous implements Animal{
      species: String
      age: Float
      weight: Float
      sound: String
      favoritePlant: String
    }
    
    type Insect implements Animal{
      species: String
      age: Float
      weight: Float
      sound: String
      eatsInsects: Boolean
      favoriteInsect: String
    }
    
    type Query {
      animalsDeprecated: [Animal] @deprecated(reason: "Use animals instead.")
      animals: [Animal]
      animal(species: String!): Animal
      makeSound(species: String!): String
    }
    
    type Mutation {
      addAnimal(
        species: String!,
        age: Float!,
        weight: Float!,
        sound: String!,
        favoritePlant: String
        favoriteFood: String,
        eatsInsects: Boolean,
        favoriteInsect: String
      ): Animal
    
      setAnimal(
        species: String!,
        age: Float,
        weight: Float,
        sound: String,
        favoritePlant: String,
        favoriteFood: String,
        eatsInsects: Boolean,
        favoriteInsect: String
      ): Animal
    
      deleteAnimal(species: String!): Boolean
    }
    
  `;


    private async initializeApolloServer(): Promise<void> {
      // Read the GraphQL schema from the file
      const schema = fs.readFileSync(path.join(__dirname, 'schema.graphql'), 'utf8');
      const typeDefs = gql`${schema}`;
      // commented line to use schema from the variable above. 
      //const typeDefs = gql`${this.schema}`;
      const resolvers = this.createResolvers();
  
      this.server = new ApolloServer({ typeDefs, resolvers });
      await this.server.start(); // Start the server
  
      // Apply middleware to the express app
      this.server.applyMiddleware({ app: this.app });
    }
  
    private createResolvers(): any {

        const animalDatabase = new AnimalDatabase();

        return {
          Query: {
            animals: () => {           
              return animalDatabase.getAnimals()},
            animal: (parent: any, args: any) => {             
              return animalDatabase.getAnimalBySpecies(args.species)},
            makeSound: (parent: any, args: any) => {
              const animal = animalDatabase.getAnimalBySpecies(args.species);
              return animal ? animal.makeSound() : null;
            },
          },
          Mutation: {
            addAnimal: (parent: any, args: any) => {
              let newAnimal;
        
              if (args.favoritePlant !== undefined) {
                const { species, age, weight, sound, favoritePlant } = args;
                newAnimal = new Herbivorous(species, age, weight, sound, favoritePlant);
              } else if (args.favoriteFood !== undefined) {
                const { species, age, weight, sound, favoriteFood } = args;
                newAnimal = new Carnivorous(species, age, weight, sound, favoriteFood);
              } else if (args.eatsInsects !== undefined) {
                const { species, age, weight, sound, eatsInsects, favoriteInsect } = args;
                newAnimal = new Insect(species, age, weight, sound, eatsInsects, favoriteInsect);
              } else {
                // Handle the default case or throw an error
                throw new Error('Invalid animal type');
              }
        
              animalDatabase.addAnimal(newAnimal);
              return newAnimal;
            },
            setAnimal: (parent: any, args: any) => {
              const { species, age, weight, sound } = args;
        
              // Get the list of all existing animals
              const existingAnimals = animalDatabase.getAnimals();
        
              // Find the index of the animal in the database
              const animalIndex = existingAnimals.findIndex(animal => animal.species === species);
        
              if (animalIndex !== -1) {
                // Animal found in the database
                const existingAnimal = existingAnimals[animalIndex];
                existingAnimal.age = age;
                existingAnimal.weight = weight;
                existingAnimal.sound = sound;
                if (existingAnimal instanceof Herbivorous) {
                  existingAnimal.favoritePlant = args.favoritePlant;
                }
                else if (existingAnimal instanceof Carnivorous) {
                  existingAnimal.favoriteFood = args.favoriteFood;
                }
                else if (existingAnimal instanceof Insect) {
                  existingAnimal.eatsInsects = args.eatsInsects;
                  existingAnimal.favoriteInsect = args.favoriteInsect;
                }

                animalDatabase.setAnimalBySpecies(existingAnimal.species, existingAnimal);
                return existingAnimal;
              } else {
                // Animal not found error
                throw new Error(`Animal with species ${species} not found`);
              }
            },
            deleteAnimal: (parent: any, args: any) => {
              const speciesToDelete = args.species;
              const animalToDelete = animalDatabase.getAnimalBySpecies(speciesToDelete);
    
              if (animalToDelete) {
                animalDatabase.deleteAnimalBySpecies(speciesToDelete);
                return true;
              }
    
              return false;
            },
          },
          Animal: {
            __resolveType(animal: any) {
              if (animal instanceof Herbivorous) {
                return 'Herbivorous';
              } else if (animal instanceof Carnivorous) {
                return 'Carnivorous';
              } else {
                return 'Insect';
              }
            },
          },
        };
      }
  
      startServer(port: number): void {
        //exec('npx kill-port 4000');
        this.app.listen(port, () => {
          console.log(`Server is running at http://localhost:${port}/graphql`);
        });
      }
    
      stopServer(): void {
          this.server.stop();
          exec('npx kill-port 4000');
      }
  
    // Expose the app for testing
    getTestApp(): express.Express {
        return this.app;
    }    
}
  
export default GraphQLServer;

//const graphqlServer = new GraphQLServer();
//graphqlServer.startServer(4000);   
  