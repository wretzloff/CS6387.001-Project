var jwt         		= require('jwt-simple');

var dal         		= require('../data_access/dal');
var authenticationSecret 		= 'thisIsASecretKeyThatWillPickedRandomly';

var methods = {};

methods.checkToken = function(request, response, callbackFunction)
{
	//First, check that the token was provided.
	var token = getToken(request.headers);
	if (token) 
	{
		var internalUserId;
		try
		{
			//Second, decode the token to get the internalUserId that it encodes.
			internalUserId = jwt.decode(token, authenticationSecret);
			console.log('internalUserId: ' + internalUserId);
		}
		catch(err)
		{
			return response.status(401).send({success: false, msg: 'Token could not be authenticated: ' + token});
		}
		
		//If we've successfully gotten the internalUserId, then this request is authenticated.
		//Pass the internalUserId into the callback function to perform the business logic.
		callbackFunction(internalUserId);
	}
	else
	{
		return response.status(401).send({success: false, msg: 'No token provided.'});
	}
}

methods.issueToken = function(request, response, connection)
{
	//Get the parameters from the request body
	var username = request.body.username;
	var password = request.body.password;
	
	//If username and password were provided
	if (username) 
	{
		if(password)
		{
			function get_User_by_netId_callback(err, rows, fields)
			{
				if (err)
				{
					response.status(500).send({success: false, msg: 'Internal Server Error. Please try again later.'});
				}
				else
				{
					//If we found a match, the user should be authenticated. Don't worry about a password.
					if(rows.length > 0)
					{
						//Using the internal user ID of the row that was just found, create a token and return it to the client.
						var token = jwt.encode(rows[0].internalUserId, authenticationSecret);
						response.json({success: true, token: 'JWT ' + token, userId: rows[0].internalUserId, userNickname: rows[0].nickname});
					}
					else
					{
						response.status(401).send({success: false, msg: 'Invalid credentials.'});
					}
				}
			}
		
			//Query for a user with a matching netID
			dal.get_User_by_netId(connection, get_User_by_netId_callback, username);			
		}
		else
		{
			response.status(401).send({success: false, msg: 'Authentication failed. No password.'});
		}
	} 
	else 
	{
		response.status(401).send({success: false, msg: 'Authentication failed. No username.'});
	}
}

function getToken(headers) 
{
  if (headers && headers.authorization) 
  {
    var parted = headers.authorization.split(' ');
    if (parted.length === 2) 
	{
      return parted[1];
    } 
	else 
	{
      return null;
    }
  } 
  else 
  {
    return null;
  }
}

module.exports = methods;