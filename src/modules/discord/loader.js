const debug = require('debug')('module-discord');
const { PluginLoaderBase } = require('plugnplay');

const Messages = require("./messages");

let socket = null;

async function playerJoinHandler(data)
{
	debug("Sending player join message.");
	socket.emit("webhook send",Messages.PlayerJoined(data.player.name,getPlayerStatusReport()));
}

async function playerLeaveHandler(data)
{
	debug("Sending player leave message.");
	socket.emit("webhook send",Messages.PlayerLeft(data.player.name,getPlayerStatusReport()));
}

async function statusHandler(data)
{
	debug("Sending server status message.");
	socket.emit("webhook send",Messages.ServerStatus(data.new_status, data.old_status));
}

async function versionHandler(data)
{
	debug("Sending server version message.");
	socket.emit("webhook send",Messages.CurrentVersion(data.version));
}

function setupSocketListeners(pterosocket, botsocket)
{
	botsocket.on("player join", playerJoinHandler);
	botsocket.on("player leave", playerLeaveHandler);
	botsocket.on("server status update", statusHandler);
	botsocket.on("server version", versionHandler);

	socket = botsocket;
}

module.exports = class DiscordLoader extends PluginLoaderBase {
	export(options) {
		return Promise.resolve({
			setupSocketListeners,
			globFunctions: {}
		});
	}
};