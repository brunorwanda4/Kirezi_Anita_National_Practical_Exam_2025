require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise'); // Using the promise-based version
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();

// Configuration
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'ttgf8gewvyf'; // Keep your secret secure!
const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '', // Ensure this is set in your .env for production
  database: process.env.DB_NAME || 'sims',
  // Pool-specific options are removed as we are using createConnection
  // waitForConnections: true,
  // connectionLimit: 10,
  // queueLimit: 0
};

// Middleware
app.use(cors());
app.use(express.json());

// Database connection (Single Connection)
let dbConnection; // This will hold our single, persistent connection

/**
 * Initializes the database connection.
 * Attempts to connect and sets up an error listener for automatic reconnection.
 */
async function initializeDatabase() {
  try {
    // Destructure to ensure only connection-specific options are passed
    const { waitForConnections, connectionLimit, queueLimit, ...connectionConfig } = DB_CONFIG;
    dbConnection = await mysql.createConnection(connectionConfig);
    console.log('Successfully connected to the database using createConnection.');

    // Listen for errors on the single connection
    dbConnection.on('error', async (err) => {
      console.error('Database connection error:', err);
      // Attempt to reconnect on specific errors
      if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ECONNRESET' || err.code === 'ETIMEDOUT') {
        console.log('Attempting to reconnect to the database...');
        try {
          await initializeDatabase(); // Re-initialize the connection
          console.log('Successfully reconnected to the database.');
        } catch (reconnectError) {
          console.error('Failed to reconnect to the database:', reconnectError);
          // Consider a more robust reconnection strategy or exit if critical
          process.exit(1); // Exit if reconnection fails critically
        }
      } else {
        // For other errors, you might want to handle them differently or let the app crash
        // to be restarted by a process manager, especially if it's an unrecoverable state.
        console.error('Unhandled database error. The application might be in an unstable state.');
        // process.exit(1); // Optionally exit for unhandled DB errors
      }
    });

  } catch (error) {
    console.error('Failed to connect to the database during initial setup:', error);
    // If the initial connection fails, the application cannot run.
    process.exit(1);
  }
}

// Utility functions
/**
 * Executes a SQL query using the global dbConnection.
 * @param {string} sql - The SQL query string.
 * @param {Array} params - Parameters for the SQL query.
 * @returns {Promise<Array>} - The results of the query.
 */
const executeQuery = async (sql, params = []) => {
  if (!dbConnection || dbConnection.connection._closing) { // Check if connection exists and is not closing
    console.error("Database connection is not initialized or is closing. Attempting to re-initialize.");
    await initializeDatabase(); // Attempt to re-establish connection
    if (!dbConnection || dbConnection.connection._closing) { // Check again after attempting re-initialization
        throw new Error("Database connection is not available.");
    }
  }
  try {
    const [results] = await dbConnection.query(sql, params);
    return results;
  } catch (error) {
    console.error('Error executing query:', error.message);
    // Check if the error is due to a lost connection and try to reconnect
    if (error.code === 'PROTOCOL_CONNECTION_LOST' || error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT' || error.fatal) {
        console.log('Query failed due to lost connection. Attempting to reconnect and retry...');
        await initializeDatabase(); // Re-initialize
        // Retry the query once after reconnection
        if (!dbConnection || dbConnection.connection._closing) {
             throw new Error("Database re-connection failed. Cannot execute query.");
        }
        const [retryResults] = await dbConnection.query(sql, params);
        return retryResults;
    }
    throw error; // Re-throw other errors
  }
};

/**
 * Executes a series of operations within a database transaction.
 * @param {Function} operations - An async function that takes the connection and performs DB operations.
 * @returns {Promise<any>} - The result of the operations.
 */
const executeTransaction = async (operations) => {
  if (!dbConnection || dbConnection.connection._closing) {
    console.error("Database connection is not initialized or is closing for transaction. Attempting to re-initialize.");
    await initializeDatabase();
     if (!dbConnection || dbConnection.connection._closing) {
        throw new Error("Database connection is not available for transaction.");
    }
  }
  try {
    await dbConnection.beginTransaction();
    // The 'operations' callback now directly uses the global dbConnection
    // or can be passed dbConnection if preferred for explicitness,
    // but since dbConnection is in the higher scope, it's accessible.
    const result = await operations(dbConnection); // Pass connection for clarity if operations are defined elsewhere
    await dbConnection.commit();
    return result;
  } catch (error) {
    await dbConnection.rollback();
    console.error('Transaction failed, rolled back:', error.message);
     if (error.code === 'PROTOCOL_CONNECTION_LOST' || error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT' || error.fatal) {
        console.log('Transaction failed due to lost connection. Attempting to reconnect...');
        await initializeDatabase(); // Re-initialize
    }
    throw error; // Re-throw error to be handled by the route
  }
};

// Authentication middleware
const authenticate = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // Use executeQuery which handles the single connection
    const users = await executeQuery('SELECT id, username FROM users WHERE id = ?', [decoded.userId]);
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid token. User not found.' });
    }

    req.user = users[0]; // Attach user info to request
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
        return res.status(403).json({ error: 'Invalid token.' });
    }
    if (error.name === 'TokenExpiredError') {
        return res.status(403).json({ error: 'Token expired.' });
    }
    console.error("Authentication error:", error);
    return res.status(500).json({ error: 'Failed to authenticate token.' });
  }
};

// --- Routes ---

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    if (password.length < 6) { // Example: Basic password policy
        return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const existingUsers = await executeQuery('SELECT id FROM users WHERE username = ?', [username]);
    if (existingUsers.length > 0) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10); // Salt rounds: 10
    const result = await executeQuery(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [username, hashedPassword]
    );

    res.status(201).json({ 
      message: 'User registered successfully',
      user: { id: result.insertId, username }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error during registration' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const users = await executeQuery('SELECT id, username, password FROM users WHERE username = ?', [username]);
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' }); // User not found
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' }); // Password incorrect
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '1h' } // Token expiration time
    );

    res.json({ 
      message: 'Login successful',
      token,
      user: { id: user.id, username: user.username }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during login' });
  }
});

// Spare Parts Routes
app.get('/api/spare-parts', authenticate, async (req, res) => {
  try {
    const spareParts = await executeQuery(`
      SELECT sp.id, sp.name, sp.quantity, sp.unit_price, sp.category_id, c.name AS category_name 
      FROM spare_parts sp
      LEFT JOIN categories c ON sp.category_id = c.id
    `); // Using LEFT JOIN to include parts even if category is null (though ideally category_id is NOT NULL)
    res.json(spareParts);
  } catch (error) {
    console.error('Error fetching spare parts:', error);
    res.status(500).json({ error: 'Failed to fetch spare parts' });
  }
});

app.post('/api/spare-parts', authenticate, async (req, res) => {
  try {
    const { name, category_id, quantity, unit_price } = req.body;

    if (!name || !category_id || quantity === undefined || unit_price === undefined) {
      return res.status(400).json({ error: 'Missing required fields: name, category_id, quantity, unit_price' });
    }
    if (typeof quantity !== 'number' || quantity < 0 || typeof unit_price !== 'number' || unit_price < 0) {
        return res.status(400).json({ error: 'Quantity and unit price must be non-negative numbers.' });
    }


    const existingParts = await executeQuery(
      'SELECT id FROM spare_parts WHERE name = ? AND category_id = ?',
      [name, category_id]
    );

    if (existingParts.length > 0) {
      return res.status(409).json({ error: 'Spare part with this name already exists in this category' });
    }
    
    // Verify category_id exists
    const categories = await executeQuery('SELECT id FROM categories WHERE id = ?', [category_id]);
    if (categories.length === 0) {
        return res.status(400).json({ error: `Category with id ${category_id} not found.` });
    }

    const result = await executeQuery(
      'INSERT INTO spare_parts (name, category_id, quantity, unit_price) VALUES (?, ?, ?, ?)',
      [name, category_id, quantity, unit_price]
    );

    res.status(201).json({
      message: 'Spare part created successfully',
      id: result.insertId,
      name, category_id, quantity, unit_price // Return the created object
    });
  } catch (error) {
    console.error('Error creating spare part:', error);
    res.status(500).json({ error: 'Failed to create spare part' });
  }
});

// Stock In Routes
app.post('/api/stock-in', authenticate, async (req, res) => {
  try {
    const { spare_part_id, quantity, date } = req.body;

    if (!spare_part_id || quantity === undefined) {
        return res.status(400).json({ error: 'Missing required fields: spare_part_id, quantity' });
    }
    if (typeof quantity !== 'number' || quantity <= 0) {
        return res.status(400).json({ error: 'Quantity must be a positive number.' });
    }
    const stockInDate = date || new Date().toISOString().split('T')[0]; // Default to today if not provided

    await executeTransaction(async (connection) => { // Pass the connection for clarity, though global dbConnection is used by query functions
      // Add stock in record
      await connection.query( // Using connection directly as passed by executeTransaction
        'INSERT INTO stock_in (spare_part_id, quantity, date) VALUES (?, ?, ?)',
        [spare_part_id, quantity, stockInDate]
      );

      // Update spare part quantity
      await connection.query(
        'UPDATE spare_parts SET quantity = quantity + ? WHERE id = ?',
        [quantity, spare_part_id]
      );
    });

    res.status(201).json({ message: 'Stock in recorded successfully' });
  } catch (error) {
    console.error('Error processing stock in:', error);
    res.status(500).json({ error: 'Failed to process stock in' });
  }
});

// Stock Out Routes
app.post('/api/stock-out', authenticate, async (req, res) => {
  try {
    const { spare_part_id, quantity, unit_price, date } = req.body; // unit_price here is the selling price at the time of stock out

    if (!spare_part_id || quantity === undefined || unit_price === undefined) {
        return res.status(400).json({ error: 'Missing required fields: spare_part_id, quantity, unit_price' });
    }
    if (typeof quantity !== 'number' || quantity <= 0 || typeof unit_price !== 'number' || unit_price < 0) {
        return res.status(400).json({ error: 'Quantity must be a positive number and unit price non-negative.' });
    }
    const stockOutDate = date || new Date().toISOString().split('T')[0];

    await executeTransaction(async (connection) => {
      // Check available stock (FOR UPDATE locks the row)
      const [spareParts] = await connection.query(
        'SELECT quantity FROM spare_parts WHERE id = ? FOR UPDATE',
        [spare_part_id]
      );

      if (spareParts.length === 0) {
        // This error will be caught by the outer try-catch and cause a rollback
        const err = new Error('Spare part not found');
        err.statusCode = 404;
        throw err;
      }

      const sparePart = spareParts[0];
      if (sparePart.quantity < quantity) {
        const err = new Error('Insufficient stock');
        err.statusCode = 400;
        throw err;
      }

      // Record stock out
      await connection.query(
        'INSERT INTO stock_out (spare_part_id, quantity, unit_price, date) VALUES (?, ?, ?, ?)',
        [spare_part_id, quantity, unit_price, stockOutDate]
      );

      // Update stock
      await connection.query(
        'UPDATE spare_parts SET quantity = quantity - ? WHERE id = ?',
        [quantity, spare_part_id]
      );
    });

    res.status(201).json({ message: 'Stock out recorded successfully' });
  } catch (error) {
    console.error('Error processing stock out:', error);
    const status = error.statusCode || 500; // Use custom status code if set
    res.status(status).json({ error: error.message || 'Failed to process stock out' });
  }
});

app.get('/api/stock-out', authenticate, async (req, res) => {
  try {
    const stockOutRecords = await executeQuery(`
      SELECT so.id, so.spare_part_id, so.quantity, so.unit_price, so.date, so.created_at,
             sp.name AS spare_part_name, 
             c.name AS category_name
      FROM stock_out so
      JOIN spare_parts sp ON so.spare_part_id = sp.id
      JOIN categories c ON sp.category_id = c.id
      ORDER BY so.date DESC, so.created_at DESC
    `);
    res.json(stockOutRecords);
  } catch (error) {
    console.error('Error fetching stock out records:', error);
    res.status(500).json({ error: 'Failed to fetch stock out records' });
  }
});

app.put('/api/stock-out/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { spare_part_id, quantity, unit_price, date } = req.body;

    if (!spare_part_id || quantity === undefined || unit_price === undefined || !date) {
        return res.status(400).json({ error: 'Missing required fields: spare_part_id, quantity, unit_price, date' });
    }
    if (typeof quantity !== 'number' || quantity <= 0 || typeof unit_price !== 'number' || unit_price < 0) {
        return res.status(400).json({ error: 'Quantity must be a positive number and unit price non-negative.' });
    }

    await executeTransaction(async (connection) => {
      const [originalRecords] = await connection.query(
        'SELECT * FROM stock_out WHERE id = ? FOR UPDATE',
        [id]
      );

      if (originalRecords.length === 0) {
        const err = new Error('Stock out record not found');
        err.statusCode = 404;
        throw err;
      }
      const originalRecord = originalRecords[0];

      // Calculate quantity difference for stock adjustment
      // Restore stock for the original item and quantity
      await connection.query(
        'UPDATE spare_parts SET quantity = quantity + ? WHERE id = ?',
        [originalRecord.quantity, originalRecord.spare_part_id]
      );
      
      // Check if new spare part has enough stock IF it's different from original, or if same, if new quantity is higher
      const [newSpareParts] = await connection.query(
          'SELECT quantity FROM spare_parts WHERE id = ? FOR UPDATE',
          [spare_part_id]
      );
      if (newSpareParts.length === 0) {
          const err = new Error(`New spare part with ID ${spare_part_id} not found.`);
          err.statusCode = 404;
          throw err;
      }
      if (newSpareParts[0].quantity < quantity) {
          const err = new Error(`Insufficient stock for new spare part ID ${spare_part_id}. Available: ${newSpareParts[0].quantity}, Required: ${quantity}`);
          err.statusCode = 400;
          throw err;
      }

      // Deduct stock for the new item and quantity
      await connection.query(
        'UPDATE spare_parts SET quantity = quantity - ? WHERE id = ?',
        [quantity, spare_part_id]
      );

      // Update stock out record
      await connection.query(
        'UPDATE stock_out SET spare_part_id = ?, quantity = ?, unit_price = ?, date = ? WHERE id = ?',
        [spare_part_id, quantity, unit_price, date, id]
      );
    });

    res.json({ message: 'Stock out record updated successfully' });
  } catch (error) {
    console.error('Error updating stock out:', error);
    const status = error.statusCode || 500;
    res.status(status).json({ error: error.message || 'Failed to update stock out record' });
  }
});

app.delete('/api/stock-out/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    await executeTransaction(async (connection) => {
      const [records] = await connection.query(
        'SELECT spare_part_id, quantity FROM stock_out WHERE id = ? FOR UPDATE',
        [id]
      );

      if (records.length === 0) {
        const err = new Error('Stock out record not found');
        err.statusCode = 404;
        throw err;
      }
      const recordToDelete = records[0];

      // Delete record
      await connection.query('DELETE FROM stock_out WHERE id = ?', [id]);

      // Restore stock
      await connection.query(
        'UPDATE spare_parts SET quantity = quantity + ? WHERE id = ?',
        [recordToDelete.quantity, recordToDelete.spare_part_id]
      );
    });

    res.json({ message: 'Stock out record deleted successfully' });
  } catch (error) {
    console.error('Error deleting stock out:', error);
    const status = error.statusCode || 500;
    res.status(status).json({ error: error.message || 'Failed to delete stock out record' });
  }
});

// Report Routes
app.get('/api/reports/daily', authenticate, async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ error: 'Date parameter (YYYY-MM-DD) is required' });
    }
    // Basic date validation (can be more robust)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).json({ error: 'Invalid date format. Please use YYYY-MM-DD.' });
    }

    const stockInResults = await executeQuery(
      'SELECT SUM(quantity) AS total_stock_in FROM stock_in WHERE date = ?',
      [date]
    );

    const stockOutResults = await executeQuery(
      // Assuming stock_out.unit_price is the selling price, total_price would be quantity * unit_price
      'SELECT SUM(quantity) AS total_stock_out, SUM(quantity * unit_price) AS total_sales FROM stock_out WHERE date = ?',
      [date]
    );
    
    // For remaining stock, it's better to get the current snapshot, not tied to a specific date's transactions
    const sparePartsCurrentStock = await executeQuery('SELECT id, name, quantity, unit_price FROM spare_parts');

    res.json({
      date,
      total_stock_in: stockInResults[0]?.total_stock_in || 0,
      total_stock_out: stockOutResults[0]?.total_stock_out || 0,
      total_sales: stockOutResults[0]?.total_sales || 0,
      current_stock_levels: sparePartsCurrentStock // Renamed for clarity
    });
  } catch (error) {
    console.error('Error generating daily report:', error);
    res.status(500).json({ error: 'Failed to generate daily report' });
  }
});

// Categories Routes
app.get('/api/categories', authenticate, async (req, res) => {
  try {
    const categories = await executeQuery('SELECT id, name FROM categories ORDER BY name ASC');
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

app.post('/api/categories', authenticate, async (req, res) => {
    try {
        const { name } = req.body;
        if (!name || name.trim() === "") {
            return res.status(400).json({ error: "Category name is required." });
        }

        const existing = await executeQuery('SELECT id FROM categories WHERE name = ?', [name.trim()]);
        if (existing.length > 0) {
            return res.status(409).json({ error: "Category with this name already exists." });
        }

        const result = await executeQuery('INSERT INTO categories (name) VALUES (?)', [name.trim()]);
        res.status(201).json({ message: "Category created successfully", id: result.insertId, name: name.trim() });
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({ error: 'Failed to create category' });
    }
});


// General error handling middleware (should be last)
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack || err); // Log stack for more details
  // Avoid sending detailed error messages to client in production for security
  const statusCode = err.statusCode || 500;
  const message = (process.env.NODE_ENV === 'production' && statusCode === 500)
                  ? 'Internal server error'
                  : err.message || 'An unexpected error occurred';
  res.status(statusCode).json({ error: message });
});

// Start server
async function startServer() {
  await initializeDatabase(); // Initialize DB connection first
  const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server and DB connection');
    server.close(async () => {
      console.log('HTTP server closed');
      if (dbConnection) {
        try {
          await dbConnection.end();
          console.log('Database connection closed');
        } catch (err) {
          console.error('Error closing database connection:', err);
        }
      }
      process.exit(0);
    });
  });

  process.on('SIGINT', () => { // For Ctrl+C
    console.log('SIGINT signal received: closing HTTP server and DB connection');
    server.close(async () => {
      console.log('HTTP server closed');
      if (dbConnection) {
        try {
          await dbConnection.end();
          console.log('Database connection closed');
        } catch (err) {
          console.error('Error closing database connection:', err);
        }
      }
      process.exit(0);
    });
  });
}

startServer().catch(err => {
    console.error("Failed to start server:", err);
    process.exit(1);
});
