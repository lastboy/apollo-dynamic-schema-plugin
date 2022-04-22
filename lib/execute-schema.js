import { execute, parse } from "graphql";
import logger from "./logger.js";

const aggregateSchema = async ({operation, getAggregatedSchema}) => {
  const { context, request } = operation;

  if (!schemaChanged(context)) {
    return;
  }

  const { query, variables, operationName } = request;
  logger.log(
    `new changes arrived, re-execute schema [operationName: ${operationName}]`
  );
  const document = parse(query);
  const {schema, resolvers} = getAggregatedSchema();

  const execOpts = {
    schema,
    document,
    variableValues: variables,
    contextValue: context,
  };

  if (resolvers) {
    execOpts.rootValue = resolvers;
  }

  try {
    return await execute(execOpts);
  } catch (err) {
    logger.warn(`failed to execute schema with errors`, err);
  }
  return null;
};

const schemaChanged = (context) => {
  const { schemaChanged } = context;
  if (schemaChanged) {
    return schemaChanged();
  }
  return false;
};

export { aggregateSchema };
