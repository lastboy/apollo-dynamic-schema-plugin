# apollo-dynamic-schema-plugin
Manage Apollo GraphQL dynamic schema  

## Apollo Support
This plugin was tested against apollo-server@3.6.6  

## How to
See more full usage examples in the plugin tests

### Plugin setup

At the plugin initialization phase, no in specific logic should be added  
**Except, setting the apollo server handle.**  

```javascript
const testServer = new ApolloServer({
    typeDefs: ...,
    resolvers: ...,
    plugins: [
      apolloDynamicPlugin((context) => {
        // supported API can be accessed from apollo context
        const { setApolloServer } = context;
        // set the apollo handle
        setApolloServer(testServer);
      }),
    ],
    context: ({ ctx }) => {
      return {};
    },
  });
```

### Add new schema
* Each time a new schema and resolvers are added a cache entry is being set by key.

```javascript
    const { appendSchema } = context;
    appendSchema("dynamicSchema", dynamicSchema, dynamicResolvers);
```

### Use schema
* Since many schema entries could be appended 'useSchema' API declares the current schema in use.
```javascript
    const { useSchema } = context;
    useSchema("dynamicSchema");
```
* Declaring the current schema could be set on the appendSchema API
``` javascript
    const { appendSchema } = context;
    const useSchmeaKey = true;
    appendSchema("dynamicSchema", dynamicSchema, dynamicResolvers, useSchmeaKey);
```

### Plugin API
The plugin API is available at the apollo context object.
```javascript
const { setApolloServer, appendSchema, useSchema, removeSchema } = context;
```
* appendSchema( key, schema, resolver, useSchemaKey = false, override = false )
    * key - the schema key
    * schema - the schema declaration
    * resolvers - the resolvers object
    * useSchemaKey - true / false (default) - to use the appended schema
    * override - true / false (default) - to override if existing schema already set

* useSchema( key )
    * key - the schema key

* setApolloServer( apollo )
    * apollo  - apollo server handle

* removeSchema( key ) 
    * key - the schema key
