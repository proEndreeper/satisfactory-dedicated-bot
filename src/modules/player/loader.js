const stripColor = require('strip-color');
const { PluginLoaderBase } = require('plugnplay');
const {SatisfactoryUser} = require("./satisfactoryuser.js");

let socket = null;

let moduleData = {
	playerSessions: new Array(),
	identityToPlayerRefMap: new Map()
};

const loginRequestHandler = require("./handlers/loginrequest.handler");
const joinRequestHandler = require("./handlers/joinrequest.handler");
const joinSucceededHandler = require("./handlers/joinsucceeded.handler");
const connectionClosedHandler = require("./handlers/connectionclosed.handler");

// Example log output for user joining the game
// [2021.10.30-15.50.44:591][814]LogNet: Login request: ?EntryTicket=02F0C2C307BD9BD90881000000444438394645453545373344433037353443313541454334443246413842363835453135353637363139363732413632464131463944433036354339444643383630433938313431323032353141413134444646333033323441394643353738314441373137343043464538353030323542393737463636334630373435323100?Name=ProEndreeper userId: EOS:(EOS)da21156065214ad2b88e11faa3aaf8ad|0002980975ae485792f027a86999e38a platform: EOS
// [2021.10.30-15.50.46:530][872]LogNet: Join request: /Game/FactoryGame/Map/DedicatedserverEntry?EntryTicket=02F0C2C307BD9BD90881000000444438394645453545373344433037353443313541454334443246413842363835453135353637363139363732413632464131463944433036354339444643383630433938313431323032353141413134444646333033323441394643353738314441373137343043464538353030323542393737463636334630373435323100?Name=ProEndreeper?SplitscreenCount=1
// [2021.10.30-15.50.46:542][872]LogNet: Join succeeded: ProEndreeper
// 
// Example log output for EOS user leaving the game through "Exit to main menu"
// [2021.10.30-16.24.21:785][ 26]LogNet: UChannel::CleanUp: ChIndex == 0. Closing connection. [UChannel] ChIndex: 0, Closing: 0 [UNetConnection] RemoteAddr: 63.224.126.162:57725, Name: IpConnection_2147473771, Driver: GameNetDriver EOSNetDriver_2147482351, IsServer: YES, PC: BP_PlayerController_C_2147473585, Owner: BP_PlayerController_C_2147473585, UniqueId: EOS:(EOS)da21156065214ad2b88e11faa3aaf8ad|0002980975ae485792f027a86999e38a
// [2021.10.30-16.24.21:785][ 26]LogNet: UNetConnection::Close: [UNetConnection] RemoteAddr: 63.224.126.162:57725, Name: IpConnection_2147473771, Driver: GameNetDriver EOSNetDriver_2147482351, IsServer: YES, PC: BP_PlayerController_C_2147473585, Owner: BP_PlayerController_C_2147473585, UniqueId: EOS:(EOS)da21156065214ad2b88e11faa3aaf8ad|0002980975ae485792f027a86999e38a, Channels: 937, Time: 2021.10.30-16.24.21
// [2021.10.30-16.24.21:785][ 26]LogNet: UChannel::Close: Sending CloseBunch. ChIndex == 0. Name: [UChannel] ChIndex: 0, Closing: 0 [UNetConnection] RemoteAddr: 63.224.126.162:57725, Name: IpConnection_2147473771, Driver: GameNetDriver EOSNetDriver_2147482351, IsServer: YES, PC: BP_PlayerController_C_2147473585, Owner: BP_PlayerController_C_2147473585, UniqueId: EOS:(EOS)da21156065214ad2b88e11faa3aaf8ad|0002980975ae485792f027a86999e38a
// Example log output for EOS user leaving the game through "Exit to desktop"
// [2021.10.30-16.26.13:710][357]LogNet: UChannel::ReceivedSequencedBunch: Bunch.bClose == true. ChIndex == 0. Calling ConditionalCleanUp.
// [2021.10.30-16.26.13:710][357]LogNet: UChannel::CleanUp: ChIndex == 0. Closing connection. [UChannel] ChIndex: 0, Closing: 0 [UNetConnection] RemoteAddr: 63.224.126.162:52535, Name: IpConnection_2147471174, Driver: GameNetDriver EOSNetDriver_2147482351, IsServer: YES, PC: BP_PlayerController_C_2147471167, Owner: BP_PlayerController_C_2147471167, UniqueId: EOS:(EOS)da21156065214ad2b88e11faa3aaf8ad|0002980975ae485792f027a86999e38a
// [2021.10.30-16.26.13:710][357]LogNet: UNetConnection::Close: [UNetConnection] RemoteAddr: 63.224.126.162:52535, Name: IpConnection_2147471174, Driver: GameNetDriver EOSNetDriver_2147482351, IsServer: YES, PC: BP_PlayerController_C_2147471167, Owner: BP_PlayerController_C_2147471167, UniqueId: EOS:(EOS)da21156065214ad2b88e11faa3aaf8ad|0002980975ae485792f027a86999e38a, Channels: 939, Time: 2021.10.30-16.26.13
// [2021.10.30-16.26.13:710][357]LogNet: UChannel::Close: Sending CloseBunch. ChIndex == 0. Name: [UChannel] ChIndex: 0, Closing: 0 [UNetConnection] RemoteAddr: 63.224.126.162:52535, Name: IpConnection_2147471174, Driver: GameNetDriver EOSNetDriver_2147482351, IsServer: YES, PC: BP_PlayerController_C_2147471167, Owner: BP_PlayerController_C_2147471167, UniqueId: EOS:(EOS)da21156065214ad2b88e11faa3aaf8ad|0002980975ae485792f027a86999e38a
// Example log output for EOS user leaving the game through emulated crash (Alt + F4)
// [2021.10.30-16.27.47:155][136]LogNet: UChannel::CleanUp: ChIndex == 0. Closing connection. [UChannel] ChIndex: 0, Closing: 0 [UNetConnection] RemoteAddr: 63.224.126.162:54214, Name: IpConnection_2147469900, Driver: GameNetDriver EOSNetDriver_2147482351, IsServer: YES, PC: BP_PlayerController_C_2147469892, Owner: BP_PlayerController_C_2147469892, UniqueId: EOS:(EOS)da21156065214ad2b88e11faa3aaf8ad|0002980975ae485792f027a86999e38a
// [2021.10.30-16.27.47:155][136]LogNet: UNetConnection::Close: [UNetConnection] RemoteAddr: 63.224.126.162:54214, Name: IpConnection_2147469900, Driver: GameNetDriver EOSNetDriver_2147482351, IsServer: YES, PC: BP_PlayerController_C_2147469892, Owner: BP_PlayerController_C_2147469892, UniqueId: EOS:(EOS)da21156065214ad2b88e11faa3aaf8ad|0002980975ae485792f027a86999e38a, Channels: 941, Time: 2021.10.30-16.27.47
// [2021.10.30-16.27.47:155][136]LogNet: UChannel::Close: Sending CloseBunch. ChIndex == 0. Name: [UChannel] ChIndex: 0, Closing: 0 [UNetConnection] RemoteAddr: 63.224.126.162:54214, Name: IpConnection_2147469900, Driver: GameNetDriver EOSNetDriver_2147482351, IsServer: YES, PC: BP_PlayerController_C_2147469892, Owner: BP_PlayerController_C_2147469892, UniqueId: EOS:(EOS)da21156065214ad2b88e11faa3aaf8ad|0002980975ae485792f027a86999e38a

async function consoleOutputHandler(msg)
{
	let strippedMessage = stripColor(msg);

	await loginRequestHandler(strippedMessage, socket, moduleData);
	await joinRequestHandler(strippedMessage, socket, moduleData);
	await joinSucceededHandler(strippedMessage, socket, moduleData);
	await connectionClosedHandler(strippedMessage, socket, moduleData);
}

async function setupSocketListeners(pterosocket, botsocket)
{
	pterosocket.on("console output",consoleOutputHandler);

	socket = botsocket;
}

const MAX_PLAYER_COUNT = process.env.MAX_PLAYER_COUNT;

function getPlayerStatusReport()
{
	let statusReport = {
		onlineCount: 0,
		maxCount: MAX_PLAYER_COUNT,
		onlineList: []
	};
	for(var player of moduleData.playerSessions)
	{
		if(player instanceof SatisfactoryUser)
		{
			if(player.online)
			{
				statusReport.onlineCount++;
				statusReport.onlineList.push(player.name);
			}
		}
	}
	return statusReport;
}

module.exports = class PlayerLoader extends PluginLoaderBase {
	export() {
		return Promise.resolve({
			setupSocketListeners: setupSocketListeners,
			globFunctions: {
				getPlayerStatusReport
			}
		});
	}
};