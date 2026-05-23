# Backend


## Technology Stack
- Node.js + Express.js + PostgreSQL
- `pq` library to communicate with PostgreSQL
- Integreated with React + Vite Frontend
- CORS to whitelist frontend URLs
- Backend deployed on Render


## API Endpoints
### Health Checks
`GET /health`: Backend health check.

`GET /health/db`: Database connection check.

### User Operations
`GET /users`: Get paginated users with sorting.

`Query Parameters`:
```
limit (number, default: 10, max: 50)

sortBy (string: "id" or "age", default: "id")

order (string: "asc" or "desc", default: "asc")

`cursor` (string: Base64-encoded cursor for pagination)
```


`GET /users/by-email/:email`: Get user by exact email match used for filtering.

`PATCH /users/:id/status`: Toggle user active status.