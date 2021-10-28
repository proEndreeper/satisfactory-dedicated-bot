require("dotenv").config();
const {PterodactylWebSocket} = require("./pterodactylwebsocket");
const {SatisfactoryUser} = require("./satisfactoryuser.js");
const stripColor = require('strip-color');
const axios = require('axios');
const Messages = require('./messages.js');

const baseWebhook = {
	username: "Satisfactory Dedicated Server",
	avatar_url: "https://pbs.twimg.com/profile_images/1158375257633374209/_5kjxQIu_400x400.jpg"
};

const socket = new PterodactylWebSocket(process.env.PANEL_URL,process.env.CLIENT_API_KEY, process.env.SERVER_ID);

socket.on("auth success",()=>{
	console.log("Successfully authenticated!");
});

let satisfactoryVersion = "";
let playerSessions = {};
let idToPlayerNameMap = {};

function playerCount()
{
	let onlineCount = 0;
	for(let player of playerSessions)
	{
		if(player.online) onlineCount++;
	}
	return onlineCount;
}

const MAX_PLAYER_COUNT = process.env.MAX_PLAYER_COUNT;

const ClientVersionRegex = /^LogInit: Net CL: /;

const LoginRequestRegex = /^\[([^\]]+)\]\[([^\]]+)\]LogNet: Login request: \?EntryTicket=[0-9A-F]+\?Name=(.+) userId: (.+):(\(EOS\)[0-9a-f]+\|[0-9a-f]+|\(STEAM\)[0-9]+) platform: (.+)/;
const JoinRequestRegex = /^\[([^\]]+)\]\[([^\]]+)\]LogNet: Join request: \/Game\/FactoryGame\/Map\/DedicatedserverEntry\?EntryTicket=[0-9A-F]+\?Name=(.+)\?.+/;
const JoinSucceededRegex = /^\[([^\]]+)\]\[([^\]]+)\]LogNet: Join succeeded: (.+)/;
const ConnectionClosedRegex = /^\[([^\]]+)\]\[([^\]]+)\]LogNet: UChannel::Close: Sending CloseBunch. ChIndex == [0-9]+\. Name: \[UChannel\] ChIndex: [0-9]+, Closing: [0-9]+ \[UNetConnection\] RemoteAddr: [^,]+, Name: IpConnection_[0-9]+, Driver: [^,]+, IsServer:[^,]+, PC:[^,]+, Owner:[^,]+, UniqueId: [^:]+:(.+)$/

let old_status = "";

socket.on("status",async (new_status)=>{
	console.log(`Server is now '${new_status}'${old_status!==""?" was '"+old_status+"'":""}`);
	if(old_status === "") old_status = new_status;
	await axios.post(process.env.DISCORD_WEBHOOK,{
		...baseWebhook,
		...Messages.ServerStatus(new_status,old_status)
	});
	old_status = new_status;
});

socket.on("console output",async (msg)=>{

	msg = stripColor(msg);

	if(ClientVersionRegex.test(msg))
	{
		satisfactoryVersion = msg.substr(17);
		console.log(`Server is on version ${satisfactoryVersion}`);
		await axios.post(process.env.DISCORD_WEBHOOK,{
			...baseWebhook,
			...Messages.CurrentVersion(satisfactoryVersion)
		});
	}

	if(LoginRequestRegex.test(msg))
	{
		console.log("Received login request!");
		let data = LoginRequestRegex.exec(msg);
		let userName = data[3];
		if(!playerSessions[userName])
		{
			playerSessions[userName] = new SatisfactoryUser(userName);
			playerSessions[userName].identity = data[5];
		}
		console.log(`User '${userName}' is attempting to login!`);
		playerSessions.lastStateChange = data[1];
		playerSessions[userName].latestIdentity = data[5];
		idToPlayerNameMap[data[5]]=userName;
	}

	if(JoinRequestRegex.test(msg))
	{
		console.log("Received join request!");
		let data = JoinRequestRegex.exec(msg);
		let userName = data[3];
		if(!playerSessions[userName])
		{
			playerSessions[userName] = new SatisfactoryUser(userName);
		}
		console.log(`User '${userName}' is joining!`);
		playerSessions.lastStateChange = data[1];
		playerSessions.online = false;
	}

	if(JoinSucceededRegex.test(msg))
	{
		console.log("Someone joined successfully!");
		let data = JoinSucceededRegex.exec(msg);
		let userName = data[3];
		if(!playerSessions[userName])
		{
			playerSessions[userName] = new SatisfactoryUser(userName);
		}
		playerSessions.lastStateChange = data[1];
		playerSessions.online = true;
		console.log(`User '${userName}' is online!`);
		await axios.post(process.env.DISCORD_WEBHOOK,{
			...baseWebhook,
			...Messages.PlayerJoined(userName,playerCount(),MAX_PLAYER_COUNT)
		});
	}

	if(ConnectionClosedRegex.test(msg))
	{
		console.log("Someone left!");
		let data = ConnectionClosedRegex.exec(msg);
		let userName = idToPlayerNameMap[data[3]];
		if(userName !== undefined)
		{
			if(!playerSessions[userName])
			{
				playerSessions[userName] = new SatisfactoryUser(userName);
			}
			playerSessions.lastStateChange = data[1];
			playerSessions.online = false;
			console.log(`User '${userName}' is offline!`);
			await axios.post(process.env.DISCORD_WEBHOOK,{
				...baseWebhook,
				...Messages.PlayerLeft(userName,playerCount(),MAX_PLAYER_COUNT)
			});
		} else {
			await axios.post(process.env.DISCORD_WEBHOOK,{
				...baseWebhook,
				...Messages.GenericPlayerLeft(playerCount(),MAX_PLAYER_COUNT)
			});
		}
	}
});

socket.once("open",()=>{
	socket.send("send logs",null);
});