import { expect, assert } from "chai";
import { ApolloServer } from "apollo-server";
import { apolloDynamicPlugin } from "../../lib/apollo-plugin.js";
import { schema, resolvers } from "../graphql/init-index.js";
import { dynamicSchema, dynamicResolvers } from "../graphql/dynamic-index.js";
import _ from "lodash";

describe("apollo", () => {
  describe("query", () => {
    it("should returns hello with the provided name", async () => {
      const testServer = new ApolloServer({
        typeDefs: schema,
        resolvers,
      });

      const result = await testServer.executeOperation({
        query: "query hello($name: String) { hello(name: $name) { dummy } }",
        variables: { name: "world" },
      });

      expect(result.errors).to.be.undefined;
      expect(result.data?.hello.dummy).to.be.equal("Hello world!");
    });
  });
  
  describe("plugin", () => {
    it("should returns hello with the provided name", async () => {
      const testServer = new ApolloServer({
        typeDefs: schema,
        resolvers,
        plugins: [
          apolloDynamicPlugin((context) => {
            const {
              appendSchema,
              removeSchema,
              schemaChanged,
              setApolloServer,
            } = context;
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

            if (appendSchema) {
              appendSchema("dynamicSchema", dynamicSchema, dynamicResolvers);       
              setApolloServer(testServer);       
            }
          }),
        ],
      });

      const result1 = await testServer.executeOperation({
        query:
          "query hello($name: String) { hello(name: $name) { dummy }  }",
        variables: { name: "world" },
      });

      const result2 = await testServer.executeOperation({
        query:
          "query hello($name: String) { hello(name: $name) { name }}",
        variables: { name: "world" },
      });


      if (result2.errors) {
        console.error(result2.errors);
      }
      expect(result2.errors).to.be.undefined;
      expect(result2.data?.hello?.name).to.be.equal("world");
    });
  });
});
