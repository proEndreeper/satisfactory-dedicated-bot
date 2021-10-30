class SatisfactoryUser
{
	reference;
	joinRequestId;
	name;
	identity = "(???)Unknown";
	lastStateChange = "never";
	entryTicket = null;
	online = false;

	constructor(name)
	{
		this.name = name;
	}
}

module.exports = {SatisfactoryUser};