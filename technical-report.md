# Technical Report - InsightDesk

## 1. Architecture

InsightDesk uses a simple full-stack architecture consisting of React frontend, Laravel REST API backend, MySQL database, and Gemini 2.5 Flash for AI analysis.

The frontend communicates only with the Laravel backend through HTTP REST API. The frontend does not directly access the database or Gemini API. The backend is responsible for request validation, business logic, database operations, logging, and communication with external AI services.

```text
User / Operator
      |
      v
React Frontend
      |
      v
Laravel REST API
      |
      |------------------|
      v                  v
MySQL Database      Gemini 2.5 Flash
```

Main data stored in MySQL includes tickets, status history, and AI analysis results.

## 2. Key Technical Decisions

### Docker Compose

Docker Compose is used to run the frontend, backend, and MySQL database consistently from a clean state. This makes the application easier to run during evaluation without manually installing dependencies.

### Laravel REST API

Laravel is used for backend development because it provides routing, request validation, ORM through Eloquent, testing support, logging, and a clear project structure.

### MySQL

MySQL is used as the relational database because the application stores structured data such as tickets, status histories, and AI analysis results.

### React

React is used for the frontend because it supports interactive UI development and is suitable for building dashboard, forms, ticket list, and detail pages.

### OpenAPI / Swagger

Swagger is used to document the API endpoints, request schema, and response schema. The documentation can be accessed through:

```text
http://localhost:8000/api-docs
```

### TDD

A feature test was written for creating a ticket before the endpoint implementation. This is used as proof of TDD through commit history.

## 3. AI Usage Log Summary

AI tools were used to assist with planning, Docker setup, backend structure, debugging, and frontend implementation. The detailed log is stored in:

```text
AI_USAGE_LOG.md
```

The AI output was reviewed and adjusted manually before being added to the project.

## 4. Current Limitations

- Authentication is not yet implemented in the current MVP.
- Gemini AI integration is planned but not fully connected yet.
- AI output will be treated as recommendation, not final decision.
- Deployment is not finalized yet.
- Caching and structured logging will be improved in the next stage.
- Optimistic locking is implemented in a simple form using the ticket version field.
