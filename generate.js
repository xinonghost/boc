'use stict';

var Transaction = require('./src/Transaction.js');
var Block = require('./src/Block.js');
var Formatter = require('./src/Formatter.js');
var Blockchain = require('./src/Blockchain.js');
var DB = require('./src/DB.js');
var httpRequest = require('sync-request');

var blockchain = new Blockchain();
var lastBlock = blockchain.getLatestBlock();

var block = null;
var nonce = -1;
var time = Math.round(+(new Date())/1000);
var t0 = +(new Date())/1000;
var history = [];
var txs = getTransactions();

do {
	time = Math.round(+(new Date())/1000);

	if (nonce > 1000000) {
		nonce = -1;
	}

	nonce++;
	block = new Block(lastBlock.index+1, time, lastBlock.getHash(), txs, nonce);

	if (blockchain.validateBlock(block)) {
		var res = httpRequest('POST', 'http://localhost:3002/submitblock', {
			json: { block: block.getRaw() }
		});
		
		var resJSON = JSON.parse(res.getBody('utf8'));
		if (!resJSON.status) {
			break;
		}

		var t1 = +(new Date())/1000;
		history.push(t1 - t0);

		console.log(block.getHash(), (t1 - t0), avg(history));
		var t0 = +(new Date())/1000;

		lastBlock = blockchain.getLatestBlock();
		txs = getTransactions();
	}
} while (true);

function avg(values)
{
	var total = values.reduce(function(prev, e) { return prev + e; });
	return total / values.length;
}

function getTransactions()
{
	var transactions = Transaction.getAllUnconfirmed();

	var txs = '';
	if (transactions.length == 0) {
		console.log('Empty block generation');
	} else {
		console.log('Found ' + transactions.length + ' transactions');
		transactions.map(function(e) {
			var size = e.length;
			txs += Formatter.formatHex(size, 8) + e;
		});

		var size = txs.length;
		txs = Formatter.formatHex(size, 16) + txs;
	}

	return txs;
}