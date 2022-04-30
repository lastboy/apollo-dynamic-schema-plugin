import { ApolloServer } from "apollo-server";
import { expect, assert } from "chai";
import { apolloDynamicPlugin } from "../../lib/apollo-plugin.js";
import { schema, resolvers } from "../graphql/init-index.js";
import {
  dynamicSchema,
  dynamicResolvers,
  dynamicAppendResolvers,
} from "../graphql/dynamic-index.js";
import _ from "lodash";

describe("apollo", () => {
  // describe("query", () => {
  //   it("should results hello w/o dynamic plugin setup", async () => {
  //     const testServer = new ApolloServer({
  //       typeDefs: schema,
  //       resolvers,
  //     });

  //     const result = await testServer.executeOperation({
  //       query: "query hello($name: String) { hello(name: $name) { dummy } }",
  //       variables: { name: "world" },
  //     });

  //     expect(result.errors).to.be.undefined;
  //     expect(result.data?.hello.dummy).to.be.equal("Hello world!");
  //   });
  // });

  // describe("plugin", () => {
  //   it("should returns hello with the provided name", async () => {
  //     const testServer = new ApolloServer({
  //       typeDefs: schema,
  //       resolvers,
  //       plugins: [
  //         apolloDynamicPlugin((context) => {
  //           const { appendSchema, removeSchema, setApolloServer, useSchema } =
  //             context;
  //           assert.isFunction(
  //             appendSchema,
  //             "valid appendSchema function in context"
  //           );
  //           assert.isFunction(
  //             removeSchema,
  //             "valid removeSchema function in context"
  //           );
  //           if (appendSchema) {
  //             appendSchema("dynamicSchema", dynamicSchema, dynamicResolvers);
  //             useSchema("dynamicSchema");
  //             setApolloServer(testServer);
  //           }
  //         }),
  //       ],
  //     });

  //     const result1 = await testServer.executeOperation({
  //       query: "query hello($name: String) { hello(name: $name) { dummy }  }",
  //       variables: { name: "world" },
  //     });

  //     assert.isOk(result1, "valid graphql results object");
  //     expect(result1.errors).to.be.undefined;

  //     const result2 = await testServer.executeOperation({
  //       query: "query hello($name: String) { hello(name: $name) { name }}",
  //       variables: { name: "world" },
  //     });

  //     assert.isOk(result2, "valid graphql results object");
  //     if (result2.errors) {
  //       console.error(result2.errors);
  //     }
  //     expect(result2.errors).to.be.undefined;
  //     expect(result2.data?.hello?.name).to.be.equal("world");
  //   });
  // });

  describe("plugin", () => {
    it("should returns hello with the provided name", async () => {
      const testServer = new ApolloServer({
        typeDefs: dynamicSchema,
        resolvers: dynamicAppendResolvers,
        plugins: [
          apolloDynamicPlugin((context) => {
            const { setApolloServer } = context;
            setApolloServer(testServer);
          }),
        ],
      });

      const result = await testServer.executeOperation({
        query:
          "query hello($name: String) { hello(name: $name) { name description} }",
        variables: { name: "world" },
      });

      assert.isOk(result, "valid graphql results object");
      if (result.errors) {
        console.error(result.errors);
      }
      expect(result.errors).to.be.undefined;
      expect(result.data?.hello?.name).to.be.equal("world");

      const result1 = await testServer.executeOperation({
        query:
          "query hello($name: String) { hello(name: $name) { name description next} }",
        variables: { name: "world" },
      });

      assert.isOk(result1, "valid graphql results object");
      if (result1.errors) {
        console.error(result1.errors);
      }
      expect(result1.errors).to.be.undefined;
      expect(result1.data?.hello?.name).to.be.equal("world");
    });
  });
});
