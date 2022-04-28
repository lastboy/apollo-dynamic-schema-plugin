// import dynamicSchema from "../../graphql/dynamic-index.js"

const testResolvers = {
  Query: {
    hello: (parent, args, context, info) => {

      const { name } = args;
      // const { appendSchema } = context;

      // if (appendSchema) {
      //   appendSchema('dynamicSchema', dynamicSchema);
      // }

      return { dummy: `Hello ${name}!` };
    } 
  },
};

export default testResolvers;
