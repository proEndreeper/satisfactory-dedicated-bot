const LIST_SEPARATOR = "\n";

module.exports = {
	ServerStatus: (status,old_status) => {
		let action = status == old_status ? "currently" : "now";
		switch(status)
		{
			case "running":
				return {
					embeds: [
						{
							color: 0x00FF00,
							description: `The dedicated server is ${action} online!`
						}
					]
				}
			case "stopping":
				return {
					embeds: [
						{
							color: 0xFFA500,
							description: `The dedicated server is ${action} stopping!`
						}
					]
				}
			case "offline":
				return {
					embeds: [
						{
							color: 0xFF0000,
							description: `The dedicated server is ${action} offline!`
						}
					]
				}
			case "starting":
				return {
					embeds: [
						{
							color: 0xFFFF00,
							description: `The dedicated server is ${action} starting!`
						}
					]
				}
			default:
				return {
					content: `The dedicated server is in an unknown state, please contact an admin.`
				}
		}
	},
	CurrentVersion: (satisfactoryVersion) => {
		return {
			embeds: [
				{
					description: `The server supports client build ${satisfactoryVersion}`
				}
			]
		};
	},
	PlayerJoined: (userName,statusReport) => {
		return {
			embeds: [
				{
					color: 0x00FF00,
					description: `User '${userName}' has joined the game.`,
					fields: [
						{
							name: `Online Players (${statusReport.onlineCount}/${statusReport.maxCount})`,
							value: statusReport.onlineList.join(LIST_SEPARATOR)
						}
					]
				}
			]
		};
	},
	GenericPlayerLeft: (statusReport) => {
		return {
			embeds: [
				{
					color: 0xFF0000,
					description: `A user has left the game.`,
					fields: [
						{
							name: `Online Players (${statusReport.onlineCount}/${statusReport.maxCount})`,
							value: statusReport.onlineList.join(LIST_SEPARATOR)
						}
					]
				}
			]
		};
	},
	PlayerLeft: (userName,statusReport) => {
		return {
			embeds: [
				{
					color: 0xFF0000,
					description: `User '${userName}' has left the game.`,
					fields: [
						{
							name: `Online Players (${statusReport.onlineCount}/${statusReport.maxCount})`,
							value: statusReport.onlineList.join(LIST_SEPARATOR)
						}
					]
				}
			]
		};
	}
}