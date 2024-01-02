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

  it('should return a list of animals with metafields (__typename)', async () => {
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

  it('should add a new animal with usage of inline fragments', async () => {
    let query = `
      mutation {
        addAnimal(
          species: "TigerAdded",
          age: 13,
          weight: 250,
          sound: "Roar",
          favoriteFood: "Fish"
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
    let response = await call(query);
    expect(response.status).toBe(200);

    const expectedAnimal =
    {
      species: 'TigerAdded',
      age: 13,
      weight: 250,
      sound: 'Roar',
      favoriteFood: 'Fish'
    }

    expect(response.body.data.addAnimal).toStrictEqual(
      expectedAnimal);

    query = `
    query {
      animal(species: "TigerAdded") {
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
    response = await call(query);
    expect(response.status).toBe(200);

    expect(response.body.data.animal).toStrictEqual(
      expectedAnimal);
  });

  it('setAnimalBySpecies should update the correct animal', async () => {
    // Assuming you have a mutation to add animals
    const addAnimalMutation = `
      mutation {
        addAnimal(species: "LionUpdated", age: 5, weight: 200, sound: "Roar", favoriteFood: "Goat") {
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

    // Add an animal using the mutation
    const addAnimalResponse = await call(addAnimalMutation);

    expect(addAnimalResponse.status).toBe(200);

    // Ensure that the animal was added successfully
    const addedAnimal = addAnimalResponse.body.data.addAnimal;

    // Now, test the setAnimalBySpecies mutation
    const setAnimalMutation = `
      mutation {
        setAnimal(
          species: "LionUpdated",
          age: 6,
          weight: 220,
          sound: "Roarrrr",
          favoriteFood: "Deer", 
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

    // Update the animal using the mutation
    const setAnimalResponse = await call(setAnimalMutation);

    expect(setAnimalResponse.status).toBe(200);

    // Ensure that the animal was updated successfully
    const updatedAnimal = setAnimalResponse.body.data.setAnimal;

    // The setAnimalBySpecies mutation should return the updated animal
    expect(updatedAnimal).toEqual({
      species: addedAnimal.species,
      age: 6,
      weight: 220,
      sound: "Roarrrr",
      favoriteFood: "Deer",     // Updated favoriteFood for Carnivorous
    });
  });

  it('should delete the correct animal by species', async () => {
    // Assuming you have a mutation to add animals
    const addAnimalMutation = `
      mutation {
        addAnimal(species: "GiraffeAdded", age: 8, weight: 1200, sound: "Hum", favoritePlant: "bananas") {
          species
          age
          weight
          sound
          ... on Herbivorous {
            favoritePlant
          }
        }
      }
    `;

    // Add an animal using the mutation
    const addAnimalResponse = await call(addAnimalMutation);

    expect(addAnimalResponse.status).toBe(200);

    // Ensure that the animal was added successfully
    const addedAnimal = addAnimalResponse.body.data.addAnimal;

    // Now, test the deleteAnimal mutation
    const deleteAnimalMutation = `
      mutation {
        deleteAnimal(species: "GiraffeAdded")
      }
    `;

    // Delete the animal using the mutation
    const deleteAnimalResponse = await call(deleteAnimalMutation);

    expect(deleteAnimalResponse.status).toBe(200);

    // Ensure that the deleteAnimal mutation returns true (success)
    const deleteSuccess = deleteAnimalResponse.body.data.deleteAnimal;

    // The deleteAnimalBySpecies mutation should return true for success
    expect(deleteAnimalResponse.body.data.deleteAnimal).toBe(true);

    // Now, try to get the deleted animal by species
    const getAnimalQuery = `
      query {
        animal(species: "GiraffeAdded") {
          species
        }
      }
    `;

    // Attempt to get the deleted animal (should be null)
    const getAnimalResponse = await call(getAnimalQuery);

    expect(getAnimalResponse.status).toBe(200);

    // Ensure that the returned animal is null
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
    const deleteAnimalResponse = await call(deleteAnimalMutation);

    // Ensure that the deleteAnimal mutation returns false for non-existing animal and has a 200 status code
    expect(deleteAnimalResponse.status).toBe(200);
    expect(deleteAnimalResponse.body.data.deleteAnimal).toBe(false);
  });

  it('should return the correct sound using GraphQL query', async () => {
    // Assuming you have a mutation to add animals
    const addAnimalMutation = `
    mutation {
      addAnimal(
        species: "Dog",
        age: 2,
        weight: 20,
        sound: "Woof",
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

    // Add an animal using the mutation
    const response = await call(addAnimalMutation);

    // Now, test the makeSound query
    const makeSoundQuery = `
      query {
        makeSound(species: "Dog")
      }
    `;

    // Get the sound of the added animal using the makeSound query
    const soundResponse = await call(makeSoundQuery);

    // Ensure that the returned sound matches the expected value and has a 200 status code
    expect(soundResponse.status).toBe(200);
    expect(soundResponse.body.data.makeSound).toBe('Dog makes the sound: Woof');
  });

  it('should return null when trying to make sound for a non-existing animal', async () => {
    // Attempt to make a sound for a non-existing animal using the makeSound query
    const makeSoundQuery = `
      query {
        makeSound(species: "NonExistentAnimal")
      }
    `;

    // Try to make a sound for the non-existing animal
    const makeSoundResponse = await call(makeSoundQuery);

    // Ensure that the response status is OK (200)
    expect(makeSoundResponse.status).toBe(200);

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
          ... on Carnivorous {
            favoriteFood
          }
        }
        elephant: animal(species: "Elephant") {
          species
          age
          weight
          sound
          ... on Herbivorous {
            favoritePlant
          }
        }
      }
    `;

    const response = await call(query);

    // Assertions for the response
    expect(response.status).toBe(200);

    // Assertions for Lion
    expect(response.body.data.lion.species).toBe('Lion');
    expect(response.body.data.lion.age).toBe(5);
    expect(response.body.data.lion.weight).toBe(200);
    expect(response.body.data.lion.sound).toBe("Roar");
    expect(response.body.data.lion.favoriteFood).toEqual("Meat");

    // Assertions for Elephant
    expect(response.body.data.elephant.species).toBe('Elephant');
    expect(response.body.data.elephant.age).toBe(10);
    expect(response.body.data.elephant.weight).toBe(5000);
    expect(response.body.data.elephant.sound).toBe("Trumpet");
    expect(response.body.data.elephant.favoritePlant).toEqual("Vegetables");
  });

  it('should retrieve information about all animals with aliases', async () => {
    const query = `
      query {
        animal1: animal(species: "Lion") {
          species
          age
          weight
          sound
          ... on Carnivorous {
            favoriteFood
          }
        }
        animal2: animal(species: "Elephant") {
          species
          age
          weight
          sound
          ... on Herbivorous {
            favoritePlant
          }
        }
        animal3: animal(species: "Grasshopper") {
          species
          age
          weight
          sound
          ... on Insect {
            eatsInsects
            favoriteInsect
          }
        }
        # Add more aliases as needed
      }
    `;
    const response = await call(query);

    // Assertions for the response
    expect(response.status).toBe(200);

    // Assertions for animal1 (Lion)
    expect(response.body.data.animal1.species).toBe('Lion');
    expect(response.body.data.animal1.age).toBe(5);
    expect(response.body.data.animal1.weight).toBe(200);
    expect(response.body.data.animal1.sound).toBe('Roar');
    expect(response.body.data.animal1.favoriteFood).toEqual('Meat');

    // Assertions for animal2 (Elephant)
    expect(response.body.data.animal2.species).toBe('Elephant');
    expect(response.body.data.animal2.age).toBe(10);
    expect(response.body.data.animal2.weight).toBe(5000);
    expect(response.body.data.animal2.sound).toBe('Trumpet');
    expect(response.body.data.animal2.favoritePlant).toEqual('Vegetables');

    // Assertions for animal3 (Grasshopper)
    expect(response.body.data.animal3.species).toBe('Grasshopper');
    expect(response.body.data.animal3.age).toBe(0.3); // Adjust as needed
    expect(response.body.data.animal3.weight).toBe(0.002); // Adjust as needed
    expect(response.body.data.animal3.sound).toBe('Chirp'); // Adjust as needed
    expect(response.body.data.animal3.eatsInsects).toBe(true); // Adjust as needed
    expect(response.body.data.animal3.favoriteInsect).toEqual('Grass'); // Adjust as needed
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
    expect(response.body.data.lion.species).toBe('Lion');
    expect(response.body.data.lion.age).toBe(5); // Replace with the actual age value
    expect(response.body.data.lion.weight).toBe(200); // Replace with the actual weight value
    expect(response.body.data.lion.sound).toBe('Roar'); // Replace with the actual sound value
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
    expect(response.body.data.animal.species).toBe('Lion');
    expect(response.body.data.animal.age).toBe(5); // Replace with the actual age value
    expect(response.body.data.animal.weight).toBe(200); // Replace with the actual weight value
    expect(response.body.data.animal.sound).toBe('Roar'); // Replace with the actual sound value
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
    // Assertions for animal1 (Lion)
    expect(response.body.data.animal1.species).toBe('Lion');
    expect(response.body.data.animal1.age).toBe(5); // Replace with the actual age value
    expect(response.body.data.animal1.weight).toBe(200); // Replace with the actual weight value
    expect(response.body.data.animal1.sound).toBe('Roar'); // Replace with the actual sound value
    // Assertions for animal2 (Elephant)
    expect(response.body.data.animal2.species).toBe('Elephant');
    expect(response.body.data.animal2.age).toBe(10); // Replace with the actual age value
    expect(response.body.data.animal2.weight).toBe(5000); // Replace with the actual weight value
    expect(response.body.data.animal2.sound).toBe('Trumpet'); // Replace with the actual sound value
    // Assertions for animal3 (Tiger)
    expect(response.body.data.animal3.species).toBe('Tiger');
    // Assertions for animal4 (Penguin)
    expect(response.body.data.animal4.species).toBe('Penguin');
  });

  it('should conditionally include or skip animal information based on directives', async () => {
    // Create the first species (Carnivorous - Lion)
    const createFirstSpeciesMutation = `
      mutation {
        addCarnivorous: addAnimal(
          species: "LionAdded",
          age: 5,
          weight: 200,
          sound: "Roar",
          favoriteFood: "Gazelle"
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

    await call(createFirstSpeciesMutation);

    // Create the second species (Herbivorous - Giraffe)
    const createSecondSpeciesMutation = `
      mutation {
        addHerbivorous: addAnimal(
          species: "GiraffeAdded",
          age: 8,
          weight: 1200,
          sound: "Hum",
          favoritePlant: "Acacia leaves"
        ) {
          species
          age
          weight
          sound
          ... on Herbivorous {
            favoritePlant
          }
        }
      }
    `;

    await call(createSecondSpeciesMutation);

    // Define a GraphQL query with variables and directives
    const query = `
      query {
        lion: animal(species: "LionAdded") {
          species
          age @include(if: true)
          weight @skip(if: false)
          sound
          ... on Carnivorous {
            favoriteFood
          }
        }
        giraffe: animal(species: "GiraffeAdded") {
          species
          age @include(if: false)
          weight @skip(if: true)
          sound
          ... on Herbivorous {
            favoritePlant
          }
        }
      }
    `;

    // Make the GraphQL request
    const response = await call(query);

    // Assertions for the response
    expect(response.status).toBe(200);

    // Assertions for Lion (Carnivorous)
    expect(response.body.data.lion.species).toBe('LionAdded');
    expect(response.body.data.lion.age).toBe(5);
    expect(response.body.data.lion.weight).toBe(200);
    expect(response.body.data.lion.sound).toBe('Roar');
    expect(response.body.data.lion.favoriteFood).toEqual('Gazelle');

    // Assertions for Giraffe (Herbivorous)
    expect(response.body.data.giraffe.species).toBe('GiraffeAdded');
    expect(response.body.data.giraffe.age).toBeUndefined(); // Age should be skipped
    expect(response.body.data.giraffe.weight).toBeUndefined(); // Weight should be skipped
    expect(response.body.data.giraffe.sound).toBe('Hum');
    expect(response.body.data.giraffe.favoritePlant).toEqual('Acacia leaves');
  });

  it('should retrieve information about an animal using default variable value', async () => {
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

    const response = await call(query);

    // Assertions for the response
    expect(response.status).toBe(200);
    expect(response.body.data.animal.species).toBe('Elephant');
    expect(response.body.data.animal.age).toBe(10); // Adjust as needed
    expect(response.body.data.animal.weight).toBe(5000); // Adjust as needed
    expect(response.body.data.animal.sound).toBe('Trumpet'); // Adjust as needed
  });

  it('should retrieve information about a specific animal', async () => {
    const query = `
      query GetAnimals($species: String = "Grasshopper") {
        animal(species: $species) {
          species
          age
          weight
          sound
        }
      }
    `;

    const variables = {
      species: 'Grasshopper',
    };

    const response = await call(query, variables);

    // Assertions for the response
    expect(response.status).toBe(200);
    expect(response.body.data.animal.species).toBe('Grasshopper');
    expect(response.body.data.animal.age).toBe(0.3); // Adjust as needed
    expect(response.body.data.animal.weight).toBe(0.002); // Adjust as needed
    expect(response.body.data.animal.sound).toBe('Chirp'); // Adjust as needed
  });

  it('should create an Insect animal and query for it', async () => {
    // Add an Insect using mutation
    const addInsectMutation = `
      mutation {
        addAnimal(
          species: "DragonflyAdded",
          age: 0.2,
          weight: 0.002,
          sound: "Buzz",
          eatsInsects: true,
          favoriteInsect: "Mosquito"
        ) {
          species
          age
          weight
          sound
          ... on Insect {
            eatsInsects
            favoriteInsect
          }
        }
      }
    `;

    const addInsectResponse = await call(addInsectMutation);

    // Assertions for adding the Insect
    expect(addInsectResponse.status).toBe(200);
    expect(addInsectResponse.body).toHaveProperty('data.addAnimal.species', 'DragonflyAdded');
    expect(addInsectResponse.body).toHaveProperty('data.addAnimal.age', 0.2);
    expect(addInsectResponse.body).toHaveProperty('data.addAnimal.weight', 0.002);
    expect(addInsectResponse.body).toHaveProperty('data.addAnimal.sound', 'Buzz');
    expect(addInsectResponse.body).toHaveProperty('data.addAnimal.eatsInsects', true);
    expect(addInsectResponse.body).toHaveProperty('data.addAnimal.favoriteInsect', 'Mosquito');

    // Query for the added Insect
    const queryAddedInsect = `
      query {
        animal(species: "DragonflyAdded") {
          species
          age
          weight
          sound
          ... on Insect {
            eatsInsects
            favoriteInsect
          }
        }
      }
    `;

    const queryAddedInsectResponse = await call(queryAddedInsect);

    // Assertions for querying the added Insect
    expect(queryAddedInsectResponse.status).toBe(200);
    expect(queryAddedInsectResponse.body).toHaveProperty('data.animal.species', 'DragonflyAdded');
    expect(queryAddedInsectResponse.body).toHaveProperty('data.animal.age', 0.2);
    expect(queryAddedInsectResponse.body).toHaveProperty('data.animal.weight', 0.002);
    expect(queryAddedInsectResponse.body).toHaveProperty('data.animal.sound', 'Buzz');
    expect(queryAddedInsectResponse.body).toHaveProperty('data.animal.eatsInsects', true);
    expect(queryAddedInsectResponse.body).toHaveProperty('data.animal.favoriteInsect', 'Mosquito');
  });

  it('should throw an error for invalid animal type', async () => {
    // Attempt to add an animal with an invalid type
    const addInvalidAnimalMutation = `
      mutation {
        addAnimal(
          species: "InvalidAnimal",
          age: 1,
          weight: 10,
          sound: "InvalidSound",
        ) {
          species
          age
          weight
          sound
        }
      }
    `;

    const addInvalidAnimalResponse = await call(addInvalidAnimalMutation);

    // Assertions for the response with an invalid animal type
    expect(addInvalidAnimalResponse.status).toBe(200);
    expect(addInvalidAnimalResponse.body).toHaveProperty('errors');
    expect(addInvalidAnimalResponse.body.errors[0]).toHaveProperty('message', 'Invalid animal type');
  });

  it('should update favorite plant for existing Herbivorous animal', async () => {
    // Assuming you have a mutation to add an herbivorous animal
    const addHerbivorousAnimalMutation = `
      mutation {
        addAnimal(
          species: "ElephantTest",
          age: 10,
          weight: 5000,
          sound: "Trumpet",
          favoritePlant: "Vegetables"
        ) {
          species
          age
          weight
          sound
          ... on Herbivorous {
            favoritePlant
          }
        }
      }
    `;

    // Add an herbivorous animal using the mutation
    const addHerbivorousAnimalResponse = await call(addHerbivorousAnimalMutation);

    expect(addHerbivorousAnimalResponse.status).toBe(200);

    // Ensure that the herbivorous animal was added successfully
    const addedHerbivorousAnimal = addHerbivorousAnimalResponse.body.data.addAnimal;

    // Now, test the setAnimal mutation for updating favorite plant
    const setFavoritePlantMutation = `
      mutation {
        setAnimal(
          species: "ElephantTest",
          age: 10,
          weight: 5000,
          sound: "Trumpet",
          favoritePlant: "Bananas"
        ) {
          species
          age
          weight
          sound
          ... on Herbivorous {
            favoritePlant
          }
        }
      }
    `;

    // Update the favorite plant of the existing herbivorous animal
    const setFavoritePlantResponse = await call(setFavoritePlantMutation);

    expect(setFavoritePlantResponse.status).toBe(200);

    // Ensure that the favorite plant was updated successfully
    const updatedHerbivorousAnimal = setFavoritePlantResponse.body.data.setAnimal;

    // The setAnimal mutation should return the updated herbivorous animal
    expect(updatedHerbivorousAnimal).toEqual({
      species: addedHerbivorousAnimal.species,
      age: 10,
      weight: 5000,
      sound: "Trumpet",
      favoritePlant: "Bananas", // Updated favorite plant for Herbivorous
    });
  });

  it('should update favorite insect for existing Insect animal', async () => {
    // Assuming you have a mutation to add an insect animal
    const addInsectAnimalMutation = `
      mutation {
        addAnimal(
          species: "DragonflyTest",
          age: 1,
          weight: 0.01,
          sound: "Buzz",
          eatsInsects: true,
          favoriteInsect: "Mosquito"
        ) {
          species
          age
          weight
          sound
          ... on Insect {
            eatsInsects
            favoriteInsect
          }
        }
      }
    `;

    // Add an insect animal using the mutation
    const addInsectAnimalResponse = await call(addInsectAnimalMutation);

    expect(addInsectAnimalResponse.status).toBe(200);

    // Ensure that the insect animal was added successfully
    const addedInsectAnimal = addInsectAnimalResponse.body.data.addAnimal;

    // Now, test the setAnimal mutation for updating favorite insect
    const setFavoriteInsectMutation = `
      mutation {
        setAnimal(
          species: "DragonflyTest",
          age: 1,
          weight: 0.01,
          sound: "Buzz",
          eatsInsects: true,
          favoriteInsect: "Butterfly"
        ) {
          species
          age
          weight
          sound
          ... on Insect {
            eatsInsects
            favoriteInsect
          }
        }
      }
    `;

    // Update the favorite insect of the existing insect animal
    const setFavoriteInsectResponse = await call(setFavoriteInsectMutation);

    expect(setFavoriteInsectResponse.status).toBe(200);

    // Ensure that the favorite insect was updated successfully
    const updatedInsectAnimal = setFavoriteInsectResponse.body.data.setAnimal;

    // The setAnimal mutation should return the updated insect animal
    expect(updatedInsectAnimal).toEqual({
      species: addedInsectAnimal.species,
      age: 1,
      weight: 0.01,
      sound: "Buzz",
      eatsInsects: true,
      favoriteInsect: "Butterfly", // Updated favorite insect for Insect
    });
  });

  it('should throw an error when trying to update a non-existing animal', async () => {
    // Assuming you have a mutation to update an animal
    const setAnimalMutation = `
      mutation {
        setAnimal(
          species: "NonExistentAnimal",
          age: 5,
          weight: 200,
          sound: "Roar"
        ) {
          species
          age
          weight
          sound
        }
      }
    `;

    // Try to update a non-existing animal using the setAnimal mutation
    const setAnimalResponse = await call(setAnimalMutation);

    // Ensure that the setAnimal mutation throws an error for non-existing animal
    expect(setAnimalResponse.status).toBe(200);
    expect(setAnimalResponse.body).toHaveProperty('errors');
    expect(setAnimalResponse.body.errors[0].message).toBe('Animal with species NonExistentAnimal not found');
  });



});


