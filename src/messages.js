module.exports = {
	ServerStatus: (status,old_status) => {
		let action = status == old_status ? "currently" : "now";
		switch(status)
		{
			case "running":
				return {
					content: `The dedicated server is ${action} running!`
				}
			case "stopping":
				return {
					content: `The dedicated server is ${action} stopping!`
				}
			case "offline":
				return {
					content: `The dedicated server is ${action} offline!`
				}
			case "starting":
				return {
					content: `The dedicated server is ${action} starting!`
				}
			default:
				return {
					content: `The dedicated server is in an unknown state, please contact an admin.`
				}
		}
	},
	CurrentVersion: (satisfactoryVersion) => {
		return {
			content: `The dedicated server supports CL version ${satisfactoryVersion}`
		};
	},
	PlayerJoined: (userName,playerCount,maxPlayerCount) => {
		return {
			content: `User '${userName}' has joined.
There are now ${playerCount}/${maxPlayerCount} players online.`
		};
	},
	GenericPlayerLeft: (playerCount,maxPlayerCount) => {
		return {
			content: `A user has left the game.
There are now ${playerCount}/${maxPlayerCount} players online.`
		};
	},
	PlayerLeft: (userName,playerCount,maxPlayerCount) => {
		return {
			content: `User '${userName}' has left the game.
There are now ${playerCount}/${maxPlayerCount} players online.`
		};
	}
}