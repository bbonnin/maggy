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
```

* Then, make some queries
```
# Create a user
curl localhost:8000/user -XPOST -d'{ "name": "Alice", "email": "alice@example.com" }' -H 'Content-Type:application/json'

# Get users
curl localhost:8000/user
```

## Todo

* Graphql support
* Update a schema
