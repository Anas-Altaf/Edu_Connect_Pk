# EDUConnect Pakistan - Backend

Node.js/Express backend application for the EDUConnect Pakistan platform.

## Directory Structure

- `config/` - Configuration files
- `controllers/` - Request handlers
- `models/` - Database models
- `routes/` - API routes
- `middleware/` - Middleware functions
- `utils/` - Utility functions
- `seed/` - Database seeding scripts

## Available Scripts

- `npm start` - Start the server
- `npm run dev` - Start the server in development mode with nodemon
- `npm test` - Run tests
- `npm run seed` - Seed the database with sample data

## Seed Data

The application includes a comprehensive seeding system that populates the database with sample data for development and testing:

- Users: Admin, students, and tutors with credentials
- Tutor profiles: Including qualifications, subjects, and availability
- Sessions: Various tutoring sessions in different statuses
- Reviews: Student feedback for tutors
- Wishlists: Student saved tutors
- Notifications: System alerts for various events

To seed the database:

```
npm run seed
```

All seed users share the password: `Password123`

## Technologies

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
