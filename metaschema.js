const mongoose = require('mongoose')
const Schema = mongoose.Schema

const schema = new mongoose.Schema({
    collectionName: String,
    collectionSchema: mongoose.Schema.Types.Mixed
})

const model = mongoose.model('MetaSchema', schema)

module.exports = { schema, model }