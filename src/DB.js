/**
 * @author Vladyslav Zaichuk <xinonghost@gmail.com>
 */

'use strict'

var mysql = require('mysql');

/**
 * Class DB
 * @package src
 */
class DB
{
	constructor()
	{
		/** @var object connection DB connection. */
		this.connection = mysql.createConnection({
			host: "localhost",
			user: "root",
			password: "mysql"
		});

		this.connection.connect(function(err) {
			if (err) throw err;
			console.log("[DB] Connection established.");
		});

		this.connection.query("CREATE DATABASE IF NOT EXISTS boc");
		this.connection.query("use boc");
	}

	/**
	 * Make a query.
	 *
	 * @param string query
	 * @return object
	 */
	query(query)
	{
		return this.connection.query(query);
	}
}

module.exports = DB;