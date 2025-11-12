# TaskManager:

frontend: React + Vite

realtime: Node.js server with Socket.IO (3001 port)

backend: Spring Boot (8080 port)

db: Postgres + Liquibase

taskmanager/
├── backend/
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/app/backend/
│       │   ├── model/
│       │   │   ├── User.java
│       │   │   ├── Project.java
│       │   │   └── Task.java
│       │   ├── controller/
│       │   │   ├── AuthController.java
│       │   │   ├── ProjectController.java
│       │   │   └── TaskController.java
│       │   ├── repository/
│       │   │   ├── UserRepository.java
│       │   │   ├── ProjectRepository.java
│       │   │   └── TaskRepository.java
│       │   └── BackendApplication.java
│       └── resources/
│           ├── application.properties
│           └── db/changelog/
│               ├── db.changelog-master.yaml
│               ├── 001-init-schema.yaml
│               ├── 002-add-users-projects.yaml
│               ├── 003-init-tasks-with-project-user-relations.yaml
│               └── 004-seed-sample-data.yaml
│
├── frontend/
│   ├── Dockerfile
│   └── src/
│       ├── App.jsx
│       ├── KanbanBoard.jsx
│       ├── Login.jsx
│       ├── ProjectsList.jsx
│       └── styles.css
│
├── realtime/
│   ├── Dockerfile
│   └── server.js
│
└── docker-compose.yml
