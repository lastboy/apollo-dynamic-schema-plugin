import { execute, parse } from "graphql";
import logger from "./logger.js";

const submitSchema = async ({operation, getSchema, schemaChanged, getApolloServer}) => {
  const { context, request } = operation;

  const { query, variables, operationName } = request;

  const apolloServer = getApolloServer();
  if (!apolloServer) {
    logger.warn(`No valid apollo server handle (use api: setApolloServer)`);
    return;
  }

  if (operationName && operationName === "IntrospectionQuery") {
    return true;
  }

  logger.log(
    `new changes arrived, re-execute schema [operationName: ${operationName}]`
  );
  const document = parse(query);

  // TODO: get the schema dynamically
  const {schema, resolver} = getSchema("dynamicSchema");
  if (schema && resolver) {
    const execOpts = {
      schema,
      document,
      variableValues: variables,
      contextValue: context,
    };

    if (resolver) {
      // TODO make sure to change the function order from the original resolver
      // map the resolvers (remove Query)
      execOpts.rootValue = { hello: (args, context, parent) => {
        const { name } = args;
        return {
          name,
          description: " always the same description :) ",
        };
      }};
    }

    try {
      const submitted = await execute(execOpts)
      return {
        submitted,
        schema, 
        resolver
      }
    } catch (err) {
      logger.warn(`failed to execute schema with errors`, err);
    }
  }
};

export { submitSchema };
