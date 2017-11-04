/**
 * @author Vladyslav Zaichuk <xinonghost@gmail.com>
 */

'use strict'

var syncSql = require('sync-sql');

/**
 * Class DB
 * @package src
 */
class DB
{
	constructor()
	{
		/** @var object config DB connection config. */
		this.config = {
			host: 'localhost',
			user: 'root',
			password: 'mysql',
			database: 'boc',
			port: '3306'
		};
	}

	/**
	 * Make a query.
	 *
	 * @param string query
	 * @return object
	 */
	query(query)
	{
		return syncSql.mysql(this.config, query);
	}

	/**
	 * Get latest block.
	 *
	 * @return object
	 */
	getLatestBlock()
	{
		var result = this.query("SELECT * FROM block ORDER BY height LIMIT 1");

		if (!result.success)
			return null;

		if (result.data.rows.length != 1)
			return null;

		return result.data.rows[0];
	}

	/**
	 * Get latest block.
	 *
	 * @return object
	 */
	select(query)
	{
		var result = this.query(query);

		if (!result.success)
			return null;

		if (result.data.rows.length < 1)
			return null;

		if (result.data.rows.length == 1)
			return result.data.rows[0];

		return result.data.rows;
	}
}

module.exports = DB;