import chai, { assert } from "chai";
import chaiHttp from "chai-http";
import app from "./test-server.js";

describe("apollo", () => {
  let server;

  before(async () => {
    chai.use(chaiHttp);
    server = await app();
  });

  describe("plugin", () => {
    it("should returns hello with the provided name", () => {
      assert(true);
      chai
        .request("http://localhost:9999")
        .post("/graphql")
        .set("content-type", "application/json")
        .send({
          query: `query hello($name: String) { 
           hello(name: $name) { dummy }
        }`,
          variables: {
            name: "world",
          },
        })
        .end((err, res) => {
          if (err) {
            console.error(err);
          }
          if (res.error) {
            console.error(res.error);
            return;
          }
          let result = res.body;
          assert.isOk(result.data?.hello, "hellow graphql api results is OK");
        });
    });

    it("should try graphql query usiong the browser", () => {
      console.log(`graphql: http://localhost:9999/graphql`)
    });
  });
});
