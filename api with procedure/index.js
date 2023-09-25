'use strict';
const express = require('express');
const sql = require('mssql');
const cors = require('cors');

const app = express();
const port = 8080; // Specify the port to listen on

app.use(express.json());
app.use(cors());



const config = {
  user: 'skope',
  password: 'Noida@105',
  server: '103.212.120.227',
  database: 'skope',
};

const checkDbConnection = async () => {
  try {
    const pool = await sql.connect(config);
    if (pool.connected) {
      console.log('Database connection successful');
      return pool; // Return the connection pool to be used in your routes
    } else {
      console.log('Database connection failed');
    }
  } catch (error) {
    console.error('Error connecting to the database:', error.message);
  }
};

module.exports = { checkDbConnection };


app.post('/insertOrUpdateUser', async (req, res) => {
  try {
    const { varValue, name, Company, Email, password } = req.body;

    // Check if varValue is 0 (insert) or non-zero (update)
    const isInsert = varValue === 0;

    const pool = await checkDbConnection();
    const request = pool.request();

    // Call the stored procedure to insert or update a user based on varValue
    const result = await request
      .input('var', sql.Int, varValue)
      .input('name', sql.VarChar(50), name)
      .input('Company', sql.VarChar(50), Company)
      .input('Email', sql.VarChar(50), Email)
      .input('Password', sql.VarChar(50), password)
      .execute('skope.Insert_update_VIKASH');

    const message = isInsert ? 'User created successfully' : 'User updated successfully';

    res.status(200).json({ message, data: result.recordset });
  } catch (error) {
    console.error('Error inserting/updating user data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});





// get data with procedure starting  here

app.get('/getusers', async (req, res) => {
  try {
    const pool = await checkDbConnection();
    const request = pool.request();

    const result = await request.execute('GetAllUsers'); // Change the procedure name as needed

    res.status(200).json(result.recordset);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// get data with procedure ending  here


// edit user with procedure get part starting here 
app.get('/usersbyid/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await checkDbConnection();
    const request = pool.request();

    const result = await request
      .input('id', sql.Int, id)
      .execute('GetUserById'); // Change the procedure name as needed

    if (result.recordset.length === 0) {
      res.status(404).json({ error: 'User not found' });
    } else {
      res.status(200).json(result.recordset[0]);
    }
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.put('/usersedit/:id', async (req, res) => {
  const { id } = req.params;
  const { name, Company, Email, Password } = req.body;

  try {
    const pool = await checkDbConnection();
    const request = pool.request();

    // Call the stored procedure to update an existing user
    const result = await request
      .input('id', sql.Int, id)
      .input('name', sql.VarChar(50), name)
      .input('Company', sql.VarChar(50), Company)
      .input('Email', sql.VarChar(50), Email)
      .input('Password', sql.VarChar(50), Password)
      .execute('UpdateUser');

    if (result.rowsAffected[0] === 0) {
      res.status(404).json({ error: 'User not found' });
    } else {
      res.status(200).json({ message: 'User updated successfully' });
    }
  } catch (error) {
    console.error('Error updating user data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// edit user with procedure get part starting ending


app.delete('/deleteusers/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await checkDbConnection();
    const request = pool.request();

    const result = await request
      .input('id', sql.Int, id)
      .execute('DeleteUserById'); // Change the procedure name as needed

    if (result.rowsAffected[0] === 0) {
      res.status(404).json({ error: 'User not found' });
    } else {
      res.status(200).json({ message: 'User deleted successfully' });
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Start the server
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
  checkDbConnection()
});
