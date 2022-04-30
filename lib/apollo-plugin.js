import { buildSchema } from "graphql";
import logger from "./logger.js";
import { submitSchema } from "./execute-schema.js";
import _ from "lodash";

const apolloDynamicPlugin = (callback) => {
  const _cache = {};
  let _apollo;
  let __useSchemaKey;

  const useSchema = (key) => {
    logger.log(`using now, schmea key '${key}'`);
    __useSchemaKey = key;
  };

  const getUseSchemaKey = () => {
    return __useSchemaKey;
  }

  const appendSchema = (
    key,
    schema,
    resolver,
    useSchemaKey = false,
    override = false
  ) => {
    if (!schema || !key) {
      logger.error(
        `failed to append schema, no valid 'schema' and/or 'key' inputs`
      );
      return;
    }

    try {
      if (!_cache[key]) {
        _cache[key] = {};
      } else {
        if (!override) {
          return;
        }
      }
      if (useSchemaKey) {
        useSchema(key);
      }
      if (schema) {
        _cache[key].schema = schema;
      }
      if (resolver) {
        _cache[key].resolver = resolver;
      }
    } catch (err) {
      logger.warn(
        `failed to append schema with errors [schema input should be a string] `,
        err
      );
    }
  };

  const removeSchema = (key) => {
    delete _cache[key];
  };

  const getSchema = (key) => {
    if (!_cache[key]) {
      return { schema: undefined, resolver: undefined };
    }

    let results;
    try {
      results = {
        _schema: _cache[key].schema,
        schema: buildSchema(_cache[key].schema),
        resolver: _cache[key].resolver,
      };
    } catch (err) {
      console.warn(`failed to get schema [key: ${key}]`);
    }
    return results;
  };

  const setApolloServer = (apollo) => {
    _apollo = apollo;
  };

  const getApolloServer = () => {
    return _apollo;
  };

  return makePlugin({
    callback,
    appendSchema,
    removeSchema,
    getSchema,
    useSchema,
    getUseSchemaKey,
    getApolloServer,
    setApolloServer,
  });
};

const makePlugin =
  ({
    callback,
    appendSchema,
    removeSchema,
    getSchema,
    useSchema,
    getUseSchemaKey,
    getApolloServer,
    setApolloServer,
  }) =>
  () => ({
    serverWillStart: (...args) => {
      console.log(args);
      return {
        schemaDidLoadOrUpdate: ({ apiSchema, coreSupergraphSdl }) => {
          console.log("Schema was loaded ... ");
        },
      };
    },
    requestDidStart: async (...args) => ({
      responseForOperation: async (requestContext) => {
        const { context } = requestContext;
        addDynamicSchemaApiToContext(
          context,
          appendSchema,
          removeSchema,
          getSchema,
          useSchema,
          setApolloServer,
          getApolloServer
        );
        callback(context);
        const submittedSchema = await submitSchema({
          operation: requestContext,
          getSchema,
          getUseSchemaKey,
          getApolloServer,
        });

        if (!submittedSchema) return;

        const { submitted, schema } = submittedSchema;
        if (schema) {
          await (async () =>
            new Promise((resolve) => {
              setTimeout(() => {
                const apolloServer = getApolloServer();
                if (apolloServer) {
                  const schemaDerivedData =
                    apolloServer.generateSchemaDerivedData(schema);
                  _.set(
                    apolloServer,
                    "state.schemaManager.schemaDerivedData",
                    schemaDerivedData
                  );
                  resolve();
                } else {
                  logger.warn(
                    `No valid apollo server handle, failed to submit query`
                  );
                }
              });
            }, 500))();
        }

        return submitted;
      },
    }),
  });

const addDynamicSchemaApiToContext = (
  context,
  appendSchema,
  removeSchema,
  getSchema,
  useSchema,
  setApolloServer,
  getApolloServer
) => {
  if (context) {
    context["appendSchema"] = appendSchema;
    context["removeSchema"] = removeSchema;
    context["getSchema"] = getSchema;
    context["useSchema"] = useSchema;
    context["getApolloServer"] = getApolloServer;
    context["setApolloServer"] = setApolloServer;
  }
};

export { apolloDynamicPlugin };
