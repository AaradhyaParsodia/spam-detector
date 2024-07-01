## Configuration
To get started with the project, follow these simple steps:

1. Copy the .env.example file: Duplicate the .env.example file and rename it to .env.
2. Update your credentials: Fill in your database credentials and other environment variables in the .env file.

## DB setup/seed setup

1. run the command npx prisma migrate dev --name "{anyname}"
2. npx prisma db seed

## OR
## Database Setup and Seeding
# To set up the database and seed it with initial data, run the following commands:

   1. Run database migration: Execute the command npx prisma migrate dev --name "initial_migration" (replace "initial_migration" with a name of your choice). This will create the database schema based on your Prisma model.
   2. Seed the database: Run the command npx prisma db seed. This will populate the database with initial data.
