const { PluginLoaderBase } = require('plugnplay');
const stripColor = require('strip-color');
const debug = require('debug')('module-server_status');

let socket = null;

let old_status = "";
let satisfactoryVersion = "XXXXXX";

const ClientVersionRegex = /^LogInit: Net CL: /;

async function statusHandler(new_status)
{
	debug(`Server is now '${new_status}'${old_status!==""?" was '"+old_status+"'":""}`);

	if(old_status !== "") 
	{
		socket.emit("server status update",{
			new_status,
			old_status
		});
	} else {
		socket.emit("server status initial",{
			status: new_status
		});
	}

	old_status = new_status;
}

async function consoleOutputHandler(msg) {

	let strippedMessage = stripColor(msg);

	if(ClientVersionRegex.test(strippedMessage))
	{
		satisfactoryVersion = strippedMessage.substr(17);
		debug(`Server is on version ${satisfactoryVersion}`);
		socket.emit("server version",{
			version: satisfactoryVersion
		})
	}
}

function getSocketVersion()
{
	return satisfactoryVersion;
}

function setupSocketListeners(pterosocket, botsocket)
{
	pterosocket.on("status",statusHandler);
	pterosocket.on("console output",consoleOutputHandler);

	socket = botsocket;
}

module.exports = class PlayerLoader extends PluginLoaderBase {
	async export() {
		return {
			setupSocketListeners: setupSocketListeners,
			globFunctions: {
				getSocketVersion
			},
			thisthing: true
		};
	}
};