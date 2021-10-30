const {PluginTypeLoaderBase} = require('plugnplay');

module.exports = class BaseModuleLoader extends PluginTypeLoaderBase {
	definePluginProperties()
	{
		return ["setupSocketListeners", "globFunctions"];
	}
}