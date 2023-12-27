// GraphQLServer.ts
import express from 'express';
import { ApolloServer, gql } from 'apollo-server-express';
import Animal from './Animal';
import AnimalDatabase from './AnimalDatabase';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { Carnivorous } from './Carnivorous';
import { Herbivorous } from './Herbivorous';
import { Insect } from './Insect';
// Define interfaces and types based on the schema
interface AnimalResolver extends Animal {}
interface CarnivorousResolver extends AnimalResolver, Carnivorous {}
interface HerbivorousResolver extends AnimalResolver, Herbivorous {}

export class GraphQLServer {
    public server: any;
    private app: express.Express;
  
    constructor() {
      this.app = express();
      this.initializeApolloServer();
    }
  

    private schema = `
    type Animal {
      species: String
      age: Int
      weight: Float
      sound: String
    }
  
    type Query {
      animals1: [Animal] @deprecated(reason: "Use newField instead.")
      animals: [Animal]
      animal(species: String!): Animal
      makeSound(species: String!): String
    }
  
    type Mutation {
      addAnimal(species: String!, age: Int!, weight: Float!, sound: String!): Animal
      setAnimal(species: String!, age: Int, weight: Float, sound: String): Animal
      deleteAnimal(species: String!): Boolean
    }
  `;


    private async initializeApolloServer(): Promise<void> {
      // Read the GraphQL schema from the file
      const schema = fs.readFileSync(path.join(__dirname, 'schema.graphql'), 'utf8');
      const typeDefs = gql`${schema}`;
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
            __resolveType(animal: any) {
              if (animal instanceof Herbivorous) {
                return 'Herbivorous';
              } else if (animal instanceof Carnivorous) {
                return 'Carnivorous';
              } else if (animal instanceof Insect) {
                return 'Insect';
              }
              return 'Animal';
            },

            animals: () => {
              
              console.log(animalDatabase.getAnimals())
              
              
              
              return animalDatabase.getAnimals()},
            animal: (parent: any, args: any) => animalDatabase.getAnimalBySpecies(args.species),
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
              } else if (args.huntingMethod !== undefined) {
                const { species, age, weight, sound, huntingMethod } = args;
                newAnimal = new Carnivorous(species, age, weight, sound, huntingMethod);
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
              } else if (animal instanceof Insect) {
                return 'Insect';
              }
              return 'Animal';
            },
          },
          Herbivorous: {
            // Add specific resolvers for Herbivorous if needed
          },
          Carnivorous: {
            // Add specific resolvers for Carnivorous if needed
          },
          Insect: {
            // Add specific resolvers for Insect if needed
          },

        };
      }
  
      startServer(port: number): void {
        exec('npx kill-port 4000');
        this.app.listen(port, () => {
          console.log(`Server is running at http://localhost:${port}/graphql`);
        });
      }
    
      stopServer(): void {
          this.server.stop();
          exec('npx kill-port 4000');
          exec('npx kill-port 4001');
      }
  
    // Expose the app for testing
    getTestApp(): express.Express {
        return this.app;
    }
    
}
  
export default GraphQLServer;

//const graphqlServer = new GraphQLServer();
//graphqlServer.startServer(4000);   
  