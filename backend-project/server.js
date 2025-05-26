const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

app.use(cors());
app.use(express.json());

// DB Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'sims'
});

db.connect((err) => {
    if (err) {
        console.log('Failed to connect to DB', err);
    } else {
        console.log('Connected to DB');
    }
});


// Register User
app.post('/api/signup', (req, res) => {
    const { username, password } = req.body;
    const checkSql = 'SELECT * FROM users WHERE username = ?';

    db.query(checkSql, [username], async (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (results.length > 0) return res.status(400).json({ message: 'User already exists' });

        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            const insertSql = 'INSERT INTO users (username, password) VALUES (?, ?)';
            db.query(insertSql, [username, hashedPassword], (err) => {
                if (err) return res.status(500).json({ error: 'Signup failed' });
                return res.status(201).json({ message: 'Signup successful!' });
            });
        } catch (err) {
            return res.status(500).json({ error: 'Hashing error' });
        }
    });
});

// Login User
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const sql = 'SELECT * FROM users WHERE username = ?';

    db.query(sql, [username], async (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (results.length === 0) return res.status(404).json({ error: 'User not found' });

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

        const token = jwt.sign(
            { userId: user.userId, username: user.username },
            'ttgf8gewvyf',
            { expiresIn: '1h' }
        );

        res.status(200).json({ message: 'Login successful', token });
    });
});


// Add Spare Part (with check for duplicates)
app.post('/api/spareparts', (req, res) => {
    const { name, category, quantity, unitPrice } = req.body;

    const checkSql = 'SELECT * FROM sparepart WHERE name = ? AND category = ?';
    db.query(checkSql, [name, category], (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error during check' });

        if (results.length > 0) {
            return res.status(400).json({ message: 'Spare part already exists' });
        }

        const insertSql = 'INSERT INTO sparepart (name, category, quantity, unitPrice) VALUES (?, ?, ?, ?)';
        db.query(insertSql, [name, category, quantity, unitPrice], (err) => {
            if (err) return res.status(500).json({ error: 'Failed to add spare part' });
            res.status(201).json({ message: 'Spare part added successfully' });
        });
    });
});

// Stock In
app.post('/api/stockin', (req, res) => {
    const { spareId, quantity, date } = req.body;
    const insertSql = 'INSERT INTO stockin (spareId, quantity, date) VALUES (?, ?, ?)';
    const updateSql = 'UPDATE sparepart SET quantity = quantity + ? WHERE spareId = ?';

    db.query(insertSql, [spareId, quantity, date], (err) => {
        if (err) return res.status(500).json({ error: 'Stock in failed' });

        db.query(updateSql, [quantity, spareId], (err) => {
            if (err) return res.status(500).json({ error: 'Failed to update spare quantity' });
            res.status(200).json({ message: 'Stock in successful' });
        });
    });
});

// Stock Out
app.post('/api/stockout', (req, res) => {
    const { spareId, quantity, unitPrice, date } = req.body;
    const totalPrice = quantity * unitPrice;

    const insertSql = 'INSERT INTO stockout (spareId, quantity, unitPrice, totalPrice, date) VALUES (?, ?, ?, ?, ?)';
    const updateSql = 'UPDATE sparepart SET quantity = quantity - ? WHERE spareId = ?';

    db.query(insertSql, [spareId, quantity, unitPrice, totalPrice, date], (err) => {
        if (err) return res.status(500).json({ error: 'Stock out failed' });

        db.query(updateSql, [quantity, spareId], (err) => {
            if (err) return res.status(500).json({ error: 'Failed to update spare quantity' });
            res.status(200).json({ message: 'Stock out successful' });
        });
    });
});

// Get All Spare Parts
app.get('/api/spareparts', (req, res) => {
    db.query('SELECT * FROM sparepart', (err, results) => {
        if (err) return res.status(500).json({ error: 'Failed to fetch spare parts' });
        res.status(200).json(results);
    });
});

// Get All Stockout
app.get('/api/stockout', (req, res) => {
    db.query(`
        SELECT s.stockoutId, s.spareId, sp.name, s.quantity, s.unitPrice, s.totalPrice, s.date
        FROM stockout s
        JOIN sparepart sp ON s.spareId = sp.spareId
        ORDER BY s.date DESC
    `, (err, results) => {
        if (err) return res.status(500).json({ error: 'Failed to fetch stock out records' });
        res.status(200).json(results);
    });
});

// Update Stockout
app.put('/api/stockout/:id', (req, res) => {
    const { id } = req.params;
    const { quantity, unitPrice, date } = req.body;
    const totalPrice = quantity * unitPrice;

    const sql = 'UPDATE stockout SET quantity = ?, unitPrice = ?, totalPrice = ?, date = ? WHERE stockoutId = ?';
    db.query(sql, [quantity, unitPrice, totalPrice, date, id], (err) => {
        if (err) return res.status(500).json({ error: 'Failed to update stock out record' });
        res.status(200).json({ message: 'Stock out updated successfully' });
    });
});

// Delete Stockout
app.delete('/api/stockout/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM stockout WHERE stockoutId = ?', [id], (err) => {
        if (err) return res.status(500).json({ error: 'Failed to delete stock out record' });
        res.status(200).json({ message: 'Stock out deleted successfully' });
    });
});

// Daily Report
app.get('/api/report/daily', (req, res) => {
    const { date } = req.query;

    const stockInSql = 'SELECT SUM(quantity) AS totalStockIn FROM stockin WHERE date = ?';
    const stockOutSql = 'SELECT SUM(quantity) AS totalStockOut, SUM(totalPrice) AS totalSales FROM stockout WHERE date = ?';
    const remainingSql = 'SELECT * FROM sparepart';

    db.query(stockInSql, [date], (err, stockInResult) => {
        if (err) return res.status(500).json({ error: 'Error fetching stock in data' });

        db.query(stockOutSql, [date], (err, stockOutResult) => {
            if (err) return res.status(500).json({ error: 'Error fetching stock out data' });

            db.query(remainingSql, (err, parts) => {
                if (err) return res.status(500).json({ error: 'Error fetching spare parts' });

                res.status(200).json({
                    date,
                    totalStockIn: stockInResult[0].totalStockIn || 0,
                    totalStockOut: stockOutResult[0].totalStockOut || 0,
                    totalSales: stockOutResult[0].totalSales || 0,
                    remainingStock: parts
                });
            });
        });
    });
});



app.listen(5000, () => {
    console.log('Server is running on http://localhost:5000');
});
