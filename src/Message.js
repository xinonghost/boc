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
		this.data = data ? : null;
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
	 * Unpack received message.
	 * @param string package
	 * @return Message
	 */
	static unpack(package)
	{
		var messageData = JSON.parse(package);

		return new Message(package.type, package.data ? : null);
	}

	/**
	 * Pack message to dictionary to transfer through the socket.
	 * @return object
	 */
	pack()
	{
		var self = this;

		var package = {type: self.type};
		if (self.data)
			package.data = self.data;

		return package;
	}
}

module.exports = Message;