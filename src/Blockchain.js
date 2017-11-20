/**
 * @author Vladyslav Zaichuk <xinonghost@gmail.com>
 */

'use strict'

var Block = require('./Block');
var Transaction = require('./Transaction');
var DB = require('./DB');
var Migration = require('./Migration');
var Formatter = require('./Formatter');

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
		this.genesisBlock = new Block(0, 1465154705, '0000000000000000000000000000000000000000000000000000000000000000', '', 0);

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

		var payloadData = this.getBlockPayload(Transaction.getForBlock(blockData.id));

		var block = new Block(
			blockData.height,
			blockData.createdAt,
			blockData.prev,
			payloadData,
			blockData.nonce
		);

		return block;
	}

	/**
	 * Get payload data for block.
	 *
	 * @param Transaction[] transactions
	 * @return string
	 */
	getBlockPayload(transactions)
	{
		var txs = '';
		if (transactions.length == 0) {
			return '';
		}

		transactions.map(function(e) {
			var size = e.length;
			txs += Formatter.formatHex(size, 8) + e;
		});

		var size = txs.length;
		txs = Formatter.formatHex(size, 16) + txs;

		return txs;
	}

	/**
	 * Save block into DB.
	 *
	 * @param Block block
	 * @return boolean
	 */
	saveBlock(block)
	{
		var lastBlock = this.getLatestBlock();
		if (block.previousHash != lastBlock.getHash()) {
			return false;
		}

		if (block.index-1 != lastBlock.index) {
			return false;
		}

		return block.save();
	}

	/**
	 * Validate block.
	 *
	 * @param Block block
	 */
	validateBlock(block)
	{
		return parseInt(block.getHash().substring(0, 8), 16) < parseInt('000008FF', 16)
			&& this.getLatestBlock().index+1 == block.index
			&& this.getLatestBlock().getHash() == block.previousHash;
	}
}

module.exports = Blockchain;