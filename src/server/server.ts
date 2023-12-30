// server.ts
import { EventEmitter } from 'events';
import readline from 'readline';
import GraphQLServer from './GraphQLServer';

const [, , command, port] = process.argv;

const eventEmitter = new EventEmitter();

async function run() {
  if (command === 'start') {
    const graphqlServer = new GraphQLServer();
    await graphqlServer.startServer(Number(port) || 4000);

    // Listen for the stop event
    eventEmitter.on('stop', () => {
      console.log('Stopping server...');
      graphqlServer.stopServer();
      process.exit(0);
    });

    // Wait for the user to press Enter before exiting
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question('Press Enter to exit...', () => {
      rl.close();
      console.log('Exiting...');
      // Emit the stop event when Enter is pressed
      eventEmitter.emit('stop');
    });
  }
}

run();
