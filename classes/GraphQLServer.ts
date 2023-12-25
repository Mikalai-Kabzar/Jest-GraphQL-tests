// GraphQLServer.ts
import express from 'express';
import { ApolloServer, gql } from 'apollo-server-express';
import Animal from './Animal';
import AnimalDatabase from './AnimalDatabase';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { Command, Option } from 'commander';

class GraphQLServer {
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
      //const schema = fs.readFileSync(path.join(__dirname, 'schema.graphql'), 'utf8');
      //const typeDefs = gql`${schema}`;
      const typeDefs = gql`${this.schema}`;
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
            animals: () => animalDatabase.getAnimals(),
            animal: (parent: any, args: any) => animalDatabase.getAnimalBySpecies(args.species),
            makeSound: (parent: any, args: any) => {
                const animal = animalDatabase.getAnimalBySpecies(args.species);
                return animal ? animal.makeSound() : null;
              },
          },
          Mutation: {
            addAnimal: (parent: any, args: any) => {
              const newAnimal = new Animal(args.species, args.age, args.weight, args.sound);
              animalDatabase.addAnimal(newAnimal);
              return newAnimal;
            },
            setAnimal: (parent: any, args: any) => {
              const updatedAnimal = new Animal(args.species, args.age, args.weight, args.sound);
              animalDatabase.setAnimalBySpecies(args.species, updatedAnimal);
              return updatedAnimal;
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
        };
      }
  
      startServer(port: number): void {
        this.app.listen(port, () => {
          console.log(`Server is running at http://localhost:${port}/graphql`);
        });
      }
    
      stopServer(): void {


        if (this.server) {
          this.server.stop();

          exec('npx kill-port 4000');
          exec('npx kill-port 4001');



          console.log('Server stopped');
        } else {
          console.log('Server not running');
        }
      }
  
    // Expose the app for testing
    getTestApp(): express.Express {
        return this.app;
    }
    
  }
  
  export default GraphQLServer;
  
  
//   const graphqlServer = new GraphQLServer();
// // Use Command and Option from commander directly
// const program = new Command();
// program
//   .addOption(new Option('-p, --port <port>', 'Port number for the GraphQL server').argParser(parseInt))
//   .option('-s, --stop', 'Stop the GraphQL server')
//   .parse(process.argv);

// const options = program.opts();

// if (options.stop) {
//   // Stop the server if the --stop option is provided
//   graphqlServer.stopServer();
// } else {
//   // Start the server with the specified port or default to 4000
//   const port = options.port || 4001;
//   graphqlServer.startServer(port);
// }
  