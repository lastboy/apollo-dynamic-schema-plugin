const dynamicSchema = `
    type Query {
        hello(name: String): Test
    }
  
    type Test {
        name: String
        description: String
    }

  `;

export default dynamicSchema;
