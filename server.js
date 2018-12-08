const hapi = require('hapi')
const mongoose = require('mongoose')
const MetaSchema = require('./schema')
const dbConfig = require('./db-config-' + process.env.NODE_ENV + '.json')

const server = hapi.server({
    port: 8000,
    host: 'localhost'
})

let schemas = []

async function loadSchemas() {
    schemas = await MetaSchema.find()
}

function getModel(collectionName) {
    let collectionSchema = null

    schemas.forEach(s => {
        if (s.collectionName === collectionName) {
            collectionSchema = s.collectionSchema
        }
    })

    //TODO: error

    return mongoose.model(collectionName, new mongoose.Schema(collectionSchema))
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
        return MetaSchema.find()
    }
}, {
    method: 'POST',
    path: '/_schema', // Creation du schema de la collection (si pas de schema, pas possible de requeter en graphql)
    handler: function (request, h) {
        const schema = new MetaSchema(request.payload)
        loadSchemas()
        return schema.save()
    }
}])

// Functional routes
// - si requetage graphql sans schema, alors erreur "you must provide a schema"
server.route([{
    method: 'GET',
    path: '/{collection}', 
    handler: function (request, h) {
        const collection = request.params.collection
        const model = getModel(collection)
        return model.find()
    }
}, {
    method: 'POST',
    path: '/{collection}', // Insertion d'un nouveau doc
    handler: function (request, h) {
        const collection = request.params.collection
        console.log(collection)
        const model = getModel(collection)
        const doc = new model(request.payload)
        console.log(doc)
        return doc.save()
    }
}])    


mongoose.connect(dbConfig.uri)

mongoose.connection.once('open', () => {
    console.log('Connected to database');
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
