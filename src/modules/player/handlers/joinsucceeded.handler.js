const debug = require("debug")("module-players");
const {SatisfactoryUser} = require("../satisfactoryuser.js");

let MessageReference = 0;

function log(txt)
{
	debug(`[JoinSucceeded-${MessageReference}] ${txt}`)
}
// Example console output
// [2021.10.30-15.50.46:530][872]LogNet: Join request: /Game/FactoryGame/Map/DedicatedserverEntry?EntryTicket=02F0C2C307BD9BD90881000000444438394645453545373344433037353443313541454334443246413842363835453135353637363139363732413632464131463944433036354339444643383630433938313431323032353141413134444646333033323441394643353738314441373137343043464538353030323542393737463636334630373435323100?Name=ProEndreeper?SplitscreenCount=1
// -> [2021.10.30-15.50.46:542][872]LogNet: Join succeeded: ProEndreeper
const JoinSucceededRegex = /^\[([^\]]+)\]\[([^\]]+)\]LogNet: Join succeeded: (.+)/;

module.exports = async (msg, socket, moduleData) => {
	if(!JoinSucceededRegex.test(msg)) return;

	log("Someone joined successfully!");
	let data = JoinSucceededRegex.exec(msg);
	let userName = data[3];

	let player = moduleData.playerSessions.filter((player)=>{
		return player.name == userName && 
				player.joinRequestId == data[2];
	})[0];

	if(!(player instanceof SatisfactoryUser))
	{
		log("Failed to determine which user joined successfully.");
		MessageReference++;
		return;
	}

	player.lastStateChange = data[1];
	player.online = true;
	log(`User '${player.name}' is online!`);

	MessageReference++;

	socket.emit("player join",{
		player
	});
}