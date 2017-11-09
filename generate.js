'use stict';

var Transaction = require('./src/Transaction.js');
var Block = require('./src/Block.js');

var transactions = Transaction.getAllUnconfirmed();

txs = '';
if (transactions.length == 0) {
	console.log('Empty block generation');
} else {
	transactions.map(function(e) {
		//
	});
}