var mysql = require('mysql2');
const path = require('path');
require('dotenv').config({path: path.resolve(__dirname, '../.env') });
const env = process.env
var connection=mysql.createConnection({
    host:env.HOST,
    user:env.USER,
    password:env.PASSWORD,
    database:env.DATABASE,
    multipleStatements: true,
    dateStrings:'datetime'
  });

//var connection = mysql.createConnection(env.DATABASE_URL);
 connection.connect(function(error){
    if(!!error){
      console.log(error);
    }else{
      console.log('Connected!:)');
    }
  });  

  module.exports = connection;