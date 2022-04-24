import { buildSchema } from "graphql";
import logger from "./logger.js";
import { aggregateSchema } from "./execute-schema.js";


// TODO update schema
// const schemaDerivedData = server.generateSchemaDerivedData(schema);
// _.set(server, 'state.schemaManager.schemaDerivedData', schemaDerivedData);
 

const apolloDynamicPlugin = (callback) => {
  const _cache = {};
  let _changed = false;

  const schemaChanged = () => {
    const changed = _changed;
    _changed = false;
    return changed;
  };

  const getAggregatedSchema = () => {
    const schema = [];
    // TBD const resolvers = [];
    Object.keys(_cache).forEach( key => {
      schema.push(_cache[key].schema);
    });

    return {
      schema: buildSchema(schema.join("\n")),
      resolvers: undefined
    }

  }

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
      if (!resolver) {
        _cache[key].resolver = resolver;
      }
    } catch (err) {
      logger.warn(
        `failed to append schema with errors [schema input should be a string] `,
        err
      );
    }

    _changed = true;
  };

  const removeSchema = (key) => {
    delete _cache[key];

    changed = true;
  };

  return makePlugin({ callback, appendSchema, removeSchema, schemaChanged, getAggregatedSchema });
};

const makePlugin =
  ({ callback, appendSchema, removeSchema, schemaChanged, getAggregatedSchema }) =>
  () => ({
    requestDidStart: (...args) => ({
      responseForOperation: (requestContext) => {
        const { context } = requestContext;
        addDynamicSchemaApiToContext(
          context,
          appendSchema,
          removeSchema,
          schemaChanged
        );        
        callback(context);
        return aggregateSchema({
          operation: requestContext,
          getAggregatedSchema
        });
      },
    }),
  });

const addDynamicSchemaApiToContext = (
  context,
  appendSchema,
  removeSchema,
  schemaChanged
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
  }
};

export { apolloDynamicPlugin };
