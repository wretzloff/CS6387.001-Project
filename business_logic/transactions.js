var authenticate         		= require('./authenticate');

var methods = {};

methods.getTransactionsByUser = function(request, response, connection)
{
	function getPendingTransactionsCallbackFunction(internalUserId)
	{
		//Insert code here to select all Transactions for this internalUserId where the transaction status is 0 (for Pending).
		//Join the Transaction table to the ForSale table to get information about the book being bought/sold, like the book title, author, price, etc.
		var transactionsArray = [];
		transactionsArray.push({iD: '3', buyerOrSeller: 'seller', buyer_Nickname: 'Daren C', buyer_InternalUserId: '2', transactionDateTime: '2017-02-22 00:02:40', title: 'Software Engineering for Dummies', author: 'Wallace Wang', ISBN: '9780470108543', price: '32.67'});
		transactionsArray.push({iD: '8', buyerOrSeller: 'buyer', seller_Nickname: 'Jonathan R', seller_InternalUserId: '5', transactionDateTime: '2017-02-24 00:07:41', title: 'Intermediate Algebra', author: 'Alan S. Tussy', ISBN: '9781111567675', price: '88.00'});
		response.send(transactionsArray);
	}
	
	authenticate.checkToken(request, response, getPendingTransactionsCallbackFunction);
}



module.exports = methods;