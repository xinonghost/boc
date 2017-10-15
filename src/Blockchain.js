/**
 * @author Vladyslav Zaichuk <xinonghost@gmail.com>
 */

'use strict'

var Block = require('./Block');
var DB = require('./DB');
var Migration = require('./Migration');

/**
 * Class Blockchain
 */
class Blockchain
{
	constructor()
	{
		/** @var DB db DB connection. */
		this.db = new DB();

		/** @var Migration migration */
		var migration = new Migration(this.db);
		migration.up();
	}

	/**
	 * Get genesis block.
	 * @return Block
	 */
	getGenesisBlock()
	{
		return new Block(0, 1465154705, '0000000000000000000000000000000000000000000000000000000000000000', []);
	}

	/**
	 * Get blocks.
	 * @return array
	 */
	getBlocks()
	{
		return this.getGenesisBlock();
	}

	/**
	 * Get latest block.
	 *
	 * @return Block
	 */
	getLatestBlock()
	{
	}
}

module.exports = Blockchain;