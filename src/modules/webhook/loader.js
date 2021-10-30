const debug = require('debug')('module-webhook');
const axios = require('axios');
const { PluginLoaderBase } = require('plugnplay');

const WEBHOOK_URL = process.env.DISCORD_WEBHOOK;

let socket = null;

const baseWebhook = {
	username: "Satisfactory Dedicated Server",
	avatar_url: "https://pbs.twimg.com/profile_images/1158375257633374209/_5kjxQIu_400x400.jpg"
};

async function webhookHandler(webhook_data)
{
	let merged_data = {
		...baseWebhook,
		...webhook_data
	};

	debug("Sending webhook with the following data: ");
	debug(merged_data);
	let response = await axios.post(WEBHOOK_URL, merged_data);

	socket.emit("webhook sent",{
		webhook:webhook_data,
		response: response,
		result:response.data
	});
}

function setupSocketListeners(pterosocket, botsocket)
{
	botsocket.on("webhook send", webhookHandler);

	socket = botsocket;
}

module.exports = class WebhookLoader extends PluginLoaderBase {
	export() {
		return Promise.resolve({
			setupSocketListeners,
			globFunctions: {}
		});
	}
};