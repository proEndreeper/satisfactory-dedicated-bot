const debug = require("debug")("module-players");
const {SatisfactoryUser} = require("../satisfactoryuser.js");

// Example console output
// [2021.10.30-15.50.44:591][814]LogNet: Login request: ?EntryTicket=02F0C2C307BD9BD90881000000444438394645453545373344433037353443313541454334443246413842363835453135353637363139363732413632464131463944433036354339444643383630433938313431323032353141413134444646333033323441394643353738314441373137343043464538353030323542393737463636334630373435323100?Name=ProEndreeper userId: EOS:(EOS)da21156065214ad2b88e11faa3aaf8ad|0002980975ae485792f027a86999e38a platform: EOS
const LoginRequestRegex = /^\[([^\]]+)\]\[([^\]]+)\]LogNet: Login request: \?EntryTicket=([0-9A-F]+)\?Name=(.+) userId: (.+):(\(EOS\)[0-9a-f]+\|[0-9a-f]+|\(STEAM\)[0-9]+) platform: (.+)/;

module.exports = async (msg, socket, moduleData) => {
	if(!LoginRequestRegex.test(msg)) return;

	let data = LoginRequestRegex.exec(msg);
	let entryTicket = data[3]
	let userName = data[4];
	let uniqueIdentity = data[6];

	debug(`New login request from [${uniqueIdentity}] with username |${userName}|.`)

	let player;
	let playerRef = moduleData.identityToPlayerRefMap.get(uniqueIdentity);

	if(playerRef === undefined)
	{
		player = new SatisfactoryUser(userName);
		playerRef = moduleData.playerSessions.push(player)-1;
		moduleData.identityToPlayerRefMap.set(uniqueIdentity, playerRef);
		player.reference = playerRef;
	}

	debug(`[${uniqueIdentity}]'s player reference is #${playerRef}.`);

	player = moduleData.playerSessions[playerRef];

	if(!(player instanceof SatisfactoryUser))
	{
		debug("Failed to find player session, did something break?");
		return;
	}

	player.lastStateChange = data[1];
	player.identity = uniqueIdentity;
	player.entryTicket = entryTicket;

	socket.emit("player login",{
		player
	});
}