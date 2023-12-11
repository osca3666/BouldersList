# Boulder Services
Team members: Eldin Basic ○ Harald Riisager ○ Dan Gagnier ○ Moses Williams ○ Jon Jablonski ○ Oscar Carlek

Boulder services is a local business finder that allows residents of Boulder to connect with the best local businesses and services in the community. Users can see all their local businesses and what services they offer, furthermore, they can register with Boulder Services to be able to book the services that these businesses offer, and leave reviews for the businesses they have previously used.

## Technology Stack:
### Development Tools:
* Visual Studio Code (VSCode): Our preferred code editor with extensions for all the languages and frameworks that we used.
* Git: For version control, used in conjunction with GitHub.
* GitHub: Hosts our repository and is used for issue tracking and collaborative development.
### Languages and Frameworks:
* Embedded Javascript (ejs): For writing frontend logic and user interfaces.
* Javascript:  For writing frontend and backend logic.
* Node.js: The runtime environment for executing JavaScript on the server.
* CSS: To style and layout our pages.
### Database:
* PostgreSQL: Our primary database for storing application data.
### API:
* RapidAPI: Used to connect with various third-party APIs efficiently and securely.
### Containerization:
* Docker: Used to containerize our application, ensuring consistency across different development and deployment environments.

## Prerequisites:
Before you begin, ensure you have met the following requirements:

- **Node.js**: The application requires Node.js to run JavaScript code on the server. Download and install Node.js from [nodejs.org](https://nodejs.org/).
- **npm (Node Package Manager)**: npm is used to install dependencies for the project. It comes bundled with Node.js, so installing Node.js should also install npm.
- **PostgreSQL**: Our application uses PostgreSQL as its database. You can download and install it from [postgresql.org](https://www.postgresql.org/download/).
- **Git**: You will need Git for version control and to clone the repository. You can download it from [git-scm.com](https://git-scm.com/downloads).
- **Docker**: For containerization and to ensure a consistent environment across different setups. Install Docker from [docker.com](https://www.docker.com/get-started).
- **A code editor**: We recommend Visual Studio Code (VSCode), but you can use any editor of your choice. VSCode can be downloaded from [code.visualstudio.com](https://code.visualstudio.com/).

Please install all the above prerequisites before proceeding with the installation of the application.

## Running the Application Locally

To run this application locally, follow these steps:

### 1. Clone the Repository

First, clone the repository to your local machine using Git:

```bash
git clone https://github.com/osca3666/SDevProject-6.git
cd SDevProject-6
```

### 2. Start the Application

Run the following command in the root directory of your project:

```bash
docker-compose up
```

This command will build and start all the services defined in your docker-compose.yml file. It may take a few minutes the first time as Docker needs to download the base images and build the containers. If you wish to run docker with any flags, please check https://docs.docker.com/engine/reference/commandline/compose_up/ for how to do this.

### 3. Access the Application

Once the containers are running, you can access the application in your web browser. By default, it will be available at http://localhost:3000 (unless you have specified another port in your Docker configuration).

### 4. Stopping the Application

To stop the application, use:

```bash
docker-compose down
```

This command will stop and remove the containers, networks, and volumes created by `docker-compose up`. For composing down with flags, please check https://docs.docker.com/engine/reference/commandline/compose_down/ for more information.

## Running the Application from Cloud
http://recitation-13-team-06.eastus.cloudapp.azure.com:3000/discover
(Down currently due to costs)

