import request, { Test} from 'supertest';
import {GraphQLServer} from './GraphQLServer';

let graphqlServer: GraphQLServer;

class BaseTest {

  startServer(port : number): void {
    graphqlServer = new GraphQLServer();
    graphqlServer.startServer(port);
  }

  stopServer(): void {
    graphqlServer.stopServer();
  }

  async makeGraphqlRequest(query: string, variables?: Record<string, any>): Promise<Test> {
    const requestBody = variables ? { query, variables } : { query };
    return await request(graphqlServer.getApp())
      .post(graphqlServer.getServer()?.graphqlPath || '')
      .send(requestBody);
  }
}

export default BaseTest;
