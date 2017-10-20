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

		/** @var Block genesisBlock */
		this.genesisBlock = new Block(0, 1465154705, '0000000000000000000000000000000000000000000000000000000000000000', []);

		/** @var Migration migration */
		var migration = new Migration(this.db);
		migration.up();
		migration.genesisBlockUp(this.genesisBlock);
	}

	/**
	 * Get genesis block.
	 * @return Block
	 */
	getGenesisBlock()
	{
		return this.genesisBlock;
	}

	/**
	 * Get blocks.
	 *
	 * @param int from
	 * @param int to
	 * @return array
	 */
	getBlocks(from, to)
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
		var blockData = this.db.getLatestBlock();

		if (!blockData)
			return null;

		var block = new Block(
			blockData.height,
			blockData.createdAt,
			blockData.prev,
			[],
			blockData.nonce
		);

		return block;
	}

	/**
	 * Save block into DB.
	 *
	 * @param Block block
	 * @return objects
	 */
	saveBlock(block)
	{
	}
}

module.exports = Blockchain;