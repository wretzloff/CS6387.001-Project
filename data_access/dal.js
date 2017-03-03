var methods = {};

methods.get_User_by_netId = function(connection, netId, callbackFunction)
{
	connection.query("SELECT * from User where netID = '" + netId + "'", callbackFunction);
}

module.exports = methods;