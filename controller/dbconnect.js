const mysql = require('mysql');
require('dotenv').config();

// Set up a MySQL connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password:process.env.MYSQL_PASS,
    database: 'studocs'
  });  

  // Connect to the MySQL database
connection.connect((error) => {
    if (error) {
      console.error('Error connecting to the MySQL database: ' + error.stack);
      return;
    }
    console.log('Connected to the MySQL database.'); 
  }); 

   


module.exports = {connection};