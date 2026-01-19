# Railway Quotes API 🚂

A simple REST API for managing quotes, built with Node.js, Express, and PostgreSQL.

## Features
- ✅ Create, read, and delete quotes
- ✅ PostgreSQL database
- ✅ Deployed on Railway

## API Endpoints

- `GET /` - API information
- `GET /quotes` - Get all quotes
- `GET /quotes/:id` - Get a specific quote
- `POST /quotes` - Add a new quote
- `DELETE /quotes/:id` - Delete a quote

## Local Development

```bash
npm install
DATABASE_URL=your_postgres_url npm start
```

## Deployment

This API is configured for Railway deployment with automatic PostgreSQL provisioning.
