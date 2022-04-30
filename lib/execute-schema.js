import { execute, parse } from "graphql";
import logger from "./logger.js";

const submitSchema = async ({operation, getSchema, getUseSchemaKey, getApolloServer}) => {
  const { context, request } = operation;

  const { query, variables, operationName } = request;

  const apolloServer = getApolloServer();
  if (!apolloServer) {
    logger.warn(`No valid apollo server handle (use api: setApolloServer)`);
    return;
  }

  const useSchemaKey = getUseSchemaKey();
  if (!useSchemaKey) {
    return;
  }

  if (operationName && operationName === "IntrospectionQuery") {
    return true;
  }

  logger.log(
    `new changes arrived, re-execute schema [operationName: ${operationName}]`
  );
  const document = parse(query);
  const {schema, resolver} = getSchema(useSchemaKey);
  if (schema && resolver) {
    const execOpts = {
      schema,
      document,
      variableValues: variables,
      contextValue: context,
    };

    if (resolver) {
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
