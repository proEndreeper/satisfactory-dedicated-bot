require("dotenv").config();
const {PterodactylWebSocket} = require("./pterodactylwebsocket");
const { PluginManager } = require("plugnplay");
const path = require("path");
const BotSocket = require("./botsocket");

const socket = new BotSocket();

function isCriticalError(err)
{
	return false;
}

process.on('uncaughtException', function(error) {
	console.log(error);
	if(isCriticalError(error))
		process.exit(1)
});

const pterosocket = new PterodactylWebSocket(process.env.PANEL_URL,process.env.CLIENT_API_KEY, process.env.SERVER_ID);

pterosocket.on("auth success",()=>{
	console.log("Startup Complete!");
});

console.log("Loading plugins...");

const manager = new PluginManager({
	discovery: {
		rootPath: path.join(path.resolve(__dirname), "modules"),
		allowsContributed: false
	}
});

let plugins = manager.discoverSync();

let promises = [];
for(let plugin of plugins)
{
	promises.push(async ()=>{
		console.log(`Loading plugin '${plugin.id}'...`);
		const pluginResult = await manager.instantiate(plugin.id,{});

		if(plugin.type == "base_module")
		{
			await pluginResult.exports.setupSocketListeners(pterosocket,socket);

			for(let funcName of Object.keys(pluginResult.exports.globFunctions))
			{
				global[funcName] = pluginResult.exports.globFunctions[funcName];
			}
		}
		console.log(`Plugin '${plugin.id}' loaded.`);
	});
}

let overallPromise = Promise.all(promises.map(prom=>prom()));

overallPromise.then(()=>{
	console.log("All plugins loaded!");
	pterosocket.connect();
});