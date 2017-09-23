/**
 * @author Vladyslav Zaichuk <xinonghost@gmail.com>
 */

'use strict'

/**
 * Class Response
 * @package app/src/RPC
 */
class Response
{
	constructor(message, status)
	{
		/** @var object message */
		this.message = message || {};

		/** @var int status */
		this.status = status || Response.SUCCESS;
	}

	/**
	 * Form response json.
	 */
	formJson()
	{
		if (this.status)
			return JSON.stringify({'status':this.status, 'data':this.message});
		else
			return JSON.stringify({'status':this.status, 'error':this.message});
	}

	/**
	 * Error status.
	 */
	static get ERROR()
	{
		return 0;
	}

	/**
	 * Success status.
	 */
	static get SUCCESS()
	{
		return 1;
	}

	/**
	 * Send success response static.
	 */
	static give(message)
	{
		var response = new Response(message, Response.SUCCESS);
		return response.formJson();
	}

	/**
	 * Send success response static.
	 */
	static giveError(message)
	{
		var response = new Response(message, Response.ERROR);
		return response.formJson();
	}
}

module.exports = Response;