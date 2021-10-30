const debug = require("debug")("module-players");
const {SatisfactoryUser} = require("../satisfactoryuser.js");

let MessageReference = 0;

function log(txt)
{
	debug(`[ConnectionClosed-${MessageReference}] ${txt}`)
}
// Example console output
// [2021.10.30-16.24.21:785][ 26]LogNet: UNetConnection::Close: [UNetConnection] RemoteAddr: 63.224.126.162:57725, Name: IpConnection_2147473771, Driver: GameNetDriver EOSNetDriver_2147482351, IsServer: YES, PC: BP_PlayerController_C_2147473585, Owner: BP_PlayerController_C_2147473585, UniqueId: EOS:(EOS)da21156065214ad2b88e11faa3aaf8ad|0002980975ae485792f027a86999e38a, Channels: 937, Time: 2021.10.30-16.24.21
// [2021.10.30-16.26.13:710][357]LogNet: UNetConnection::Close: [UNetConnection] RemoteAddr: 63.224.126.162:52535, Name: IpConnection_2147471174, Driver: GameNetDriver EOSNetDriver_2147482351, IsServer: YES, PC: BP_PlayerController_C_2147471167, Owner: BP_PlayerController_C_2147471167, UniqueId: EOS:(EOS)da21156065214ad2b88e11faa3aaf8ad|0002980975ae485792f027a86999e38a, Channels: 939, Time: 2021.10.30-16.26.13
// [2021.10.30-16.27.47:155][136]LogNet: UNetConnection::Close: [UNetConnection] RemoteAddr: 63.224.126.162:54214, Name: IpConnection_2147469900, Driver: GameNetDriver EOSNetDriver_2147482351, IsServer: YES, PC: BP_PlayerController_C_2147469892, Owner: BP_PlayerController_C_2147469892, UniqueId: EOS:(EOS)da21156065214ad2b88e11faa3aaf8ad|0002980975ae485792f027a86999e38a, Channels: 941, Time: 2021.10.30-16.27.47
const ConnectionClosedRegex = /^\[([^\]]+)\]\[([^\]]+)\]LogNet: UNetConnection::Close: \[UNetConnection\] RemoteAddr: [^,]+, Name: IpConnection_[0-9]+, Driver: [^,]+, IsServer:[^,]+, PC:[^,]+, Owner:[^,]+, UniqueId: [^:]+:([^,]+), Channels: [^,]+, Time: .+$/;

module.exports = async (msg, socket, moduleData) => {
	if(!ConnectionClosedRegex.test(msg)) return;

	log("Someone left!");
	let data = ConnectionClosedRegex.exec(msg);
	let uniqueIdentity = data[3];
	let playerReference = moduleData.identityToPlayerRefMap.get(uniqueIdentity);
	
	if(playerReference === undefined)
	{
		log(`Failed to find a player reference for unique identity '${uniqueIdentity}', potentially player has not been seen yet since bot started?`);
		MessageReference++;
		return;
	}

	let player = moduleData.playerSessions[playerReference];

	if(!(player instanceof SatisfactoryUser))
	{
		log("Failed to find player session, did something break?");
		MessageReference++;
		return;
	}

	player.lastStateChange = data[1];
	player.online = false;
	log(`User '${player.name}' is offline!`);

	socket.emit("player leave",{
		player
	});

	MessageReference++;
}