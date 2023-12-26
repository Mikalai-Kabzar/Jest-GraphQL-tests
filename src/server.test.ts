import BaseTest from './BaseTest';
const call = BaseTest.prototype.makeGraphqlRequest; // Create an alias
  const baseTest = new BaseTest();

  beforeAll(() => {
    baseTest.startServer(4000);
  });

  afterAll(() => {
    baseTest.stopServer();
  });


describe('GraphQL Server Integration Tests', () => {

  it('should return a list of animals', async () => {
    const query = '{ animals { species } }';
    const response = await call(query);
    expect(response.body.data.animals).toBeDefined();
    expect(response.body.data.animals).toBeInstanceOf(Array);
  });

  it('should add a new animal', async () => {
    const query = 'mutation { addAnimal(species: "Tiger", age: 3, weight: 150, sound: "Roar") { species } }';
    const response  = await call(query);
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
    const addAnimalResponse  = await call(addAnimalMutation);

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
    const getAnimalResponse  = await call(getAnimalQuery);

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
    const addAnimalResponse  = await call(addAnimalMutation);

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
    const setAnimalResponse  = await call(setAnimalMutation);

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
    const addAnimalResponse  = await call(addAnimalMutation);

    // Ensure that the animal was added successfully
    const addedAnimal = addAnimalResponse.body.data.addAnimal;

    // Now, test the deleteAnimal mutation
    const deleteAnimalMutation = `
      mutation {
        deleteAnimal(species: "Giraffe")
      }
    `;

    // Delete the animal using the mutation
    const deleteAnimalResponse  = await call(deleteAnimalMutation);

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
    const getAnimalResponse  = await call(getAnimalQuery);

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
    const deleteAnimalResponse  = await call(deleteAnimalMutation);

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
    await call(addAnimalMutation);

    // Now, test the makeSound query
    const makeSoundQuery = `
      query {
        makeSound(species: "Dog")
      }
    `;

    // Get the sound of the added animal using the makeSound query
    const soundResponse  = await call(makeSoundQuery);

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
    const makeSoundResponse  = await call(makeSoundQuery);

    // Ensure that the makeSound query returns null for non-existing animal
    const returnedSound = makeSoundResponse.body.data.makeSound;
    expect(returnedSound).toBeNull();
  });

  it('should retrieve information about multiple animals with aliases', async () => {
    const query = `
      query {
        lion: animal(species: "Lion") {
          species
          age
          weight
          sound
        }
        elephant: animal(species: "Elephant") {
          species
          age
          weight
          sound
        }
      }
    `;

    const response = await call(query);

    // Assertions for the response
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('data.lion.species', 'Lion');
    expect(response.body).toHaveProperty('data.elephant.species', 'Elephant');
    expect(response.body).toHaveProperty('data.lion.age', expect.any(Number));
    expect(response.body).toHaveProperty('data.elephant.weight', expect.any(Number));
    // Add more specific assertions as needed
  });

  it('should retrieve information about all animals with aliases', async () => {
    const query = `
      query {
        animal1: animal(species: "Lion") {
          species
          age
          weight
          sound
        }
        animal2: animal(species: "Elephant") {
          species
          age
          weight
          sound
        }
        animal3: animal(species: "Tiger") {
          species
          age
          weight
          sound
        }
        # Add more aliases as needed
      }
    `;

    const response = await call(query);

    // Assertions for the response
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('data.animal1.species', 'Lion');
    expect(response.body).toHaveProperty('data.animal2.species', 'Elephant');
    expect(response.body).toHaveProperty('data.animal3.species', 'Tiger');
    expect(response.body).toHaveProperty('data.animal1.sound', expect.any(String));
    expect(response.body).toHaveProperty('data.animal2.age', expect.any(Number));
    // Add more specific assertions as needed
  });

  it('should retrieve information about an animal using GraphQL fragments', async () => {
    // Define a GraphQL fragment
    const animalFragment = `
      fragment AnimalInfo on Animal {
        species
        age
        weight
        sound
      }
    `;

    // Use the fragment in the query
    const query = `
      ${animalFragment}
      query {
        lion: animal(species: "Lion") {
          ...AnimalInfo
        }
      }
    `;

    const response = await call(query);

    // Assertions for the response
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('data.lion.species', 'Lion');
    expect(response.body).toHaveProperty('data.lion.age', expect.any(Number));
    expect(response.body).toHaveProperty('data.lion.weight', expect.any(Number));
    expect(response.body).toHaveProperty('data.lion.sound', expect.any(String));
  });

  it('should retrieve information about an animal using variables', async () => {
    // Define a GraphQL query with variables
    const query = `
      query GetAnimalInfo($species: String!) {
        animal(species: $species) {
          species
          age
          weight
          sound
        }
      }
    `;

    // Set the variables
    const variables = {
      species: 'Lion',
    };

    const response = await call(query, variables);

    // Assertions for the response
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('data.animal.species', 'Lion');
    expect(response.body).toHaveProperty('data.animal.age', expect.any(Number));
    expect(response.body).toHaveProperty('data.animal.weight', expect.any(Number));
    expect(response.body).toHaveProperty('data.animal.sound', expect.any(String));
  });

  it('should retrieve information about animals using multiple variables and a fragment', async () => {
    // Define a GraphQL fragment for animal information
    const animalFragment = `
      fragment AnimalInfo on Animal {
        species
        age
        weight
        sound
      }
    `;

    // Define a GraphQL query with variables and the animal fragment
    const query = `
      ${animalFragment}
      query GetAnimalsInfo(
        $species1: String!
        $species2: String!
        $species3: String!
        $species4: String!
      ) {
        animal1: animal(species: $species1) {
          ...AnimalInfo
        }
        animal2: animal(species: $species2) {
          ...AnimalInfo
        }
        animal3: animal(species: $species3) {
          ...AnimalInfo
        }
        animal4: animal(species: $species4) {
          ...AnimalInfo
        }
      }
    `;

    // Set the variables for different animal species
    const variables = {
      species1: 'Lion',
      species2: 'Elephant',
      species3: 'Tiger',
      species4: 'Penguin',
    };

    // Make the GraphQL request
    const response = await call(query, variables);

    // Assertions for the response
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('data.animal1.species', 'Lion');
    expect(response.body).toHaveProperty('data.animal2.species', 'Elephant');
    expect(response.body).toHaveProperty('data.animal3.species', 'Tiger');
    expect(response.body).toHaveProperty('data.animal4.species', 'Penguin');
  });

  it('should conditionally include or skip animal information based on directives', async () => {
    // Create the first species
    const createFirstSpeciesMutation = `
      mutation {
        addAnimal(species: "Sparrow", age: 3, weight: 50, sound: "Chirp") {
          species
          age
          weight
          sound
        }
      }
    `;

    await call(createFirstSpeciesMutation);

    // Create the second species
    const createSecondSpeciesMutation = `
      mutation {
        addAnimal(species: "Bee", age: 2, weight: 30, sound: "Buzz") {
          species
          age
          weight
          sound
        }
      }
    `;

    await call(createSecondSpeciesMutation);

    // Define a GraphQL query with variables and directives
    const query = `
      query {
        animal(species: "Sparrow") {
          species
          age @include(if: true)
          weight @skip(if: false)
          sound
        }
      }
    `;

    // Make the GraphQL request with included age information
    const responseIncludeInfo = await call(query);

    // Assertions for the response with included age information
    expect(responseIncludeInfo.status).toBe(200);
    expect(responseIncludeInfo.body).toEqual({
      data: {
        animal: {
          species: 'Sparrow',
          age: 3,
          weight: 50,
          sound: 'Chirp',
        },
      },
    });

    // Define a GraphQL query with skipped weight information
    const querySkipInfo = `
      query {
        animal(species: "Bee") {
          species
          age @include(if: false)
          weight @skip(if: true)
          sound
        }
      }
    `;

    // Make the GraphQL request with skipped weight information
    const responseSkipInfo = await call(querySkipInfo);

    // Assertions for the response with skipped weight information
    expect(responseSkipInfo.status).toBe(200);
    expect(responseSkipInfo.body).toEqual({
      data: {
        animal: {
          species: 'Bee',
          age: undefined,
          weight: undefined,
          sound: 'Buzz',
        },
      },
    });
  });






});

