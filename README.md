# Kirezi_Anita_National_Practical_Exam_2025
# Smart Inventory Management System (SIMS)

## Overview

SIMS is a comprehensive inventory management solution designed to help businesses track spare parts, manage stock movements, and generate reports. This system features user authentication, stock management, and reporting capabilities with a modern, responsive interface.

![SIMS Screenshot](screenshot.png) *Example screenshot of the dashboard*

## Features

- **User Authentication**
  - Secure login and registration
  - JWT token-based authentication
  - Protected routes

- **Inventory Management**
  - Add/edit/delete spare parts
  - Track spare part categories
  - View current stock levels

- **Stock Movements**
  - Record stock in (purchases, returns)
  - Record stock out (sales, disposals)
  - Transaction history

- **Reporting**
  - Daily stock movement reports
  - Sales reports
  - CSV export functionality

- **Responsive Design**
  - Works on desktop and mobile devices
  - Clean, modern interface
  - Pink-themed UI with DaisyUI and TailwindCSS

## Technologies Used

### Frontend
- React.js
- React Router
- DaisyUI (TailwindCSS component library)
- TailwindCSS (utility-first CSS framework)
- Axios (HTTP client)

### Backend
- Node.js
- Express.js
- MySQL (database)
- JWT (authentication)
- Bcrypt (password hashing)

## Installation

### Prerequisites
- Node.js (v16 or higher)
- MySQL (v8 or higher)
- npm or yarn

### Backend Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/sims.git
   cd sims/backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory with the following variables:
   ```
   DB_HOST=localhost
   DB_USER=your_mysql_username
   DB_PASSWORD=your_mysql_password
   DB_NAME=sims
   JWT_SECRET=your_jwt_secret_key
   PORT=5000
   ```

4. Import the database schema:
   ```bash
   mysql -u your_mysql_username -p sims < database_schema.sql
   ```

5. Start the backend server:
   ```bash
   npm start
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## Project Structure

```
sims/
├── backend/
│   ├── node_modules/
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Authentication middleware
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── utils/          # Utility functions
│   │   └── server.js       # Main server file
│   ├── .env.example        # Environment variables example
│   ├── package.json
│   └── database_schema.sql # Database schema
│
└── frontend/
    ├── public/             # Static assets
    ├── src/
    │   ├── assets/         # Images, fonts, etc.
    │   ├── components/     # Reusable components
    │   │   ├── forms/      # Form components
    │   │   ├── tables/     # Table components
    │   │   └── Navbar.jsx  # Navigation component
    │   ├── pages/          # Page components
    │   ├── App.jsx         # Main application component
    │   └── main.jsx        # Application entry point
    ├── .eslintrc.json      # ESLint configuration
    ├── package.json
    └── tailwind.config.js  # TailwindCSS configuration
```

## API Documentation

The backend provides the following API endpoints:

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login with existing credentials

### Spare Parts
- `GET /api/spare-parts` - Get all spare parts
- `POST /api/spare-parts` - Create a new spare part
- `PUT /api/spare-parts/:id` - Update a spare part
- `DELETE /api/spare-parts/:id` - Delete a spare part

### Stock Movements
- `GET /api/stock-in` - Get all stock in records
- `POST /api/stock-in` - Create a new stock in record
- `GET /api/stock-out` - Get all stock out records
- `POST /api/stock-out` - Create a new stock out record
- `PUT /api/stock-out/:id` - Update a stock out record
- `DELETE /api/stock-out/:id` - Delete a stock out record

### Reports
- `GET /api/reports/daily` - Get daily report
- `GET /api/reports/stock-status` - Get current stock status

## Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Contact

Project Link: [https://github.com/yourusername/sims](https://github.com/yourusername/sims)

## Screenshots

*Include screenshots of the main application pages here*

## Future Enhancements

- [ ] Inventory alerts for low stock
- [ ] Barcode scanning support
- [ ] Multi-user roles and permissions
- [ ] Dashboard with analytics
- [ ] Mobile application version

---

**Note**: Make sure to replace placeholder values (like `yourusername`, `your_mysql_username`, etc.) with your actual information before using this README. You may also want to add actual screenshots to make the documentation more visually appealing.