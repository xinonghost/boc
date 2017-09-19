/**
 * @author Vladyslav Zaichuk <xinonghost@gmail.com>
 */

'use strict'

var Block = require('./Block');

/**
 * Class Blockchain
 */
class Blockchain
{
	constructor()
	{
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
}

module.exports = Blockchain;