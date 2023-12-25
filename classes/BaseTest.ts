import request, { Test} from 'supertest';
import { Express } from 'express';
import GraphQLServer from './GraphQLServer';


let graphqlServer: GraphQLServer;

class BaseTest {
  static makeGraphqlRequest: any;
  
  

  constructor() {
    graphqlServer = new GraphQLServer();
    const app: Express = graphqlServer.getTestApp();
  }

  startServer(port : number): void {
    graphqlServer = new GraphQLServer();
    graphqlServer.startServer(port);
  }

  stopServer(): void {
    graphqlServer.stopServer();
  }

  async makeGraphqlRequest(query: string): Promise<Test> {
    return await request(graphqlServer.getTestApp())
      .post(graphqlServer.server?.graphqlPath || '')
      .send({ query : query})
      .expect(200);
  }
}

export default BaseTest;
