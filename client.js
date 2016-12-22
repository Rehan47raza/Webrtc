
var name; 
var name1;
var connectedUser=null; 
var logs=[];
var logsAudio=[];
var logsChat=[];
var connectedChat = [];
var connectedCall = [];
var stream;
//connecting to our signaling server.Ip address of the system on which server is running. 
var conn = new WebSocket('wss://172.30.68.157:7000'); 

conn.onopen = function () { 
   console.log("Connected to the signaling server");
};
 
//when we got a message from a signaling server 
conn.onmessage = function (msg) { 
   console.log("Got message", msg.data); 
   var data = JSON.parse(msg.data); 
	
   switch(data.type) { 
      case "login": 
         handleLogin(data.success); 
         break; 
      case "offer1": 
         handleOffer1(data.offer, data.name); 
         break; 
	case "offer2": 
         handleOffer2(data.offer, data.name); 
         break;
      case "answer1": 
         handleAnswer1(data.answer); 
         break; 
	case "answer2": 
         handleAnswer2(data.answer); 
         break; 
      //when a remote peer sends an ice candidate 
      case "candidate": 
         handleCandidate(data.candidate); 
         break; 
      case "leave": 
         handleLeave(); 
         break; 
      case "reject":
	alert("yourcall is rejected.Please try after some time");
	break;
      case "chat":
	
	logsChat=data.data;
	handlelogs(logsChat);
	break;
	case "audio":
	
	logsAudio =data.data;
	console.log(logsAudio);
	handlelogsaudio(logsAudio);
	break;
	case "chatmain":
	document.getElementById("mainchatlist").innerHTML = "";
	console.log(data.data);
	for (var i = 0; i < data.data.length; i++) {
	mainChatList.innerHTML += data.data[i]+ "<br />";
	}
	break;
	case "audiomain":
	document.getElementById("mainaudiolist").innerHTML = "";
	
	for (var i = 0; i < data.data.length; i++) {
	mainAudioList.innerHTML += data.data[i]+ "<br />";
	}
	break;
	case "errorChat":
	chatArea.innerHTML="";
	connectedUser=null;
	loginPage.style.display = "none"; 
	audioPage.style.display = "none";
      callPage.style.display = "none"; 
	mainPage.style.display = "block";
	alert("You are disconnected by the caller");
	break;

	case "errorAudio":
	
	connectedUser=null;
	 yourConn.close();
   	yourConn.onicecandidate = null; 
	yourConn.onaddstream = null;
	loginPage.style.display = "none"; 
	audioPage.style.display = "none";
     callPage.style.display = "none"; 
	mainPage.style.display = "block";
	alert("You are disconnected by the caller");
	break;
	case "connectedUser":
	connectedChat =data.data;
	break;
	case "connectedAudio":
	connectedAudio =data.data;
	break;
     default: 
     break; 
   } 
}; 

conn.onerror = function (err) { 
   console.log("Got error", err); 
}; 
// display the login members for the chat application
function handlelogs(logsChat)
{
document.getElementById("chatlist").innerHTML = "";
document.getElementById("mainchatlist").innerHTML = "";
	for (var i = 0; i < logsChat.length; i++) {
	if(logsChat[i]!=name)
	logArea.innerHTML += logsChat[i]+ "<br />";
	mainChatList.innerHTML += logsChat[i]+ "<br />";
	}
}

//display the audio member for the audio application
function handlelogsaudio(logsAudio)
{
document.getElementById("audiolist").innerHTML = "";
document.getElementById("mainaudiolist").innerHTML = "";
	for (var i = 0; i < logsAudio.length; i++) {
	if(logsAudio[i]!=name)
	logAreaAudio.innerHTML += logsAudio[i]+ "<br />";
	mainAudioList.innerHTML +=logsAudio[i]+ "<br />";
	}
}

//alias for sending JSON encoded messages 
function send(message) { 

   //attach the other peer username to our messages
   if (connectedUser) { 
      message.name = connectedUser; 
   } 
//Converts an object into a string and send.
// Parameter : message	
   conn.send(JSON.stringify(message)); 
};
//Send1 method is called when a user clicks hang up button to send its name to the server
function send1(message) { 

   //attach the own peer username to our messages
      message.name = name; 
	
   conn.send(JSON.stringify(message)); 
};
 
//*****************************************************************************************************************************************
//							UI selectors block 
//***************************************************************************************************************************************** 

var loginPage = document.querySelector('#loginPage'); 
var usernameInput = document.querySelector('#usernameInput'); 
var loginBtn = document.querySelector('#loginBtn'); 
var call1Btn = document.querySelector('#call');
var callPage = document.querySelector('#callPage'); 
var audioPage = document.querySelector('#audioPage');
var callToUsernameInput = document.querySelector('#callToUsernameInput');
var callToUsernameInputAudio = document.querySelector('#callToUsernameInput1');///////////////edit///////////
var callBtn = document.querySelector('#callBtn'); 
var chatBtn = document.querySelector('#chatBtn');
var mainPage = document.querySelector('#mainPage');
var audioBtn = document.querySelector('#audioBtn');
var hangUpBtn = document.querySelector('#hangUpBtn'); 
var localAudio = document.querySelector('#localAudio');
var remoteAudio = document.querySelector('#remoteAudio');
var chatArea = document.querySelector('#chatarea');
var logArea = document.querySelector('#chatlist');
var logAreaAudio = document.querySelector('#audiolist');
var sendMsgBtn = document.querySelector('#sendMsgBtn');
var msgInput = document.querySelector('#msgInput');
var callBtnAudio = document.querySelector('#callBtn1'); 
var hangUpBtnAudio = document.querySelector('#hangUpBtn1'); 
var mainChatList = document.querySelector('#mainchatlist');
var mainAudioList = document.querySelector('#mainaudiolist');
var mainLoginList = document.querySelector('#mainloginmember');
var backCall = document.querySelector('#backCall');
var backCallAudio=document.querySelector('#backCallAudio');
var LogOutMain = document.querySelector('#LogOutMain');
var yourConn; 
var stream; 
var PeerConnection = window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
var IceCandidate = window.mozRTCIceCandidate || window.RTCIceCandidate;
var SessionDescription = window.mozRTCSessionDescription || window.RTCSessionDescription;
window.URL = window.URL || window.mozURL || window.webkitURL;
callPage.style.display = "none"; 
mainPage.style.display = "none";
audioPage.style.display = "none";
loginPage.style.display = "block"

/***************************************************************************************************************************************/
//							Module for Login
/****************************************************************************************************************************************/
/*Login when the user press enter key 
  		Input - user name
*/

/* addEventListener() : Add an event listener that fires when a user clicks a button
   Parameter :  event type, listener (The object that receives a notification when an event of the specified type occurs)simply a 			JavaScript function.    
*/
document.getElementById("usernameInput").addEventListener("keyup", function(event) {
    event.preventDefault();
    if (event.keyCode == 13) {
        document.getElementById("loginBtn").click();
    }
});

/*Login when the user press the button 
  Input - user name
*/
loginBtn.addEventListener("click", function (event) { 
   name = usernameInput.value; 
  name1=name;
if(name.length > 0)
{
   if ( isNaN(name)) { 
	if(name.match(/[_\W0-9]/)){
          alert("Special character is not allowed !!!!!!!");}
        else{
      send({ 
         type: "login", 
         name: name 
      }); 
   } }
 else {alert("Numbers are not allowed") }
}
else
{
alert("give a user name first");
}
	usernameInput.value="";
});
//handleLogin check the status of user if it is true , mainPage is display
/*	If the login is successful, 
	we show the mainPage and starting to set up a peer connection.*/

function handleLogin(success) { 

   if (success === false) {
      	alert("Ooops...try a different username"); 
  	 } 
  else { 
     	loginPage.style.display = "none"; 
	audioPage.style.display = "none";
      	callPage.style.display = "none"; 
	mainPage.style.display = "block";
		
   }
};
/**************************************************************************************** *************************************************/
//							Module for Chat 
/******************************************************************************************************************************************/
 /* when user clicks on the chat button , callPage is display*/

chatBtn.addEventListener("click", function(event) {
	loginPage.style.display = "none";
    	mainPage.style.display="none";
     	audioPage.style.display="none";
    	callPage.style.display="block";

//*****************Starting a peer Connection *******************/       

/*configuration - defines a set of parameters to configure how the peer to peer communication established 
	parameter: iceServers
	iceServers : It is an array of URL objects containing  information  about  STUN  and  TURN  servers,  used  during  the  			     finding  of  the  ICE candidates.  */
	var configuration = { 
         "iceServers": [{ "url": "stun:stun2.1.google.com:19302" }] 
      }; 
      send1({ ///////////////////////////////////edit////////////////////////
         type: "chat", 
         name: name 
      }); 

		
      yourConn = new PeerConnection(configuration); 
	 yourConn.onicecandidate = function (event) { 		// Setup ice handling 
         if (event.candidate) { 				//when the browser finds an ice candidate we send it to another peer

            send({ 
               type: "candidate", 
               candidate: event.candidate 
           }); 
         } 
      }; 
		
/*********creating data channel**********/ 
/*Creates a new RTCDataChannel object .
	*/
      dataChannel = yourConn.createDataChannel("channel1", {reliable:true}); 
      yourConn.ondatachannel = event => dataChannel= event.channel;
	
      dataChannel.onerror = function (error) { 
         console.log("Ooops...error:", error); 
      }; 
      dataChannel.onmessage = function (event) { 

         chatArea.innerHTML += connectedUser + ": " + event.data + "<br />"; 
		};
     
		
      dataChannel.onclose = function () { 		   //datachannel is closed	
         console.log("data channel is closed"); 
      };
		
    });
/************************************************ Chat Module End*************************************************************************/

/*****************************************************************************************************************************************/
//							module for audio
/*****************************************************************************************************************************************/
 /* when user clicks on the chat button ,
	 audioPage is display*/

audioBtn.addEventListener("click", function(event) {
		mainPage.style.display="none";
    		callPage.style.display ="none";
     		loginPage.style.display = "none";
    		audioPage.style.display="block";
/*Starting a peer connection
  	The navigator interface represents the state and the identity of the user agent.*/
    
	navigator.getUserMedia = navigator.getUserMedia ||navigator.webkitGetUserMedia ||navigator.mozGetUserMedia;
	navigator.getUserMedia({ video: false, audio: true }, function (myStream) {
	stream = myStream;
	localAudio.src = window.URL.createObjectURL(stream);  	//displaying local audio stream on the page
	
      	var configuration = { "iceServers": [{ "url": "stun:stun2.1.google.com:19302" }] }; 
		
      	yourConn = new webkitRTCPeerConnection(configuration); 
	send1({ 
         type: "audio", 
         name: name 
      }); 
	yourConn.addStream(stream);
	yourConn.onaddstream = function(e) {			
		remoteAudio.src = window.URL.createObjectURL(e.stream);
			};	
      	
     	yourConn.onicecandidate = function (event) {		// Setup ice handling 
		if (event.candidate) {
			send({
				type: "candidate",
				candidate: event.candidate
				});
				}
				};
			}, function (error) {
		console.log(error);
			});
	
	});
 /***************************************************Audio Module End********************************************************************/
/******************************************************************************************************************************************/



/***************************************************initiating a call*********************************************************************/ 
callBtn.addEventListener("click", function () { 
var callToUsername = callToUsernameInput.value; 
var state = dataChannel.readyState;
console.log(connectedChat);
if(dataChannel.readyState=="open")
{
alert("You are already connected.Please hang up then try to connect");
}
else
{
if(callToUsernameInput.value=="")
alert("first type a name whom you want to call");
else
{
	if(callToUsername==name)
alert("You cannot call yourself");
else
{
if(inArray(callToUsername,logsChat)==false)
alert("Not a login member of chat section. Write the name of a logged in member");
else
{
   if(inArray(callToUsername,connectedChat)==true){

   	alert("Sorry User is busy,Please try after some time");   
  	}
else
{
   if (callToUsername.length > 0) { 
      connectedUser = callToUsername; 
/*  
   creatOffer : create an offer.
   parameter :  successCallback ,failureCallback.
	
*/
      yourConn.createOffer(function (offer) { 
         send({ 
            type: "offer1", 
            offer: offer 
         	}); 
      yourConn.setLocalDescription(offer);
	console.log(offer); 
      	}, function (error) { 
         alert("Error when creating an offer"); 
      		}); 
   	} 
}
}
}
}
}
callToUsernameInput.value="";
});

/*********************************************************Initiating a audio call****************************************************/
callBtnAudio.addEventListener("click", function () { 
if(connectedUser!=null)
alert("you are already connected.First hangup then try to reconnect");
else
{
var callToUsername = callToUsernameInputAudio.value; 
if(callToUsernameInputAudio.value=="")
alert("first type a name whom you want to call");
else
{
if(callToUsername==name)
alert("You cannot call yourself");
else
{
if(inArray(callToUsername,logsAudio)==false)
alert("Not a login member of audio section. Write the name of a logged in member");
else
{
   if(inArray(callToUsername,connectedAudio)==true){

   	alert("Sorry User is busy,Please try after some time");   
  	}
	else
{

   if (callToUsername.length > 0) { 
      connectedUser = callToUsername; 
/*  
   creatOffer : create an offer.
   parameter :  successCallback ,failureCallback.
	
*/
      yourConn.createOffer(function (offer) { 
         send({ 
            type: "offer2", 
            offer: offer 
         	}); 
      yourConn.setLocalDescription(offer);
	console.log(offer); 
      	}, function (error) { 
         alert("Error when creating an offer"); 
      		}); 
   	}
}
}
}
}
}
callToUsernameInputAudio.value="";
});

 
/***************************************when somebody sends us an offer***************************************************************/
/*setRemoteDescription :Changes  the  remote  connection  description. 
			The description defines the properties of the connection. 
			The connection mustbe able to support both old and new descriptions. 
 Parameters :	 RTCSessionDescription object*/

function handleOffer1(offer, name) { 
   connectedUser = name; 
	
 var r=confirm(name + " is calling you. Do you want to accept??");
   if(r== true)
  { 	
   yourConn.setRemoteDescription(new SessionDescription(offer)); 
   //create an answer to an offer setRemoteDescription
   yourConn.createAnswer(function (answer) { 
      yourConn.setLocalDescription(answer); 
      		send({ 
         		type: "answer1", 
         		answer: answer 
      	  }); 
   	}, function (error) { 
      alert("Error when creating an answer"); 
   });
	//connectedChat.push(name1);
	send1({ 
         		type: "connectedUser",  
      	  }); 
}
else
{
send({
	type:"reject",
	});
}		
};
function handleOffer2(offer, name) { 
   connectedUser = name; 
	
 var r=confirm(name + " is calling you. Do you want to accept??");
   if(r== true)
  { 	
   yourConn.setRemoteDescription(new SessionDescription(offer)); 
   //create an answer to an offer setRemoteDescription
   yourConn.createAnswer(function (answer) { 
      yourConn.setLocalDescription(answer); 
      		send({ 
         		type: "answer2", 
         		answer: answer 
      	  }); 
   	}, function (error) { 
      alert("Error when creating an answer"); 
   });
	send1({ 
         		type: "connectedAudio",  
      	  }); 
}
else
{
send({
	type:"reject",
	});
}		
};
 
/*******************************************when we got an answer from a remote user***************************************************/

function handleAnswer1(answer) { 
   yourConn.setRemoteDescription(new SessionDescription(answer)); 
	alert("Your call is accepted");
	send1({ 
         		type: "connectedUser",  
      	  }); 
};
 function handleAnswer2(answer) { 
   yourConn.setRemoteDescription(new SessionDescription(answer)); 
	alert("Your call is accepted");
	send1({ 
         		type: "connectedAudio",  
      	  }); 
};
/*************************************************when we got an ice candidate from a remote user ***************************************/

function handleCandidate(candidate) {
// 
   yourConn.addIceCandidate(new IceCandidate(candidate)); 
};

 /***************************************************************hang up Button *******************************************************/ 
// Connection is disconnect when click on hangUpBtn

hangUpBtn.addEventListener("click", function () { 
console.log(name);
   send({ 
      type: "leaveChat"
	}); 
	send1({ 
      type: "leaveChat"
	});
   handleLeave(); 
}); 

function handleLeave() {
   connectedUser = null; 
   yourConn.close(); 
   yourConn.onicecandidate = null; 
yourConn.onaddstream = null;
 loginPage.style.display = "block";
	audioPage.style.display = "none";
      callPage.style.display = "none"; 
	mainPage.style.display = "none";
location.reload();
};
/*************************************************************************************************************************************/
LogOutMain.addEventListener("click", function () { 
   loginPage.style.display = "block";
	audioPage.style.display = "none";
      callPage.style.display = "none"; 
	mainPage.style.display = "none";
location.reload();
});

backCall.addEventListener("click", function() {
send1({
	 type: "leaveBackChat"
	});
send({
 type: "leaveBackChat"
	});
send({
        type: "errorChat"
	});
	chatArea.innerHTML="";
    handleBack();
});

function handleBack() {
	connectedUser = null; 
   yourConn.close(); 
   yourConn.onicecandidate = null; 
yourConn.onaddstream = null;
 loginPage.style.display = "none";
	audioPage.style.display = "none";
      callPage.style.display = "none"; 
	mainPage.style.display = "block";
}

/************************************************************************************************************************************/

backCallAudio.addEventListener("click", function() {
send1({
	 type: "leaveBackAudio"
	});
send({
 type: "leaveBackAudio"
	});
send({
        type: "errorAudio"
	});
    handleBackAudio();
});

function handleBackAudio() {
	connectedUser = null; 
   yourConn.close();
   yourConn.onicecandidate = null; 
yourConn.onaddstream = null;
	console.log("backing");
 loginPage.style.display = "none";
	audioPage.style.display = "none";
      callPage.style.display = "none"; 
	mainPage.style.display = "block";
}
/********************************************************************************************************************************/
hangUpBtnAudio.addEventListener("click", function () { 
console.log(name);
   send({ 
      type: "leaveAudio"
	}); 
	send1({ 
      type: "leaveAudio"
	});
   handleLeave(); 
}); 

/*********************************************when user clicks the "send message" button**********************************************/
// Message send when user press enter. 
document.querySelector('#msgInput').addEventListener('keyup' , function(event){
    if(event.keyCode == 13){
       document.querySelector('#sendMsgBtn').click()
        
    }   
});
//Message send when user click send button.
sendMsgBtn.addEventListener("click", function (event) { 
   var val = msgInput.value; 
	if(msgInput.value=="")
	alert("write some message first then click send");
	else
{
	var state = dataChannel.readyState;
if(dataChannel.readyState!="open")
{
alert("First connect with a member");
msgInput.value="";
}
else
{
   chatArea.innerHTML += name + ": " + val + "<br />";
	
   msgInput.innerHTML=""; 
   //sending a message to a connected peer 
   dataChannel.send(val); 
   msgInput.value = "";
}
} 
});

/************************************************************END*************************************************************************/

function inArray(needle,haystack)
{
    var count=haystack.length;
    for(var i=0;i<count;i++)
    {
        if(haystack[i]===needle){return true;}
    }
    return false;
}
/**************************************************************************************************************************************/


