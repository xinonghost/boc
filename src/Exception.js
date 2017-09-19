/**
 * @author Vladyslav Zaichuk <xinonghost@gmail.com>
 */

'use strict'

/**
 * Class Exception
 * Common exception class.
 */
class Exception
{
	constructor(message, type)
	{
		this.message = message || 'Undefined exception';
		this.type = type || Exception.ERROR;
	}

	/**
	 * Empty element exception type.
	 */
	static get EMPTY()
	{
		return 0;
	}

	/**
	 * Error while run some code.
	 */
	static get ERROR()
	{
		return 1;
	}

	/**
	 * Invalid data of some element.
	 */
	static get INVALID()
	{
		return 2;
	}
}

module.exports = Exception;