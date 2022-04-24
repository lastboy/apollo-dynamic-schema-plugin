import chai from "chai";
import express from "express";
import { apolloDynamicPlugin } from "../../lib/apollo-plugin.js";
import { schema, resolvers } from "../graphql/init-index.js";
import { dynamicSchema, dynamicResolvers } from "../graphql/dynamic-index.js";
import { ApolloServer } from "apollo-server-express";
import {
    ApolloServerPluginLandingPageGraphQLPlayground,
  } from "apollo-server-core";

export default (async () => {
  const port = 9999;
  const app = express();
  const server = new ApolloServer({
    typeDefs: schema,
    resolvers,
    playground: true,
    plugins: [
      ApolloServerPluginLandingPageGraphQLPlayground,
      apolloDynamicPlugin((context) => {
        const { appendSchema, removeSchema, schemaChanged } = context;
        chai.assert.isFunction(
          appendSchema,
          "valid appendSchema function in context"
        );
        chai.assert.isFunction(
          removeSchema,
          "valid removeSchema function in context"
        );
        chai.assert.isFunction(
          schemaChanged,
          "valid schemaChanged function in context"
        );

        if (appendSchema) {
          appendSchema("dynamicSchema", dynamicSchema, dynamicResolvers);
        }
      }),
    ],
    context: ({ ctx }) => {
      return {};
    },
  });

  await server.start();
  server.applyMiddleware({ app, path: "/graphql" });

  app.listen({ port });
  console.log(`test server started on port ${port}`);

  return app;
});
