# Services Discovery API

## Installation and Running with Docker (Recommended)

This project utilizes Docker for simplified setup and management.

To start the application, ensure Docker Desktop is installed, then navigate to the project's root folder in your terminal and execute:

```bash
docker-compose up
```

Docker will create a container with two services:

- **nodejs**: Contains the necessary files to run the server.
- **mongodb**: Hosts the MongoDB server with the project database.

Once Docker completes the setup, the API will be accessible at [http://localhost:8080](http://localhost:8080).

> If you can't use Docker there is a [Manual Setup Guide](#manual-setup-guide) at the end of this file.

## Integration and Unit Testing

To run the integration tests:

1. Ensure that your Docker containers for MongoDB and Node.js are up and running:
   ```bash
   docker-compose up
   ```

2. In another terminal, run the integration tests using npm:
    ```bash
    npm test
    ```

> Development Note: For this challenge, both integration and unit tests are executed with a single command for simplicity. However, in a real production scenario, they should be segregated. Integration tests, needing a testing environment, serve a distinct purpose in the CI/CD pipeline compared to unit tests.

## Endpoints

### Register Instance

Registers a new instance for a given group.

- **URL:** `/group/id`
- **Method:** `POST`
- **Request Body:**
  - `meta` (object): Metadata associated with the instance.
- **Responses:**
  - `200 OK`: Instance successfully registered.
    - Schema:
      ```json
      {
        "id": "string",
        "group": "string",
        "createdAt": "number",
        "updatedAt": "number",
        "meta": {}
      }
      ```

### Unregister Instance

Unregisters an instance for a given group.

- **URL:** `/group/id`
- **Method:** `DELETE`
- **Responses:**
  - `204 No Content`: Instance successfully unregistered.

### Get All Groups Summary

Retrieves a summary of all groups.

- **URL:** `/`
- **Method:** `GET`
- **Responses:**
  - `200 OK`: Summary of all groups.
    - Schema:
      ```json
      [
        {
          "group": "string",
          "instances": "number",
          "createdAt": "number",
          "lastUpdatedAt": "number"
        }
      ]
      ```

### Get Group Instances

Retrieves all instances of a specific group.

- **URL:** `/group`
- **Method:** `GET`
- **Responses:**
  - `200 OK`: List of instances for the specified group.
    - Schema:
      ```json
      [
        {
          "id": "string",
          "group": "string",
          "createdAt": "number",
          "updatedAt": "number",
          "meta": {}
        }
      ]
      ```

<a name="manual-setup-guide"></a>
## Manual Setup Guide

If you can't use Docker, here are the manual installation steps:

1. **Install Node.js 20**: Ensure Node.js 20 is installed on your system. You can download it from the [official website](https://nodejs.org/en/download/).

2. **Install MongoDB**: Install MongoDB on your system. You can download it from the [official website](https://www.mongodb.com/try/download/community).

3. **Start MongoDB**: Start the MongoDB service on your system. Depending on your operating system, you may need to run a command like `mongod` or start the MongoDB service through a graphical interface.

4. **Clone the Repository**: Clone the repository containing your Node.js application code.

5. **Navigate to the Project Directory**: Open a terminal or command prompt, and change directory to the root directory of your Node.js application.

6. **Install Dependencies**: Run the following command to install npm dependencies:
    ```bash
    npm install
    ```

7. **Run MongoDB Script**: Execute the MongoDB initialization script to create necessary collections. Use the MongoDB shell to run the script:
    ```bash
    mongo < init-db.js
    ```

8. **Add Environment Variables**: In the file named `.env` in the root directory of your project, and add the following line with your MongoDB connection URL:
    ```
    MONGO_URL=mongodb://127.0.0.1:27017/tech-challenge-ubio
    ```

9. **Compile TypeScript**: If your application uses TypeScript, compile the TypeScript code to JavaScript:
    ```bash
    npm run compile
    ```

10. **Start the Application**: Start the Node.js application:
    ```bash
    npm start
    ```

11. **Access the Application**: Once the application is running, it will be accessible at [http://localhost:8080](http://localhost:8080).

**Note**: Ensure you have MongoDB configured and running. You may need to adjust the MongoDB connection settings in your application if they differ from the default configuration.
