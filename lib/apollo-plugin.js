import { buildSchema } from "graphql";
import logger from "./logger.js";
import { submitSchema } from "./execute-schema.js";
import _ from "lodash";

// TODO update schema
// const schemaDerivedData = server.generateSchemaDerivedData(schema);
// _.set(server, 'state.schemaManager.schemaDerivedData', schemaDerivedData);

const apolloDynamicPlugin = (callback) => {
  const _cache = {};
  let _apollo;
  let _changed = false;

  const schemaChanged = () => {
    const changed = _changed;
    _changed = false;
    return changed;
  };

  const appendSchema = (key, schema, resolver) => {
    if (!schema || !key) {
      logger.error(
        `failed to append schema, no valid 'schema' and/or 'key' inputs`
      );
      return;
    }

    try {
      _cache[key] = {
        schema,
      };
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

    _changed = true;
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
    schemaChanged,
    getSchema,
    getApolloServer,
    setApolloServer,
  });
};

const makePlugin =
  ({
    callback,
    appendSchema,
    removeSchema,
    schemaChanged,
    getSchema,
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
          schemaChanged,
          getSchema,
          setApolloServer,
          getApolloServer
        );
        callback(context);
        const submittedSchema = await submitSchema({
          operation: requestContext,
          schemaChanged,
          getSchema,
          getApolloServer,
        });

        if (!submittedSchema) return;

        const { submitted, schema } = submittedSchema;
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

          return submitted;
      },
    }),
  });

const addDynamicSchemaApiToContext = (
  context,
  appendSchema,
  removeSchema,
  schemaChanged,
  getSchema,
  setApolloServer,
  getApolloServer
) => {
  if (context) {
    if (!context["appendSchema"]) {
      context["appendSchema"] = appendSchema;
    }
    if (!context["removeSchema"]) {
      context["removeSchema"] = removeSchema;
    }
    if (!context["schemaChanged"]) {
      context["schemaChanged"] = schemaChanged;
    }
    if (!context["getSchema"]) {
      context["getSchema"] = getSchema;
    }
    if (!context["getApolloServer"]) {
      context["getApolloServer"] = getApolloServer;
    }
    if (!context["setApolloServer"]) {
      context["setApolloServer"] = setApolloServer;
    }
  }
};

export { apolloDynamicPlugin };
