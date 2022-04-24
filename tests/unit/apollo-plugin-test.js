import { expect, assert } from "chai";
import { ApolloServer } from "apollo-server";
import { apolloDynamicPlugin } from "../../lib/apollo-plugin.js";
import { schema, resolvers } from "../graphql/init-index.js";
import { dynamicSchema, dynamicResolvers } from "../graphql/dynamic-index.js";

describe("apollo", () => {
  describe("query", () => {
    it("should returns hello with the provided name", async () => {
      const testServer = new ApolloServer({
        typeDefs: schema,
        resolvers,
      });

      const result = await testServer.executeOperation({
        query: "query hello($name: String) { hello(name: $name) }",
        variables: { name: "world" },
      });

      expect(result.errors).to.be.undefined;
      expect(result.data?.hello).to.be.equal("Hello world!");
    });
  });
  describe("plugin", () => {
    it("should returns hello with the provided name", async () => {
      const testServer = new ApolloServer({
        typeDefs: schema,
        resolvers,
        plugins: [
          apolloDynamicPlugin((context) => {
            const { appendSchema, removeSchema, schemaChanged } = context;
            assert.isFunction(
              appendSchema,
              "valid appendSchema function in context"
            );
            assert.isFunction(
              removeSchema,
              "valid removeSchema function in context"
            );
            assert.isFunction(
              schemaChanged,
              "valid schemaChanged function in context"
            );

            // if (appendSchema) {
            //   appendSchema("dynamicSchema", dynamicSchema, dynamicResolvers);
            // }
          }),
        ],
      });

      const result = await testServer.executeOperation({
        query: "query helloDynamic($name: String) { hello(name: $name) }",
        variables: { name: "world" }
      });

      if (result.errors) {
        console.error(result.errors);
      }
      expect(result.errors).to.be.undefined;
      expect(result.data?.hello).to.be.equal("Hello world!");
    });
  });
});
