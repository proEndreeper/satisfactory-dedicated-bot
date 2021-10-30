const Nodeactyl = require("nodeactyl");
const WebSocket = require("ws").WebSocket;
const EventEmitter = require('events');

class PterodactylWebSocket extends EventEmitter
{
	#_client;
	#_socket = null;
	#_serverId;

	constructor(panelUrl, panelToken, serverId)
	{
		super();
		this.#_client = new Nodeactyl.NodeactylClient(panelUrl,panelToken);
		this.#_serverId = serverId;
	}

	async connect()
	{
		if(this.#_socket && this.#_socket.readyState == WebSocket.OPEN) return;
		await this.#_connectWebsocket();
	}

	async #_connectWebsocket()
	{
		let newSocket = false;
		console.log("Retrieving socket information!");
		const webSocketDetails = await this.#_client.getConsoleWebSocket(this.#_serverId);
		console.log("Attempting to connect to socket!");

		if(!this.#_socket || this.#_socket.readyState != WebSocket.OPEN)
		{
			newSocket = true;
			console.log("Opening socket!");
			this.#_socket = new WebSocket(`${webSocketDetails.socket}?token=${webSocketDetails.token}`);

			this.#_socket.on("message",this.#_onmessage.bind(this));
			this.#_socket.on("error",this.#_onerror.bind(this));
		}

		let self = this;

		if(newSocket)
		{
			this.#_socket.once("open",()=>{
				self.send("auth",webSocketDetails.token);
				self.emit("open");
			});
		} else {
			self.send("auth",webSocketDetails.token);
		}
	}

	async #_onerror(err)
	{
		console.log("An error occurred!",err);
	}

	async #_onmessage(msg)
	{
		let parsed_msg = JSON.parse(msg);
		parsed_msg.args = parsed_msg.args || [];
		this.emit(parsed_msg.event,...parsed_msg.args);

		if(parsed_msg.event == "token expiring" || parsed_msg.event == "token expired")
		{
			console.log("Token expired, refreshing token!");
			await this.#_connectWebsocket();
		}
	}

	async send(eventName,...args)
	{
		if(!this.#_socket || (this.#_socket && this.#_socket.readyState != WebSocket.OPEN))
		{
			await this.#_connectWebsocket();
		}
		this.#_socket.send(JSON.stringify({
			event:eventName,
			args:args.length>0?args:[null]
		}));
	}
}

module.exports = {PterodactylWebSocket};