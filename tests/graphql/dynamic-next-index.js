const dynamicNextSchema = `
    type Query {
        hello(name: String): Test
    }
  
    type Test {
        name: String
        description: String
        next: string
    }
  `;

const dynamicNextResolvers = {
  Query: {
    hello: (parent, args, context, info) => {
      const { name } = args;
      return {
        name,
        description: " always the same description :) ",
        next
      };
    },
  },
};

export { dynamicNextSchema, dynamicNextResolvers };
