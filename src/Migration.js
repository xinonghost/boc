/**
 * @author Vladyslav Zaichuk <xinonghost@gmail.com>
 */

'use strict'

/**
 * Class Migration
 * @package src
 */
class Migration
{
	constructor(db)
	{
		/** @var object db DB connection. */
		this.db = db;
	}

	/**
	 * Create all tables.
	 */
	up()
	{
		this.blockUp();
		this.transactionUp();
	}

	/**
	 * Create block table.
	 */
	blockUp()
	{
		var columns = [
			'id int(11) not null auto_increment primary key',
			'hash varchar(64) not null unique',
			'prev varchar(64) not null',
			'height int(11) not null',
			'createdAt bigint(16) not null',
			'nonce bigint(16) not null',
			'version int(2) not null'
		];

		this.db.query("CREATE TABLE IF NOT EXISTS block (" + columns.join(',') + ") default charset utf8");
	}

	/**
	 * Create transaction table.
	 */
	transactionUp()
	{
		var columns = [
			'id int(11) not null auto_increment primary key',
			'hash varchar(64) not null unique',
			'blockId int(11) not null',
			'indx int(4) not null',
			'createdAt bigint(16) not null'
		];

		this.db.query("CREATE TABLE IF NOT EXISTS transaction (" + columns.join(',') + ") default charset utf8");
	}

	/**
	 * Specify genesis block.
	 *
	 * @param src.Block block
	 */
	genesisBlockUp(block)
	{
		if (this.db.getLatestBlock() != null)
			return;

		var values = [
			"'" + block.getHash() + "'",
			"'" + block.getPreviousHash() + "'",
			block.getHeight(),
			block.getTime(),
			block.getNonce(),
			block.getVersion()
		];

		this.db.query("INSERT INTO block (hash, prev, height, createdAt, nonce, version) VALUES ("+values.join(',')+")");
	}
}

module.exports = Migration;