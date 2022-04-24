const dynamicSchema = `
    type Query {
        hello(name: String): Test
    }
  
    type Test {
        name: String
        description: String
    }
  `;

const dynamicResolvers = {
  Query: {
    hello: (parent, args, context, info) => {
      const { name } = args;
      return {
        name,
        description: " always the same description :) ",
      };
    },
  },
};

export { dynamicSchema, dynamicResolvers };
