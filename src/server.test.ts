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
    let query = `
    query {
      animals {
        __typename
        species
        age
        weight
        sound
      }
    }
  `;

    let response = await call(query);

    expect(response.status).toBe(200);

    const animals = response.body.data.animals;
    
    expect(animals[0].__typename).toBe('Carnivorous')
    expect(animals[0].species).toBe('Lion')
    expect(animals[0].age).toBe(5)
    expect(animals[0].weight).toBe(200)
    expect(animals[0].sound).toBe('Roar')

    expect(animals[1].__typename).toBe('Herbivorous')
    expect(animals[1].species).toBe('Elephant')
    expect(animals[1].age).toBe(10)
    expect(animals[1].weight).toBe(5000)
    expect(animals[1].sound).toBe('Trumpet')

    expect(animals[2].__typename).toBe('Insect')
    expect(animals[2].species).toBe('Grasshopper')
    expect(animals[2].age).toBe(0.3)
    expect(animals[2].weight).toBe(0.002)
    expect(animals[2].sound).toBe('Chirp')
  });

  it.only('should add a new animal with usage of inline fragments', async () => {
    const query = `
      mutation {
        addAnimal(
          species: "Tiger",
          age: 13,
          weight: 250,
          sound: "Roar",
          favoriteFood: "Meat"
        ) {
          species
          age
          weight
          sound
          ... on Carnivorous {
            favoriteFood
          }
        }
      }
    `;
    const response = await call(query);

    console.log(response.body);
    const addedAnimal = response.body.data.addAnimal;

    expect(addedAnimal.species).toBe('Tiger');
    // Check other fields based on the type of animal (Carnivorous, Herbivorous, Insect)
    if ('favoriteFood' in addedAnimal) {
      // It's a Carnivorous animal
      expect(addedAnimal.favoriteFood).toBe('');
    } else if ('eatsPlants' in addedAnimal) {
      // It's a Herbivorous animal
      expect(addedAnimal.eatsPlants).toBe(false);
      expect(addedAnimal.favoritePlant).toBe('');
    } else if ('eatsInsects' in addedAnimal) {
      // It's an Insect
      expect(addedAnimal.eatsInsects).toBe(false);
      expect(addedAnimal.favoriteFood).toBe('');
    }
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

  it('should retrieve information about an animal using default variable value', async () => {
    const query = `
      query GetAnimals($species: String = "Tiger") {
        animal(species: $species) {
          species
          age
          weight
          sound
        }
      }
    `;
  
    const response = await call(query);
  
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('data.animal.species', 'Tiger');
  });

  it('should retrieve information about a specific animal', async () => {
    const query = `
      query GetAnimals($species: String = "Elephant") {
        animal(species: $species) {
          species
          age
          weight
          sound
        }
      }
    `;
  
    const variables = {
      species: 'Tiger',
    };
  
    const response = await call(query, variables);
  
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('data.animal.species', 'Tiger');
  });

  it('should retrieve information about a specific animal', async () => {
    const query = `
      query {
        animals {
          __typename
          species
          age
          weight
          sound
        }
      }
    `;
  
    const response = await call(query);
  
    //expect(response.status).toBe(200);
    expect(response.body).toBe('data.animal.species');
  });


});


