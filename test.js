'use strict'

const Hapi = require('hapi')
const { ApolloServer, gql } = require('apollo-server-hapi');


const myGraphQLSchema = "" // ... define or import your schema here!

const HOST = 'localhost'
const PORT = 3000

const typeDefs = gql`
  type Query {
    hello: String
  }
`;

// Provide resolver functions for your schema fields
const resolvers = {
  Query: {
    hello: () => 'Hello world!',
  },
};

async function start_server() {

  const server = new ApolloServer({ typeDefs, resolvers });

  const app = new Hapi.server({
    port: 4000,
  });

  await server.applyMiddleware({
    app,
  });

  await server.installSubscriptionHandlers(app.listener);

  await app.start();

    console.log(`🚀 Server ready at http://${HOST}:${PORT}${server.graphqlPath}`)

}

start_server()