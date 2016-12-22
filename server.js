
var fs = require('fs');
var path = require('path');



/************************************** this two are the certificates required for making the Http connection secure i.e. Https**********/
var options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};
/***************************************************************************************************************************************/



/*********************************This Part create a Https Server which listen at the port number 8000***************************/
var httpServer = require('https').createServer(options, function(request, response) {
        if(request.url != ''){
            var filePath = '.' + request.url;
            if (filePath == './'){filePath = './.html';} 
            var filename = path.basename(filePath);
            var extname = path.extname(filePath);
            var contentType = 'text/html';
            fs.readFile(filePath, function(error, content) {
                response.writeHead(200, {"Content-Type": "text/html; charset=utf-8"});;
                response.end(content, 'utf-8');
            });
        }
    }).listen(7000);
/***********************************************************************************************************************************/



//require our websocket library
var WebSocketServer = require('wss').Server;
//creating a websocket server at port 9090
var wss = new WebSocketServer({server:httpServer});
//all connected to the server users
var users = {};
var logs = [];
var chatLogs = [];
var audioLogs= [];
var connectedChat = [];
var connectedAudio = [];

wss.on('connection', function(connection){
console.log("User connected");
//when server gets a message from a connected user
connection.on('message', function(message){
var data;
//accepting only JSON messages
	try {
		data = JSON.parse(message);
		} catch (e) {
		console.log("Invalid JSON");
		data = {};
	}
//switching type of the user message
switch (data.type){

/*******************************************************Login Module (when a user tries to login)****************************************/
	case "login":
    		console.log("User logged", data.name);
    
    		//if anyone is logged in with this username then refuse
    		if(users[data.name]){
        		sendTo(connection, {
            			type: "login",
            			success: false
            			});
        		delete users[data.name];
            		} 
		else {								//save user connection on the server
        		logs.push(data.name);
        		users[data.name] = connection;
        		connection.name = data.name;
        		sendTo(connection, {
            			type: "login",
            			success: true,
            			});
			console.log(logs);
			for(var i=0;i<logs.length;i++)
        			{		
				var conn=users[logs[i]];
				if(conn!=null)
					{
					sendTo(conn,{
				type: "chatmain",
				data: chatLogs
				});
				sendTo(conn,{
				type: "audiomain",
				data: audioLogs
					});
					}	
				}
        		
			}
	break;

/***********************************************************************************************************************************/

/*****************************************************Offer Module*****************************************************************/
	case "offer1":
	//for ex. UserA wants to call UserB
	console.log("Sending offer to: ", data.name);
	//if UserB exists then send him offer details
	var conn = users[data.name];
	if(conn !=null)
		{
		//setting that UserA connected with UserB
		connection.otherName = data.name;
		console.log("soumya "+data.offer);
		sendTo(conn, {
			type: "offer1",
			offer: data.offer,
			name: connection.name
			});
		}		
	break;

case "offer2":
	//for ex. UserA wants to call UserB
	console.log("Sending offer to: ", data.name);
	//if UserB exists then send him offer details
	var conn = users[data.name];
	if(conn !=null)
		{
		//setting that UserA connected with UserB
		connection.otherName = data.name;
		console.log("soumya "+data.offer);
		sendTo(conn, {
			type: "offer2",
			offer: data.offer,
			name: connection.name
			});
		}		
	break;

/**************************************************************************************************************************************/

/*******************************************************Answer Module******************************************************************/
	case "answer1":
	console.log("Sending answer to: ", data.name);
	//for ex. UserB answers UserA
	var conn = users[data.name];
	if(conn != null){
		connection.otherName = data.name;
		sendTo(conn, {
			type: "answer1",
			answer: data.answer
			});
			}		
	break;
	
case "answer2":
	console.log("Sending answer to: ", data.name);
	//for ex. UserB answers UserA
	var conn = users[data.name];
	if(conn != null){
		connection.otherName = data.name;
		sendTo(conn, {
			type: "answer2",
			answer: data.answer
			});
			}		
	break;
/****************************************************************************************************************************************/

/*********************************************************Candidate Module***************************************************************/
	case "candidate":
	console.log("Sending candidate to:",data.name);
	var conn = users[data.name];
	if(conn != null){
		sendTo(conn, {
		type: "candidate",
		candidate: data.candidate
		});
		}
	break;

/*****************************************************************************************************************************************/

/**********************************************************Leave Module*******************************************************************/
    	case "leave":
        
        for(var i = logs.length - 1; i >= 0; i--) // For deleting the name of dissconnected user from login Members
		{
            		if(logs[i] === data.name) {
            		logs.splice(i, 1);
        			}
        	}	
        sendUpdateLog();
        
        var conn = users[data.name];					
 	if(conn != null){     			 //notify the other user so he can disconnect his peer connection
            sendTo(conn, {
            type: "leave"
            });
        }
        delete users[data.name];
        break;
/*****************************************************************Leave Audio*************************************************************/
        case "leaveAudio":
	
	 for(var i = audioLogs.length - 1; i >= 0; i--) // For deleting the name of dissconnected user from login Members
		{
            		if(audioLogs[i] === data.name) {
            		audioLogs.splice(i, 1);
        			}
			if(logs[i] === data.name) {
            		logs.splice(i, 1);
        			}
        	}		
        sendUpdateLogAudio();
        
        var conn = users[data.name];					
 	if(conn != null){     			 //notify the other user so he can disconnect his peer connection
            sendTo(conn, {
            type: "leave"
            });
        }
        delete users[data.name];
        break;

/********************************************************************Leave Chat**********************************************************/
case "leaveChat":
	
	 for(var i = chatLogs.length - 1; i >= 0; i--) // For deleting the name of dissconnected user from login Members
		{
            		if(chatLogs[i] === data.name) {
            		chatLogs.splice(i, 1);
        			}
			if(logs[i] === data.name) {
            		logs.splice(i, 1);
        			}
        	}	
        sendUpdateLogChat();
        
        var conn = users[data.name];					
 	if(conn != null){     			 //notify the other user so he can disconnect his peer connection
            sendTo(conn, {
            type: "leave"
            });
        }
        delete users[data.name];
        break;

/**********************************************************************************************************************************/
	case "reject":
		var conn = users[data.name];
		sendTo(conn,{
		type: "reject"
		});
	break;

	case "chat":
		chatLogs.push(data.name);
		 sendUpdateLogChat();
		for(var i=0;i<logs.length;i++)
        			{		
				var conn=users[logs[i]];
				if(conn!=null)
					{
					sendTo(conn,{
					type: "connectedUser",
					data: connectedChat
					});
					}	
				}
		break;

	case "audio":
		audioLogs.push(data.name);
		 sendUpdateLogAudio();	
	for(var i=0;i<logs.length;i++)
        			{		
				var conn=users[logs[i]];
				if(conn!=null)
					{
					sendTo(conn,{
					type: "connectedAudio",
					data: connectedAudio
					});
					}	
				}
		break;

	case "leaveBackChat":
		for(var i = chatLogs.length - 1; i >= 0; i--) // For deleting the name of dissconnected user from login Members
		{
            		if(chatLogs[i] === data.name) {
            		chatLogs.splice(i, 1);
        			}
		}
	for(var i = connectedChat.length - 1; i >= 0; i--) // For deleting the name of dissconnected user from login Members
		{
            		if(connectedChat[i] === data.name) {
            		connectedChat.splice(i, 1);
        			}
		}
		for(var i=0;i<logs.length;i++)
        			{		
				var conn=users[logs[i]];
				if(conn!=null)
					{
					sendTo(conn,{
				type: "chatmain",
				data: chatLogs
					});
					sendTo(conn,{
				type: "chat",
				data: chatLogs
					});
					sendTo(conn,{
				type: "connectedUser",
				data: connectedChat
					});
					}
				}
		break;
	case "errorChat":
		console.log(data.name);
		var conn=users[data.name];
		if(conn!=null)
					{
					sendTo(conn,{
				type: "errorChat",
					});
					}
	break;
		
/**************************************************************************************************************************************/
		case "leaveBackAudio":
		for(var i = audioLogs.length - 1; i >= 0; i--) // For deleting the name of dissconnected user from login Members
		{
            		if(audioLogs[i] === data.name) {
            		audioLogs.splice(i, 1);
        			}
		}
		for(var i = connectedAudio.length - 1; i >= 0; i--) // For deleting the name of dissconnected user from login Members
		{
            		if(connectedAudio[i] === data.name) {
            		connectedAudio.splice(i, 1);
        			}
		}
		for(var i=0;i<logs.length;i++)
        			{		
				var conn=users[logs[i]];
				if(conn!=null)
					{
					sendTo(conn,{
				type: "audiomain",
				data: audioLogs
					});
					sendTo(conn,{
				type: "audio",
				data: audioLogs
					});
				sendTo(conn,{
				type: "connectedAudio",
				data: connectedAudio
					});
					}
				}
		break;
	case "errorAudio":
		console.log(data.name);
		var conn=users[data.name];
		if(conn!=null)
					{
					sendTo(conn,{
				type: "errorAudio",
					});
					}
		break;

	case "connectedUser":
		connectedChat.push(data.name);
		for(var i=0;i<logs.length;i++)
        			{		
				var conn=users[logs[i]];
				if(conn!=null)
					{
					sendTo(conn,{
					type: "connectedUser",
					data: connectedChat
					});
					}	
				}
		break;
	
	case "connectedAudio":
		connectedAudio.push(data.name);
		for(var i=0;i<logs.length;i++)
        			{		
				var conn=users[logs[i]];
				if(conn!=null)
					{
					sendTo(conn,{
					type: "connectedAudio",
					data: connectedAudio
					});
					}	
				}
		break;

/************************************************************************************************************************************/
	default:
		sendTo(connection, {
			type: "error",
			message: "Command not found: " + data.type
			});
	break;
	}
});
/**************************This Module runs when user exits, for example closes a browser window************************************/

connection.on("close", function(){
		if(connection.name){
		delete users[connection.name];
			if(inArray(connection.name,audioLogs)==true)
			{
			for(var i = audioLogs.length - 1; i >= 0; i--) {     // For deleting the name of dissconnected user
            			if(audioLogs[i] === connection.name || audioLogs[i]==connection.otherName) {
            				audioLogs.splice(i, 1);
        				}
					}
		sendUpdateLogAudio();
			}
			if(inArray(connection.name,chatLogs)==true)
			{
			for(var i = chatLogs.length - 1; i >= 0; i--) {     // For deleting the name of dissconnected user
            			if(chatLogs[i] === connection.name || chatLogs[i]==connection.otherName) {
            				chatLogs.splice(i, 1);
        				}
					}
		sendUpdateLogChat();
			}
			if(inArray(connection.name,logs)==true)
			{
			for(var i = logs.length - 1; i >= 0; i--) {     // For deleting the name of dissconnected user
            			if(logs[i] === connection.name || logs[i]==connection.otherName) {
            				logs.splice(i, 1);
        				}
					}
		sendUpdateLog();
			}
		if(connection.otherName){
		console.log("Disconnecting from ", connection.otherName);
		var conn = users[connection.otherName];
		if(conn != null){
			sendTo(conn, {
				type: "leave"
					});
				}			
				}
			}
});
});

/************************************************************************************************************************************/

/*****************************************************Send Function******************************************************************/
function sendTo(connection, message){
	connection.send(JSON.stringify(message));
	}
/************************************************************************************************************************************/

/***************************************************Send Update Log******************************************************************/

function sendUpdateLog()
{
for(var i=0;i<logs.length;i++)
        			{		
				var conn=users[logs[i]];
				if(conn!=null)
					{
					sendTo(conn,logs);
					}	
				}
}	

/*************************************************************************************************************************************/
function sendUpdateLogChat()
{
for(var i=0;i<logs.length;i++)
        			{		
				var conn=users[logs[i]];
				if(conn!=null)
					{
					sendTo(conn,{
				type: "chat",
				data: chatLogs
					});
					}	
				}
}
/***************************************************************************************************************************************/

function sendUpdateLogAudio()
{
for(var i=0;i<logs.length;i++)
        			{		
				var conn=users[logs[i]];
				if(conn!=null)
					{
					sendTo(conn,{
				type: "audio",
				data: audioLogs
					});
					}	
				}
}
/***************************************************************************************************************************************/
function inArray(needle,haystack)
{
    var count=haystack.length;
    for(var i=0;i<count;i++)
    {
        if(haystack[i]===needle){return true;}
    }
    return false;
}
