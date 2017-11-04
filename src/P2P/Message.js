/**
 * @author Vladyslav Zaichuk <xinonghost@gmail.com>
 */

'use strict'

/**
 * Class Message
 */
class Message
{
	constructor(type, data)
	{
		/** @var int type Message type. */
		this.type = type;

		/** @var mixed data Data to transfer. */
		this.data = data ? data : null;
	}

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
	static get RESPONSE_LATEST()
	{
		return 1;
	}

	/**
	 * Transaction message type.
	 */
	static get BROADCAST_TRANSACTION()
	{
		return 2;
	}

	/**
	 * Unpack received message.
	 * @param string pkg
	 * @return Message
	 */
	static unpack(pkg)
	{
		var messageData = JSON.parse(pkg);

		return new Message(messageData.type, messageData.data ? messageData.data : null);
	}

	/**
	 * Pack message to dictionary to transfer through the socket.
	 * @return object
	 */
	pack()
	{
		var self = this;

		var pkg = {type: self.type};
		if (self.data)
			pkg.data = self.data;

		return JSON.stringify(pkg);
	}
}

module.exports = Message;