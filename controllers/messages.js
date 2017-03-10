var dal         				= require('../data_access/dal');
var authenticate         		= require('./authenticate');

var methods = {};



methods.getConversationsByUser = function(request, response, connection)
{
	function afterCheckTokenCallback(internalUserId)
	{
		var providedUserId = request.params.userId;
		var conversationsArray = [];
		
		function sendResponseArray()
		{
			var returnArray = [];
			for (var key in conversationsArray) 
			{
				returnArray.push((conversationsArray[key]));
			}
			response.send(returnArray);
		}
		
		function getLatestMessage()
		{
			var counter = 0;
			for (var key in conversationsArray) 
			{
				dal.get_messages_by_conversationId(connection, function(err, rows, fields){
					if (err)
					{
						console.log(err);
						response.status(500).send({success: false, msg: 'Internal error.'});
					}
					else
					{
						counter++;
						
						//The rows are ordered by date, so we need to get the last message in the list.
						var lastRowIndex = rows.length - 1;
						var conversationIdOfRow = rows[lastRowIndex].conversationId;
						var conversation = conversationsArray[conversationIdOfRow];
						
						conversation.latestMessage = {
							messageId: rows[lastRowIndex].iD,
							messageDateTime: rows[lastRowIndex].messageDateTime,
							messageContent: rows[lastRowIndex].messageContent,
							unread: rows[lastRowIndex].unread
						};
						
						//Once the counter hits the length of the array, we know that we've populated the latest message for 
						//each conversation in the array.
						//Next step is to format the response and send back to client.
						if(counter >= Object.keys(conversationsArray).length)
						{
							sendResponseArray();
						}
					}
				}, key)
			}
		}
		
		function getNumOfUnreadMessages()
		{
			var counter = 0;
			for (var key in conversationsArray) 
			{
				dal.get_unreadMessages_by_conversationIdAndInternalUserId(connection, function(err, rows, fields){
					if (err)
					{
						console.log(err);
						response.status(500).send({success: false, msg: 'Internal error.'});
					}
					else
					{
						counter++;
						var conversationIdOfRow = rows[0].conversationId;
						var numOfUnreadMessagesForThisConversation = rows[0].numUnreadMessages;
						var conversation = conversationsArray[conversationIdOfRow];
						conversation.numOfUnreadMessages = numOfUnreadMessagesForThisConversation;
						
						//Once the counter hits the length of the array, we know that we've populated the number of unread messages for 
						//each conversation in the array.
						//Next step is to get the last message for each conversation.
						if(counter >= Object.keys(conversationsArray).length)
						{
							getLatestMessage();
						}
					}
				}, key, internalUserId)
			}
			
			
		}
		
		function getConversationPartners()
		{
			var counter = 0;
			for (var key in conversationsArray) 
			{
				dal.get_conversation_by_iD(connection, function(err, rows, fields){
					if (err)
					{
						console.log(err);
						response.status(500).send({success: false, msg: 'Internal error.'});
					}
					else
					{
						counter++;
						
						//The "rows" array should contain 2 records, each of which represents an association between a user and a conversation.
						//One of the rows will represent this user, and the other row will represent the other user in the conversation.
						if(rows[0].internalUserId !== internalUserId)
						{
							var conversation = conversationsArray[rows[0].conversationId];
							conversation.conversationPartner = rows[0].nickname;
						}
						else
						{
							var conversation = conversationsArray[rows[1].conversationId];
							conversation.conversationPartner = rows[1].nickname;
						}
						
						//Once the counter hits the length of the array, we know that we've found the conversation partner for 
						//each conversation in the array.
						//Next step is to get the number of unread messages for each conversation.
						if(counter >= Object.keys(conversationsArray).length)
						{
							getNumOfUnreadMessages();
						}	
					}
				}, key)
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
				for (var i in rows) 
				{
					conversationsArray[rows[i].conversationId] = {conversationId: rows[i].conversationId};
				}
				
				//At this point, we have an array of conversation IDs. Next, for each of those conversation IDs, we need to get the user's conversation partner.
				getConversationPartners();
			}
		}
		
		//First, run a query to get the conversation IDs of the conversations that this user is part of.
		dal.get_conversations_by_internalUserId(connection, get_conversations_by_internalUserId_callback, providedUserId);
	}
	
	authenticate.checkToken(request, response, afterCheckTokenCallback);
}

methods.getMessagesBefore = function(request, response, connection)
{
	response.send("under construction");
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