# Task Tracker Lite

## Agent Workflow

Always use the following workflow:

1. software-architecture-agent
2. ui-design-agent
3. be-coding-agent
4. fe-coding-agent
5. testing-agent
6. code-review-be-agent
7. code-review-fe-agent
8. readme-agent

Do not skip review steps.

---

## Architecture Rules

Backend choices are limited to:

- TypeScript
- Python

Frontend must use:

- React

The software-architecture-agent is responsible for deciding:

- backend stack
- frontend framework
- rendering strategy
- API architecture
- storage architecture
- authentication approach
- deployment approach
- testing approach

All implementation agents must follow the architecture decision unless explicitly instructed otherwise.

---

## Frontend Rules

Frontend implementation must:

- use React
- use TypeScript
- follow accessibility best practices
- support responsive layouts
- use reusable components
- handle loading states
- handle empty states
- handle error states
- avoid unnecessary re-renders

When relevant:

- add Cypress E2E tests
- add unit tests
- add integration tests

---

## Backend Rules

Backend implementation must:

- follow secure API practices
- validate all inputs
- sanitize user input
- implement proper error handling
- follow service-oriented design
- include automated tests where appropriate

---

## Testing Rules

Testing-agent owns:

- unit testing
- integration testing
- Cypress E2E testing
- coverage analysis
- regression testing

Critical user flows must have E2E coverage.

---

## Docker Rules

Frontend and backend must be Dockerized.

When applicable:

- create Dockerfile
- create .dockerignore
- create docker-compose.yml
- verify Docker builds
- document Docker commands

Prefer production-ready Docker configurations.

---

## Documentation Rules

readme-agent must:

- generate README.md
- document setup instructions
- document scripts
- document Docker usage
- document environment variables
- document testing commands
- document architecture decisions

Do not invent undocumented features.

---

## Final Response Format

Include:

- architecture decision
- frontend decision
- backend decision
- rendering strategy
- files changed
- tests added
- Cypress coverage
- Docker files
- commands executed
- review findings
- documentation updates
- remaining risks/TODOs
