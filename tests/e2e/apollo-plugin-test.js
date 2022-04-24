// import { request, expect, assert, use as chaiUse } from "chai";
import chai from "chai"
import chaiHttp from "chai-http";
import app from "./test-server.js"
// import { ApolloServer } from "apollo-server-express";
// import { apolloDynamicPlugin } from "../../lib/apollo-plugin.js";
import { schema, resolvers } from "../graphql/init-index.js";
import { dynamicSchema, dynamicResolvers } from "../graphql/dynamic-index.js";

describe("apollo", () => {

  let server;

  before(async () => {
    chai.use(chaiHttp);
    server = await app();
  })
  
  describe("plugin", async() => {
    it("should returns hello with the provided name", async () => {

      chai.request('http://localhost:9999')
      .post('/graphql')
      .set('content-type', 'application/json')
      .send({
        'query' : `query hello($name: String) { 
           hello(name: $name) { name }
        }`,
        'variables' : {
           'name': 'world'
         }
      })
      .end((err, res) => {
        if (err) { 
          console.error(err);
         }
        if (res.error) {
          console.error(res.error);
          return;
        }
        let data = res.body;
      })

      // if (result.errors) {
      //   console.error(result.errors);
      // }
      // expect(result.errors).to.be.undefined;
      // expect(result.data?.hello).to.be.equal("Hello world!");
    });
  });
});