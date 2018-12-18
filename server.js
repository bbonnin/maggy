const hapi = require('hapi')
const mongoose = require('mongoose')
const MetaSchema = require('./metaschema')
const dbConfig = require('./db-config-' + process.env.NODE_ENV + '.json')
const createType = require('mongoose-schema-to-graphql')
const _ = require('lodash')



const server = hapi.server({
    port: 8000,
    host: 'localhost'
})

 
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

// Technical routes
//TODO: 
// - creer une collection _schema pour les metadata des collections
//   => lire cette collection au demarrage
//   => contenu: { collection: "name", schema: { ... } }
server.route([{
    method: 'GET',
    path: '/_schema', // Retourne la liste des schemas connus 
    handler: function (request, h) {
        return MetaSchema.model.find()
    }
}, {
    method: 'GET',
    path: '/_type', // Retourne la liste des types GraphQL
    handler: function (request, h) {
        return MetaSchema.model.find()
            .then(docs => docs.map(s => getGraphQLType(s.collectionName)))
    }
}, {
    method: 'POST',
    path: '/_schema', // Creation du schema de la collection (si pas de schema, pas possible de requeter en graphql)
    handler: function (request, h) {
        const model = new MetaSchema.model(request.payload)
        loadMetaSchemas()
        return model.save()
    }
}])

// Functional routes
// - si requetage graphql d'une collection sans schema, alors erreur "you must provide a schema"
server.route([{
    method: 'GET',
    path: '/{collection}', // Retourne le contenu de la collection
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
    path: '/{collection}', // Insertion d'un nouveau doc
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

const init = async () => {
    await server.start()
    console.log(`Server running at: ${server.info.uri}`)
}

process.on('unhandledRejection', (err) => {
    console.log(err)
    process.exit(1)
})

init()
