// server.ts
import readline from 'readline';
import GraphQLServer from './GraphQLServer';

const [, , command, port] = process.argv;

async function run() {
  const graphqlServer = new GraphQLServer();

  if (command === 'start') {
    await graphqlServer.startServer(Number(port) || 4000);
  }

  readline.createInterface({
    input: process.stdin, 
    output: process.stdout,})
  .question('Press Enter to exit...', () => {
    console.log('Stopping server...');
    graphqlServer.stopServer();
    process.exit(0);
  });
}

run();