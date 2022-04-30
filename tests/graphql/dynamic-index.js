import { dynamicNextSchema, dynamicNextResolvers} from './dynamic-next-index.js';

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

const dynamicSchemaAppender = (context) => {

  const schema = dynamicNextSchema;
  const resolver = dynamicNextResolvers;
  const submitSchemaKey = true; 
  const { appendSchema } = context;

  appendSchema('dynamicAppender', schema, resolver, submitSchemaKey);

}

const dynamicAppendResolvers = {
  Query: {
    hello: (parent, args, context, info) => {
      const { name } = args;
      dynamicSchemaAppender(context)

      return {
        name,
        description: " always the same description :) ",
      };
    },
  },
};


export { dynamicSchema, dynamicResolvers, dynamicAppendResolvers };
