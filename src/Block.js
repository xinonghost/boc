/**
 * @author Vladyslav Zaichuk <xinonghost@gmail.com>
 */

'use strict'

var CryptoJS = require("crypto-js");
var Exception = require('./Exception');
var Formatter = require('./Formatter');
var Transaction = require('./Transaction');
var DB = require('./DB');

/**
 * Class Block
 * Contains all necessary properties of block to handle in blockchain.
 */
class Block
{
	constructor(index, timestamp, previousHash, data, nonce)
	{
		// Index of block
		this.index = index;

		// Hash string of previous block
		this.previousHash = previousHash.toString();

		// Unix timestamp when block was created
		this.timestamp = timestamp;

		// Nonce of block
		this.nonce = nonce || 0;

		// Block payload data
		this.data = data;

		// List of transactions
		this.txs = Block.parseTransactions(this.data);

		// Raw data of block
		this.raw = '';

		// Version number size
		this.version = 0;

		// Hesh of block header
		this.hash = '';
	}

	/**
	 * Get composed raw string for block.
	 * @return string
	 */
	getRaw()
	{
		if (this.raw != '')
			return this.raw;

		var versionHex = Formatter.formatHex(this.version.toString(16)),
			versionSize = Formatter.formatHex(versionHex.length / 2),
			indexHex = Formatter.formatHex(this.index.toString(16)),
			indexSize = Formatter.formatHex(indexHex.length / 2),
			timestampHex = Formatter.formatHex(this.timestamp.toString(16), 4*2),
			nonce = Formatter.formatHex(this.nonce, 4*2);

		this.raw = versionSize + versionHex + indexSize + indexHex + timestampHex + this.previousHash + nonce + this.data;
		return this.raw;
	}

	/**
	 * Get hash of block.
	 * @return string
	 */
	getHash(debug)
	{

		var data = Formatter.formatHex(this.index) +
				Formatter.formatHex(this.timestamp) +
				Formatter.formatHex(this.previousHash) +
				this.getTxRoot() +
				Formatter.formatHex(this.nonce);
		
		if (debug) {
			console.log(this.hash);
			console.log(typeof data, data);
		}

		if (this.hash == '') {
			this.hash = CryptoJS.SHA256(data).toString();
		}

		return this.hash;
	}

	/**
	 * Get block time.
	 *
	 * @return int
	 */
	getTime()
	{
		return this.timestamp;
	}

	/**
	 * Get block height.
	 *
	 * @return int
	 */
	getHeight()
	{
		return this.index;
	}

	/**
	 * Get previous hash.
	 *
	 * @return string
	 */
	getPreviousHash()
	{
		return this.previousHash;
	}

	/**
	 * Get block nonce.
	 *
	 * @return int
	 */
	getNonce()
	{
		return this.nonce;
	}

	/**
	 * Get block version.
	 *
	 * @return int
	 */
	getVersion()
	{
		return this.version;
	}

	/**
	 * Get transaction root.
	 * @return string
	 */
	getTxRoot()
	{
		return CryptoJS.SHA256(this.data).toString();
	}

	/**
	 * Get structured block from raw string.
	 * @param string raw
	 * @throws Exception
	 * @return Block
	 */
	static parseRawBlock(raw)
	{
		var sVersionSize = '',
			iVersionSize = 0,
			sVersion = '',
			iVersion = 0;

		if ('string' != typeof raw)
		{
			try {
				raw = raw.toString();
			} catch (e) {
				throw new Exception('Cant stringify raw data', Exception.ERROR);
			}
		}

		

		// Parsing version
		if (!raw)
			throw new Exception('Raw string is empty', Exception.EMPTY);

		sVersionSize = raw.substring(0, 2);

		if (sVersionSize.length != 2)
			throw new Exception('Length of version size if invalid', Exception.INVALID);

		iVersionSize = parseInt(sVersionSize, 16);
		if (iVersionSize < 1 || iVersionSize > 255)
			throw new Exception('Incorrect version number size', Exception.INVALID);

		if (raw.length < (2 + 2 * iVersionSize))
			throw new Exception('Raw string is shorter then needed', Exception.INVALID);

		sVersion = raw.substring(2, 2 + 2*iVersionSize);
		iVersion = parseInt(sVersion, 16);

		

		// Parsing index
		var sIndexSize = '',
			iIndexSize = 0,
			sIndex = '',
			iIndex = 0,
			iIndexOffset = 2 + iVersionSize * 2;

		if (raw.length < iIndexOffset + 2)
			throw new Exception('Raw string have not valid index data', Exception.INVALID);

		sIndexSize = raw.substring(iIndexOffset, iIndexOffset + 2);
		iIndexSize = parseInt(sIndexSize, 16);
		if (iIndexSize < 1 || iIndexSize > 255)
			throw new Exception('Invalid block index size', Exception.INVALID);

		if (raw.length < iIndexOffset + 2 + 2 * iIndexSize)
			throw new Exception('Raw string have not enought data for index', Exception.INVALID);

		sIndex = raw.substring(iIndexOffset + 2, iIndexOffset + 2 + 2 * iIndexSize);
		iIndex = parseInt(sIndex, 16);
		if (iIndex < 0)
			throw new Exception('Index value cannot be negative', Exception.INVALID);

		

		// Parsing timestamp
		var sTimestamp = '',
			iTimestamp = 0,
			iTimestampOffset = iIndexOffset + 2 + 2 * iIndexSize;

		if (raw.length < iTimestampOffset + 8)
			throw new Exception('Raw string have not enought data for timestamp', Exception.INVALID);

		sTimestamp = raw.substring(iTimestampOffset, iTimestampOffset + 8);
		iTimestamp = parseInt(sTimestamp, 16);
		if (iTimestamp < 0)
			throw new Exception('Timestamp value cannot be negative', Exception.INVALID);

		

		// Parse previous block hash
		var sPrevHash = '',
			iPrevHashOffset = iTimestampOffset + 8;

		if (raw.length < iPrevHashOffset + 64)
			throw new Exception('Raw string have not enought data for previous block hash', Exception.INVALID);

		sPrevHash = raw.substring(iPrevHashOffset, iPrevHashOffset + 64);


		
		// Parsing nonce
		var sNonce = '',
			iNonce = 0,
			iNonceOffset = iPrevHashOffset + 64;

		if (raw.length < iNonceOffset + 8)
			throw new Exception('Raw string have not enought data for nonce', Exception.INVALID);

		sNonce = raw.substring(iNonceOffset, iNonceOffset + 8);
		iNonce = parseInt(sNonce);
		if (iNonce < 0)
			throw new Exception('Nonce value cannot be negative', Exception.INVALID);

		var block = new Block(iIndex, iTimestamp, sPrevHash, raw.substring(iNonceOffset + 8), iNonce);

		block.version = iVersion;
		block.raw = raw;
		block.getHash();

		return block;
	}

	/**
	 * Get transactions from raw block string.
	 * @param string raw
	 * @param int offset
	 * @return array
	 */
	static parseTransactions(raw)
	{
		if (raw.length < 8) {
			return '';
		}

		var size = parseInt(raw.substring(0, 16));

		if (size < 1 || raw.substring(16).length < size) {
			return '';
		}

		var txs = raw.substring(16);
		var transactions = [];
		while (txs.length > 0) {
			var txSize = parseInt(txs.substring(0, 8));

			if (txSize < 1 || txs.substring(8, 8+txSize).length != txSize) {
				throw new Exception('Transaction size is too small', Transaction.ERROR);
			}

			var tx = Transaction.fromRaw(txs.substring(8, 8+txSize));
			if (tx.status) {
				transactions.push(tx.data);
			} else {
				throw new Exception(tx.error, Transaction.ERROR);
			}

			txs = txs.substring(8+txSize);
		}

		return transactions;
	}

	/**
	 * Save block into DB.
	 *
	 * @return boolean
	 */
	save()
	{
		var db = new DB();

		var result = db.query("INSERT INTO block (hash, prev, height, createdAt, nonce, version) VALUES ('"+this.getHash()+"', '"+this.previousHash+"', "+this.index+", "+this.timestamp+", "+this.nonce+", "+this.version+")");

		if (!result.success) {
			return false;
		}
		
		var block = db.select("SELECT * FROM block where hash = '"+this.getHash()+"'");

		if (this.txs.length == 0) {
			return true;
		}

		var success = true;
		var index = -1;
		this.txs.map(function(e) {
			index++;
			var tx = db.select("SELECT * FROM transaction WHERE hash = '"+e.generateHash()+"'");

			if (!tx) {
				var result = db.query("INSERT INTO transaction (hash, type, blockId, indx, input, output, signature, createdAt) VALUES ('"+e.generateHash()+"', "+e.data.type+", "+block.id+", "+index+", '"+e.data.input+"', '"+e.data.output+"', '"+e.data.signature+"', "+e.data.time+")");
				if (!result.success) {
					success = false;
					return e;
				}
			} else if (tx.blockId != block.id) {
				var result = db.query("UPDATE transaction SET blockId = "+block.id+" WHERE hash = '"+tx.hash+"'");
				if (!result.success) {
					success = false;
					return e;
				}
			}
			
			return null;
		});

		return success;
	}
}

module.exports = Block;