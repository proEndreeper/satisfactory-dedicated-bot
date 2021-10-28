class SatisfactoryUser
{
	name;
	identity = "(???)Unknown";
	latestIdentity;
	lastStateChange = "never";
	online = false;

	constructor(name)
	{
		this.name = name;
	}
}

module.exports = {SatisfactoryUser};