'use stict';

var Transaction = require('./src/Transaction.js');
var Block = require('./src/Block.js');
var Formatter = require('./src/Formatter.js');
var Blockchain = require('./src/Blockchain.js');
var DB = require('./src/DB.js');

var blockchain = new Blockchain();

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

var lastBlock = blockchain.getLatestBlock();

var block = new Block(lastBlock.index, Math.round(+(new Date())/1000), lastBlock.getHash(), txs, 0);

console.log(block.getRaw());