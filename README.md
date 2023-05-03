# Vehicle Dealership API

This is a CRUD API that manages vehicles and dealerships. It is built with serverless framework, Node.js, and MongoDB, written in TypeScript.

## Setup

To run this project locally, you will need to have the following installed on your system:

- Node.js v14 or higher
- Docker
- Serverless Framework installed globally (`npm install -g serverless`)

1. Clone this repository

2. Install dependencies

`npm install` or `npm install --legacy-peer-deps` if you are using NPM v7 or higher

3. Start a local MongoDB instance

Using Docker (recommended)

- Run mongo docker image:

```
docker run -d --name <YOUR_CONTAINER_NAME_HERE> -p <YOUR_LOCALHOST_PORT_HERE>:27017 -e MONGO_INITDB_ROOT_USERNAME=<YOUR_USERNAME_HERE> -e MONGO_INITDB_ROOT_PASSWORD=<YOUR_PASSWORD_HERE> mongo
```

- Check that the container’s up and running:

`docker container ls`

- Start + connect to a bash shell within the container:

`docker exec -it <YOUR_CONTAINER_NAME_HERE> bash`

- Access the MongoDB instance via the mongo command line interface:

`mongosh --username <YOUR_USERNAME_HERE> --password <YOUR_PASSWORD_HERE>`

- Create database:

`use <YOUR_DATABASE_NAME_HERE>`

4. Set environment variables

Go to `config/.env.[NODE_ENV]` and set the environment variables for each node environment

```
DB_URL=mongodb://<YOUR_USERNAME_HERE>:<YOUR_PASSWORD_HERE>@0.0.0.0:<YOUR_LOCALHOST_PORT_HERE>
DB_NAME=<YOUR_DATABASE_NAME_HERE>
DB_DEALERS_COLLECTION=dealers
DB_VEHICLES_COLLECTION=vehicles
```

5. Run app locally

`npm run local`

The API will now be available at `http://localhost:3000/dev`

## Endpoints

### Vehicles

- `GET /vehicles`: Get a list of all vehicles
- `POST /vehicles`: Add a new vehicle
- `PUT /vehicles/{id}`: Update a vehicle by ID
- `DELETE /vehicles/{id}`: Remove a vehicle by ID
- `GET /vehiclesByDealerId/{id}`: Get a list of all vehicles for a particular dealer

### Dealers

- `GET /dealers`: Get a list of all dealers
- `POST /dealers`: Add a new dealer
- `PUT /dealers/{id}`: Update a dealer by ID
- `DELETE /dealers/{id}`: Remove a dealer by ID

## Tests

To run the tests, run the following command:

`npm run test`
