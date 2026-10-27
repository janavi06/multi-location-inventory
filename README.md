Multi-Location Inventory Management System

A full-stack inventory management system designed to help businesses manage products, monitor stock across
 multiple locations, and handle inventory transfers 
through a centralized dashboard.

Key Features

- Multi-Location Inventory: Track product quantities and stock levels across different locations.
- Product Management: Manage products, SKUs, and stock thresholds.
- Stock Transfers: Organize inventory movement between locations.
- Order Management: Manage orders alongside inventory operations.
- Inventory Dashboard: View products, locations, and stock information in one place.
- REST API: Modular backend organized into routes, controllers, services, and middleware.

Tech Stack

- Frontend: Next.js, React, JavaScript
- Backend: Node.js, Express.js
- Database: PostgreSQL
- API: REST

Architecture

The Next.js frontend communicates with the Express.js REST API.
 The backend separates request handling, routing, and business logic,
 while PostgreSQL stores application and inventory data.

Project Structure

multi-location-inventory/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   └── db/
│       └── migrations/
├── frontend/
│   └── src/
│       └── app/
├── package.json
└── README.md


Getting Started

Prerequisites: Node.js, npm, and PostgreSQL.

1. Clone the repository:

   git clone https://github.com/janavi06/multi-location-inventory.git
   cd multi-location-inventory
  

2. Install dependencies in the backend and frontend directories.

3. Configure the required environment variables and database connection.

4. Run the database migrations using the project's configured migration command.

5. Start the backend and frontend using their respective npm scripts.

Refer to the package.json files and environment configuration examples for the exact commands and settings.

Future Improvements

- Transaction-safe inventory transfers
- Low-stock alerts and inventory reports
- Automated API and integration tests

Author

Janavi Korgaonkar
