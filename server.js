const hapi = require('hapi')
const { ApolloServer, gql } = require('apollo-server-hapi');
const graphql = require('graphql')
const mongoose = require('mongoose')
const MetaSchema = require('./metaschema')
const dbConfig = require('./db-config-' + process.env.NODE_ENV + '.json')
const createType = require('mongoose-schema-to-graphql')
const { schemaComposer } = require('graphql-compose')
const { convertSchemaToGraphQL } = require('graphql-compose-mongoose')
const _ = require('lodash')

const { GraphQLObjectType, GraphQLSchema } = graphql

const server = hapi.server({
    port: 8000,
    host: 'localhost'
})

const typeDefs = gql`
    type Query {
        hello: String
    }`

const resolvers = {
    Query: {
        hello: () => 'Maggy'
}}

const apollo = new ApolloServer({ typeDefs, resolvers })


let metaschemas = []


async function loadMetaSchemas() {
    schemas = await MetaSchema.model.find()
}

function getModel(collectionName) {
    const schema = schemas.find(s => s.collectionName === collectionName)
    let model = null
    
    if (schema) {
        model = 
            mongoose.models[collectionName] ? 
            mongoose.models[collectionName] : 
            mongoose.model(collectionName, new mongoose.Schema(schema.collectionSchema))
    }

    return model
}

function getGraphQLType(collectionName) {
    const schema = schemas.find(s => s.collectionName === collectionName)

    if (schema) {
        const config = {
            name: collectionName,
            class: 'GraphQLObjectType',
            schema: new mongoose.Schema(schema.collectionSchema),
            exclude: ['_id']
        }

        return createType(config)
    }

    return null
}

// Technical routes for creating/updating/deleting schemas
// 
server.route([{
    method: 'GET',
    path: '/_schema', // Returns the list of schemas 
    handler: function (request, h) {
        return MetaSchema.model.find()
    }
}, {
    method: 'GET',
    path: '/_type', // Returns the list of GraphQL types
    handler: function (request, h) {
        return MetaSchema.model.find()
            .then(docs => docs.map(s => getGraphQLType(s.collectionName)))
    }
}, {
    method: 'POST',
    path: '/_schema', // Insert a schema for a collection
    handler: function (request, h) {
        console.log('schema=', apollo)
        const model = new MetaSchema.model(request.payload)
        loadMetaSchemas()
        return model.save()
    }
}, {
    method: 'DELETE',
    path: '/_schema/{collection}', // Delete a schema
    handler: function (request, h) {
        const collection = request.params.collection
        const rm = MetaSchema.model.deleteOne({ collectionName: collection })
        loadMetaSchemas()
        return rm
    }
}])

// Functional routes
// - si requetage graphql d'une collection sans schema, alors erreur "you must provide a schema"
server.route([{
    method: 'GET',
    path: '/_{collection}', // Retourne le contenu de la collection
    handler: function (request, h) {
        try {
            const collection = request.params.collection
            const model = getModel(collection)
            return model.find()
        }
        catch (e) {
            console.log(e)
            return h.response({ "error": "Unknown schema for " + collection }).code(400)
        }
    }
}, {
    method: 'POST',
    path: '/_{collection}', // Insert a new doc
    handler: function (request, h) {
        const collection = request.params.collection
        const model = getModel(collection)

        if (model) {
            const doc = new model(request.payload)
            return doc.save()
        }
        else {
            return h.response({ "error": "Unknown schema for " + collection }).code(400)
        }
    }
}])    


mongoose.connect(dbConfig.uri)

mongoose.connection.once('open', () => {
    console.log('Connected to database');
    loadMetaSchemas()
})

async function startServer() {

    await apollo.applyMiddleware({ app: server })

    await apollo.installSubscriptionHandlers(server.listener)

    await server.start()

    console.log(`Server running at: ${server.info.uri}`)
}

process.on('unhandledRejection', (err) => {
    console.log(err)
    process.exit(1)
})

startServer()
