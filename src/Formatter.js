/**
 * @author Vladyslav Zaichuk <xinonghost@gmail.com>
 */

 'use strict'

/**
 * Class Formatter
 */
class Formatter
{
	constructor()
	{
	}

	/**
	 * Format hex value with paired zero.
	 * @param string hex
	 * @return string
	 */
	static formatHex(hex, length = 0)
	{
		hex = hex.length % 2 != 0 ? '0' + hex : hex;

		if (hex.length < length)
			hex = '0'.repeat(length - hex.length) + hex;

		return hex;
	}
}

module.exports = Formatter;