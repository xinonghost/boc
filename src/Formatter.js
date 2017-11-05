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
	static formatHex(hex, length)
	{
		hex = hex.length % 2 != 0 ? '0' + hex : hex;

		if (hex.length < length)
			hex = '0'.repeat(length - hex.length) + hex;

		return hex;
	}

	/**
	 * Convert string into hex view.
	 *
	 * @param string text
	 * @return string
	 */
	static stringToHex(text)
	{
		var hex = '';

		for (var i = 0; i < text.length; i++) {
			hex += Formatter.formatHex(text.charCodeAt(i).toString(16), 1*2);
		}

		return hex;
	}

	/**
	 * Convert hex into string.
	 *
	 * @param string text
	 * @return string
	 */
	static hexToString(text)
	{
		var str = '';

		for (var i = 0; i < text.length; i += 2) {
			str += text.fromCharCode(parseInt(text.substring(i, i+2), 16));
		}

		return str;
	}
}

module.exports = Formatter;