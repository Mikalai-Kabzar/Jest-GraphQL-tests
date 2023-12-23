import request from 'supertest';
import GraphQLServer from './GraphQLServer'; // Update the import path based on your project structure

  let graphqlServer: GraphQLServer;

  beforeAll(() => {
    graphqlServer = new GraphQLServer();
    graphqlServer.startServer(4000);
  });

  afterAll(() => {
    graphqlServer.stopServer();
  });


describe('GraphQL Server Integration Tests', () => {

  it('should return a list of animals', async () => {
    const response = await request(graphqlServer.getTestApp())
      .post(graphqlServer.server?.graphqlPath || '')
      .send({ query: '{ animals { species } }' })
      .expect(200);

    expect(response.body.data.animals).toBeDefined();
    expect(response.body.data.animals).toBeInstanceOf(Array);
  });

  it('should add a new animal', async () => {
    const response = await request(graphqlServer.getTestApp())
      .post(graphqlServer.server?.graphqlPath || '')
      .send({
        query: 'mutation { addAnimal(species: "Tiger", age: 3, weight: 150, sound: "Roar") { species } }',
      })
      .expect(200);

    expect(response.body.data.addAnimal.species).toBe('Tiger');
  });

  it('getAnimalBySpecies should return the correct animal', async () => {
    // Assuming you have a mutation to add animals
    const addAnimalMutation = `
      mutation {
        addAnimal(species: "Elephant", age: 10, weight: 5000, sound: "Trumpet") {
          species
          age
          weight
          sound
        }
      }
    `;

    // Add an animal using the mutation
    const addAnimalResponse = await request(graphqlServer.getTestApp())
      .post(graphqlServer.server?.graphqlPath || '')
      .send({ query: addAnimalMutation })
      .expect(200);

    // Ensure that the animal was added successfully
    const addedAnimal = addAnimalResponse.body.data.addAnimal;

    // Now, test the getAnimalBySpecies query
    const getAnimalQuery = `
      query {
        animal(species: "Elephant") {
          species
          age
          weight
          sound
        }
      }
    `;

    // Get the animal by species
    const getAnimalResponse = await request(graphqlServer.getTestApp())
      .post(graphqlServer.server?.graphqlPath || '')
      .send({ query: getAnimalQuery })
      .expect(200);

    // Ensure that the returned animal matches the added animal
    const returnedAnimal = getAnimalResponse.body.data.animal;

    expect(returnedAnimal).toEqual(addedAnimal);
  });

  it('setAnimalBySpecies should update the correct animal', async () => {
    // Assuming you have a mutation to add animals
    const addAnimalMutation = `
      mutation {
        addAnimal(species: "Lion", age: 5, weight: 200, sound: "Roar") {
          species
          age
          weight
          sound
        }
      }
    `;

    // Add an animal using the mutation
    const addAnimalResponse = await request(graphqlServer.getTestApp())
      .post(graphqlServer.server?.graphqlPath || '')
      .send({ query: addAnimalMutation })
      .expect(200);

    // Ensure that the animal was added successfully
    const addedAnimal = addAnimalResponse.body.data.addAnimal;

    // Now, test the setAnimalBySpecies mutation
    const setAnimalMutation = `
      mutation {
        setAnimal(species: "Lion", age: 6, weight: 220, sound: "Roarrrr") {
          species
          age
          weight
          sound
        }
      }
    `;

    // Update the animal using the mutation
    const setAnimalResponse = await request(graphqlServer.getTestApp())
      .post(graphqlServer.server?.graphqlPath)
      .send({ query: setAnimalMutation })
      .expect(200);

    // Ensure that the animal was updated successfully
    const updatedAnimal = setAnimalResponse.body.data.setAnimal;

    // The setAnimalBySpecies mutation should return the updated animal
    expect(updatedAnimal).toEqual({
      species: addedAnimal.species,
      age: 6,
      weight: 220,
      sound: "Roarrrr",
    });
  });

  it('should delete the correct animal by species', async () => {
    // Assuming you have a mutation to add animals
    const addAnimalMutation = `
      mutation {
        addAnimal(species: "Giraffe", age: 8, weight: 1200, sound: "Hum") {
          species
          age
          weight
          sound
        }
      }
    `;

    // Add an animal using the mutation
    const addAnimalResponse = await request(graphqlServer.getTestApp())
      .post(graphqlServer.server?.graphqlPath || '')
      .send({ query: addAnimalMutation })
      .expect(200);

    // Ensure that the animal was added successfully
    const addedAnimal = addAnimalResponse.body.data.addAnimal;

    // Now, test the deleteAnimal mutation
    const deleteAnimalMutation = `
      mutation {
        deleteAnimal(species: "Giraffe")
      }
    `;

    // Delete the animal using the mutation
    const deleteAnimalResponse = await request(graphqlServer.getTestApp())
      .post(graphqlServer.server?.graphqlPath || '')
      .send({ query: deleteAnimalMutation })
      .expect(200);

    // Ensure that the deleteAnimal mutation returns true (success)
    const deleteSuccess = deleteAnimalResponse.body.data.deleteAnimal;

    // The deleteAnimalBySpecies mutation should return true for success
    expect(deleteSuccess).toBe(true);

    // Now, try to get the deleted animal by species
    const getAnimalQuery = `
      query {
        animal(species: "Giraffe") {
          species
        }
      }
    `;

    // Attempt to get the deleted animal (should be undefined)
    const getAnimalResponse = await request(graphqlServer.getTestApp())
      .post(graphqlServer.server?.graphqlPath || '')
      .send({ query: getAnimalQuery })
      .expect(200);

    // Ensure that the returned animal is undefined
    const returnedAnimal = getAnimalResponse.body.data.animal;
    expect(returnedAnimal).toBeNull();
  });
  it('should return false when trying to delete a non-existing animal', async () => {
    // Attempt to delete a non-existing animal using the deleteAnimal mutation
    const deleteAnimalMutation = `
      mutation {
        deleteAnimal(species: "NonExistentAnimal")
      }
    `;

    // Try to delete the non-existing animal
    const deleteAnimalResponse = await request(graphqlServer.getTestApp())
      .post(graphqlServer.server?.graphqlPath || '')
      .send({ query: deleteAnimalMutation })
      .expect(200);

    // Ensure that the deleteAnimal mutation returns false for non-existing animal
    const deleteSuccess = deleteAnimalResponse.body.data.deleteAnimal;
    expect(deleteSuccess).toBe(false);
  });
  it('should return the correct sound using GraphQL query', async () => {
    // Assuming you have a mutation to add animals
    const addAnimalMutation = `
      mutation {
        addAnimal(species: "Dog", age: 2, weight: 20, sound: "Woof") {
          species
        }
      }
    `;

    // Add an animal using the mutation
    await request(graphqlServer.getTestApp())
      .post(graphqlServer.server?.graphqlPath || '')
      .send({ query: addAnimalMutation })
      .expect(200);

    // Now, test the makeSound query
    const makeSoundQuery = `
      query {
        makeSound(species: "Dog")
      }
    `;

    // Get the sound of the added animal using the makeSound query
    const soundResponse = await request(graphqlServer.getTestApp())
      .post(graphqlServer.server?.graphqlPath || '')
      .send({ query: makeSoundQuery })
      .expect(200);

    // Ensure that the returned sound matches the expected value
    const returnedSound = soundResponse.body.data.makeSound;
    expect(returnedSound).toBe('Dog makes the sound: Woof');
  });

  it('should return null when trying to make sound for a non-existing animal', async () => {
    // Attempt to make a sound for a non-existing animal using the makeSound query
    const makeSoundQuery = `
      query {
        makeSound(species: "NonExistentAnimal")
      }
    `;

    // Try to make a sound for the non-existing animal
    const makeSoundResponse = await request(graphqlServer.getTestApp())
      .post(graphqlServer.server?.graphqlPath || '')
      .send({ query: makeSoundQuery })
      .expect(200);

    // Ensure that the makeSound query returns null for non-existing animal
    const returnedSound = makeSoundResponse.body.data.makeSound;
    expect(returnedSound).toBeNull();
  });
});
