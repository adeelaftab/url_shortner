# URL Shortener

A modern URL shortening service built with Express.js, React, and PostgreSQL.

## Features

- Shorten long URLs to compact, shareable links
- Modern, responsive UI built with React and Mantine
- URL visit tracking and statistics
- Copy-to-clipboard functionality
- Input validation and error handling

## Tech Stack

### Backend

- Node.js with Express
- PostgreSQL database
- Prisma ORM
- TypeScript

### Frontend

- React with TypeScript
- Mantine UI components
- Axios for API requests
- Vite for development

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL
- pnpm (recommended) or npm

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/url-shortener.git
   cd url-shortener
   ```

2. Install backend dependencies:

   ```bash
   cd url-shortner-backend
   pnpm install
   ```

3. Database setup

   - PostgreSQL database is already there
   - Copy `.env.example` to `.env` and you need to update the database URL i have sent you on linkedin
   - no need to run migrations already done on the hosted platform
   - I have already shared crediential with you on linkedin all you have to do is to connect to DB via pgAdmin

4. Install frontend dependencies:

   ```bash
   cd ../url-shortner-frontend
   pnpm install
   ```

5. Install backend dependencies:

   ```bash
   cd ../url-shortner-backend
   pnpm install
   ```

### Running the Application

1. Start the backend server:

   ```bash
   cd url-shortner-backend
   pnpm dev
   ```

2. Start the frontend development server:

   ```bash
   cd url-shortner-frontend
   pnpm dev
   ```

3. Open http://localhost:5173 in your browser

## API Endpoints

### POST `/api/shorten`

Create a shortened URL

- Request body: `{ "url": "https://example.com/long-url" }`
- Response: `{ "shortUrl": "https://smi.to/abc123", ... }`

### GET `/:shortCode`

Redirect to the original URL

### GET `/api/stats/:shortCode`

Get statistics for a shortened URL

- Response includes visit count and visit details

## FrontEnd Logic

In order to track the number of visits to a shortened URL, we need to make an API call to the backend server.

I had to create a localhost based url in order to track and on frontend it is displaying both but:

1. When a user visits a local shortened URL, the frontend makes a GET request to the backend server with the shortCode as a parameter.
2. The backend server then queries the database for the URL associated with the shortCode.
3. If the URL is found, the backend server increments the visit count for the URL and returns the original URL to the frontend.
4. The frontend then redirects the user to the original URL.
