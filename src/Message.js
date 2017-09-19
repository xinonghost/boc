/**
 * @author Vladyslav Zaichuk <xinonghost@gmail.com>
 */

'use strict'

/**
 * Class Message
 */
class Message
{
	/**
	 * Latest block message type.
	 */
	static get QUERY_LATEST()
	{
		return 0;
	}

	/**
	 * All blocks message type.
	 */
	static get QUERY_ALL()
	{
		return 1;
	}
	
	/**
	 * Response blocks message type.
	 */
	static get RESPONSE_BLOCKCHAIN()
	{
		return 2;
	}
}

module.exports = Message;