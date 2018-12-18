# GraphQL API server for MongoDB

> Why Maggy ? 

```js
"Yet another Generic GraphQL API server for MongoDB"
    .split(" ")
    .filter(w => w.charAt(0) === w.charAt(0).toUpperCase())
    .map(w => w.charAt(0))
    .reverse()
    .join("")
```

## Build

```
npm i
```


## Test

* Configure a file called `db-config-dev-json`

* Run the server
```
npm run dev
```

* First, create the schema
```
# Get schemas
curl localhost:8000/_schema

# Add a schema
curl localhost:8000/_schema -XPOST -d'{ "collectionName": "user", "collectionSchema": { "name": "String", "email": "String" } }' -H 'Content-Type:application/json'

# Delete a schema
curl localhost:8000/_schema/user -XDELETE
```

* Then, make some queries
```
# Create a user
curl localhost:8000/user -XPOST -d'{ "name": "Alice", "email": "alice@example.com" }' -H 'Content-Type:application/json'

# Get users
curl localhost:8000/user
```

## Todo

* Dockerize all
* UI (to manage the schemas, to test queries)
* Better async (for context update, loadMetaSchemas)
* Graphql support
* Update a schema
