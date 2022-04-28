const testSchema = `
  type Query {
    hello(name: String): Test
  }

  type Test {
    dummy: String
  }
`

export default testSchema;