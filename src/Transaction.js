/**
 * @author Vladyslav Zaichuk <xinonghost@gmail.com>
 */

'use strict'

var DB = require('./DB');
var CryptoJS = require("crypto-js");
var Formatter = require('./Formatter');

/**
 * Class Transaction
 * @package src
 */
class Transaction
{
	constructor()
	{
		/** @var DB db DB connection. */
		this.db = new DB();

		/** @var object data */
		this.data = {
			'hash':'',
			'type': 0,
			'input': '',
			'output': '',
			'time': Math.round(+(new Date()) / 1000),
			'signature': ''
		};
	}

	/**
	 * Set input of transaction.
	 *
	 * @param object input
	 * @return object
	 */
	setInput(input)
	{
		
		if (input.type == 1) { // Contract
			this.data.type = 1;
			this.data.input = new Buffer(input.data).toString('base64');
		} else if (input.type == 0) { // Transfer
			this.data.input = input.data;
		}

		return this;
	}

	/**
	 * Set output of transaction.
	 *
	 * @param object output
	 * @return object
	 */
	setOutput(output)
	{
		this.data.output = output;
		return this;
	}

	/**
	 * Set time of transaction.
	 *
	 * @param int time
	 * @return object
	 */
	setTime(time)
	{
		this.data.time = time;
		return this;
	}

	/**
	 * Set type of transaction.
	 *
	 * @param int time
	 * @return object
	 */
	setType(type)
	{
		this.data.type = type;
		return this;
	}

	/**
	 * Get transaction data to sign.
	 *
	 * @return string
	 */
	getDataToSign()
	{
		return this.data.input;
	}

	/**
	 * Set transaction signature
	 */
	setSignature(signature)
	{
		this.data.signature = signature;
		return this;
	}

	/**
	 * Generate hash of transaction.
	 */
	generateHash()
	{
		this.data.hash = CryptoJS.SHA256(
			this.data.type.toString() + this.data.input + this.data.output + this.data.time.toString() + this.data.signature
		).toString();

		return this.data.hash;
	}

	/**
	 * Find transaction by hash.
	 *
	 * @param string hash
	 * @return object
	 */
	static findByHash(hash)
	{
		var db = new DB();
		return db.select("SELECT hash FROM transaction WHERE hash = '"+hash+"'");
	}

	/**
	 * Find transaction by input.
	 *
	 * @param string input
	 * @return object
	 */
	static findByInput(input)
	{
		var db = new DB();
		return db.select("SELECT input FROM transaction WHERE input = '"+input+"'");
	}

	/**
	 * Save transaction in db.
	 */
	save()
	{
		if (Transaction.findByHash(this.data.hash) !== null || Transaction.findByInput(this.data.input) !== null) {
			return false;
		}

		return this.db.query(
			"INSERT INTO transaction (hash, type, blockId, indx, input, output, signature, createdAt) VALUES " +
			"('"+this.data.hash+"', "+this.data.type+", 0, 0, '"+this.data.input+"', '"+this.data.output+"', '"+this.data.signature+"', "+this.data.time+")"
		).success;
	}

	/**
	 * Get transaction raw data.
	 *
	 * @return string
	 */
	getRaw()
	{
		var type = Formatter.formatHex(this.data.type, 2),
			inputSize = Formatter.formatHex(this.data.input.length.toString(16), 4*2),
			outputSize = Formatter.formatHex(this.data.output.length.toString(16), 1*2),
			time = Formatter.formatHex(this.data.time.toString(16), 4*2);

		var raw = type + this.data.hash + inputSize + this.data.input + outputSize + this.data.output +
					time + this.data.signature;

		raw = Formatter.formatHex(raw.length.toString(16), 4*2) + raw;
		return Formatter.stringToHex(raw);
	}

	/**
	 * Get transaction from hex.
	 *
	 * @param string rawTx
	 * @return object
	 */
	static fromRaw(rawTx)
	{
		var raw = Formatter.hexToString(rawTx);
		var txSize = 0;
		var inputSize = 0;
		var outputSize = 0;

		var txData = {
			type: 0,
			hash: '',
			input: '',
			output: '',
			time: 0,
			signature: ''
		};

		if (raw.length < 4*2) {
			return {'status':0, 'error':'Raw length is too short'};
		}
		
		txSize = parseInt(raw.substring(0, 4*2), 16);

		if (raw.length < txSize - 4*2) {
			return {'status':0, 'error':'Raw length is less then specified'};
		}

		var typeStart = 4*2;
		txData.type = parseInt(raw.substring(typeStart, typeStart+1*2), 10);

		var hashStart = typeStart+1*2;
		txData.hash = raw.substring(hashStart, hashStart+64);

		var inputSizeStart = hashStart+64;
		inputSize = parseInt(raw.substring(inputSizeStart, inputSizeStart+4*2), 16);

		var inputStart = inputSizeStart+4*2;
		txData.input = raw.substring(inputStart, inputStart+inputSize);

		var outputSizeStart = inputStart+inputSize;
		outputSize = parseInt(raw.substring(outputSizeStart, outputSizeStart+1*2), 16);

		var outputStart = outputSizeStart+1*2;
		txData.output = raw.substring(outputStart, outputStart+outputSize);

		var timeStart = outputStart+outputSize;
		txData.time = parseInt(raw.substring(timeStart, timeStart+4*2), 16);

		var signatureStart = timeStart+4*2;
		txData.signature = raw.substring(signatureStart);

		var transaction = new Transaction();

		transaction.setType(txData.type)
			.setInput({"type":txData.type, "data":Buffer.from(txData.input, 'base64')})
			.setOutput(txData.output)
			.setTime(txData.time)
			.setSignature(txData.signature);

		if (transaction.generateHash() == txData.hash) {
			return {'status':1, 'data':transaction};
		} else {
			return {'status':0, 'error':'Transaction is damaged'};
		}
	}

	static getAllUnconfirmed()
	{
		var db = new DB();

		var transactions = db.select("SELECT * FROM transaction WHERE blockId = 0");

		if (!transactions || transactions.length == 0) {
			return [];
		} else if (!Array.isArray(transactions)) {
			transactions = [transactions];
		}

		transactions = transactions.map(function(e) {
			var transaction = new Transaction();

			transaction.setType(e.type)
				.setInput({"type":e.type, "data":Buffer.from(e.input, 'base64')})
				.setOutput(e.output)
				.setTime(e.createdAt)
				.setSignature(e.signature).generateHash();

			return transaction.getRaw();
		});


		return transactions;
	}

	/**
	 * Get block transactions.
	 *
	 * @param int blockId
	 * @return Transaction[]
	 */
	static getForBlock(blockId)
	{
		var db = new DB();

		var transactions = db.select("SELECT * FROM transaction WHERE blockId = " + blockId);

		if (!transactions || transactions.length == 0) {
			return [];
		} else if (!Array.isArray(transactions)) {
			transactions = [transactions];
		}

		transactions = transactions.map(function(e) {
			var transaction = new Transaction();

			transaction.setType(e.type)
				.setInput({"type":e.type, "data":Buffer.from(e.input, 'base64')})
				.setOutput(e.output)
				.setTime(e.createdAt)
				.setSignature(e.signature).generateHash();

			return transaction.getRaw();
		});

		return transactions;
	}
}

module.exports = Transaction;