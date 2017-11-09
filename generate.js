'use stict';

var Transaction = require('./src/Transaction.js');
var Block = require('./src/Block.js');
var Formatter = require('./src/Formatter.js');
var Blockchain = require('./src/Blockchain');

var transactions = Transaction.getAllUnconfirmed();

txs = '';
if (transactions.length == 0) {
	console.log('Empty block generation');
} else {
	transactions.map(function(e) {
		var size = e.length;
		txs += Formatter.formatHex(size, 8) + e;
	});

	var size = txs.length;
	txs = Formatter.formatHex(size, 16) + txs;
}

var lastBlock = Blockchain.getLatest();

var block = new Block();