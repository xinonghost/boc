/**
 * @author Vladyslav Zaichuk <xinonghost@gmail.com>
 */

'use strict'

var DB = require('./DB');
var CryptoJS = require("crypto-js");

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
			'time': +(new Date()),
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
			return {'status':1};
		} else if (input.type == 0) { // Transfer
			this.data.input = input.data;
			return {'status':1};
		} else { // Undefined input
			return {'statuss':0, 'error':'Undefined input provided'};
		}
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
		return {'status':1};
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
	findByHash(hash)
	{
		return this.db.select("SELECT hash FROM transaction WHERE hash = '"+hash+"'");
	}

	/**
	 * Find transaction by input.
	 *
	 * @param string input
	 * @return object
	 */
	findByInput(input)
	{
		return this.db.select("SELECT input FROM transaction WHERE input = '"+input+"'");
	}

	/**
	 * Save transaction in db.
	 */
	save()
	{
		if (this.findByHash(this.data.hash) !== null || this.findByInput(this.data.input) !== null) {
			return true;
		}

		return this.db.query(
			"INSERT INTO transaction (hash, type, blockId, indx, input, output, signature, createdAt) VALUES " +
			"('"+this.data.hash+"', "+this.data.type+", 0, 0, '"+this.data.input+"', '"+this.data.output+"', '"+this.data.signature+"', "+this.data.time+")"
		).success;
	}
}

module.exports = Transaction;