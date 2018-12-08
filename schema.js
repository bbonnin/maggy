const mongoose = require('mongoose')
const Schema = mongoose.Schema

const MetaSchema = new Schema({
	collectionName: String,
	collectionSchema: Schema.Types.Mixed
})

module.exports = mongoose.model('MetaSchema', MetaSchema)