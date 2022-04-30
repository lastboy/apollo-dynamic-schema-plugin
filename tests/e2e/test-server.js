import chai from "chai";
import express from "express";
import { apolloDynamicPlugin } from "../../lib/apollo-plugin.js";
import { schema, resolvers } from "../graphql/init-index.js";
import { dynamicSchema, dynamicResolvers } from "../graphql/dynamic-index.js";
import { ApolloServer } from "apollo-server-express";
import {
    ApolloServerPluginLandingPageGraphQLPlayground,
  } from "apollo-server-core";
import _ from "lodash";

export default (async () => {
  const port = 9999;
  const app = express();
  const testServer = new ApolloServer({
    typeDefs: schema,
    resolvers,
    playground: true,
    plugins: [
      ApolloServerPluginLandingPageGraphQLPlayground,
      apolloDynamicPlugin((context) => {
        const { appendSchema, removeSchema, setApolloServer, useSchemaKey } = context;
        chai.assert.isFunction(
          appendSchema,
          "valid appendSchema function in context"
        );
        chai.assert.isFunction(
          removeSchema,
          "valid removeSchema function in context"
        );
        if (appendSchema) {
          const useSchemaKey = true;
          appendSchema("dynamicSchema", dynamicSchema, dynamicResolvers, useSchemaKey);
          setApolloServer(testServer);
        }      
      }),
    ],
    context: ({ ctx }) => {
      return {};
    },
  });

  await testServer.start();
  testServer.applyMiddleware({ app, path: "/graphql" });

  app.listen({ port });
  console.log(`test server started on port ${port}`);

  return app;
});
