/**
 * @author Vladyslav Zaichuk <xinonghost@gmail.com>
 */

'use strict'

/**
 * Class Queue
 * @package app.src.P2P
 */
class Queue
{
	constructor()
	{
		/** @var object _storage */
		this._storage = {};
	}

	/**
	 * Get size of queue.
	 * @return int
	 */
	get size()
	{
		return this._storage.length;
	}

	/**
	 * Put data into queue.
	 * @param mixed data
	 */
	put(data)
	{
		if (!this._storage[data.id])
			this._storage[data.id] = [];
		this._storage[data.id].push(data);
	}

	/**
	 * Take next one element from queue.
	 * @param string id
	 * @return mixed
	 */
	take(id)
	{
		if (!this._storage[id] || this._storage[id].length == 0)
			return null;

		var element = this._storage[id].shift();
		return element;
	}
}

module.exports = Queue;