var dal         				= require('../data_access/dal');
var authenticate         		= require('./authenticate');

var methods = {};



methods.getConversationsByUser = function(request, response, connection)
{
	function afterCheckTokenCallback(internalUserId)
	{
		var providedUserId = request.params.userId;
		var conversationsArray = [];
		
		function get_conversation_by_iD_callback(err, rows, fields)
		{
			if (err)
			{
				console.log(err);
				response.status(500).send({success: false, msg: 'Internal error.'});
			}
			else
			{
				//Each of these results represents a recipient in a conversation.
				//Loop through the results and pick out the records that represent other users. These represent the current user's "conversation partners".
				for (var i in rows) 
				{
					if(rows[i].internalUserId !== internalUserId)
					{
						conversationsArray.push({conversationId: rows[i].conversationId, conversationPartner: rows[i].nickname});
					}
					
				}
				
				//TODO: continue working here
				response.json(conversationsArray);
			}
			
		}
		
		function get_conversations_by_internalUserId_callback(err, rows, fields)
		{
			if (err)
			{
				console.log(err);
				response.status(500).send({success: false, msg: 'Internal error.'});
			}
			else
			{
				//Loop through the results to get the ID of each conversation that this user is part of.
				var tempConversationArray = [];
				for (var i in rows) 
				{
					tempConversationArray.push(rows[i].conversationId);
				}
				
				//Pass this array of conversation IDs to the data access layer to get the recipients of each conversation.
				dal.get_conversation_by_iD(connection, get_conversation_by_iD_callback, tempConversationArray)
			}
		}
		
		//First, get the specified conversation and ensure that this user is part of that conversation.
		dal.get_conversations_by_internalUserId(connection, get_conversations_by_internalUserId_callback, providedUserId);
	}
	
	authenticate.checkToken(request, response, afterCheckTokenCallback);
}

methods.sendMessage = function(request, response, connection)
{
	function afterCheckTokenCallback(internalUserId)
	{
		//Get the parameters from the body of the HTTP POST message
		var providedConversationId = request.body.conversationId;
		var providedMessage = request.body.message;
		
		//Declare variables that will be set and used throughout this request.
		var recipient;
		
		function insert_Message_callback(err,result)
		{
			if (err) 
			{
				console.log(err);
				response.status(500).send({success: false, msg: 'Internal error.'});
			}
			else
			{
				//Successfully sent the message
				response.send({success: true, msg: 'Your message has been sent.', messageId: result.insertId});
			}
		}
		
		function insertMessage()
		{
			dal.insert_Message(connection, insert_Message_callback, recipient, internalUserId, providedMessage, providedConversationId);
		}
		
		function get_conversation_by_iD_callback(err, rows, fields)
		{
			if (err)
			{
				console.log(err);
				response.status(500).send({success: false, msg: 'Internal error.'});
			}
			else if(rows.length === 0)
			{ 
				response.status(500).send({success: false, msg: 'This conversation does not exist.'});
			}
			else
			{
				//The conversation exists, so there should be two rows returned.
				//Check to make sure that one of these two rows represents the sender.
				if(rows[0].internalUserId === internalUserId || rows[1].internalUserId === internalUserId)
				{
					//We've verified that the specified conversation exists and this user has access to it.
					//Next, we need to identify the recipient.
					if(rows[0].internalUserId === internalUserId)
					{
						recipient = rows[1].internalUserId;
					}
					else
					{
						recipient = rows[0].internalUserId;
					}
					//Next, we need to insert the message.
					insertMessage();
				}
				else
				{
					response.status(403).send({success: false, msg: 'This user does not have access to this conversation.'});
				}
			}
		}
		
		//First, get the specified conversation and ensure that this user is part of that conversation.
		dal.get_conversation_by_iD(connection, get_conversation_by_iD_callback, providedConversationId);
	}
	
	authenticate.checkToken(request, response, afterCheckTokenCallback);
}



module.exports = methods;