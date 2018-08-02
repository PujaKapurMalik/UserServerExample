//  Module dependencies
var express = require('express');    
var http = require('http');
var bodyParser = require('body-parser');
var request = require('request');

// 	Global Vars
var app = express();
var router = express.Router();             
var exceptionCounter = 0;
var users ={list:[]};

//Start the server
startHttpServer();

// Set the name seen for the application in TaskManager
process.title = 'Node.UserServer';

// configure app to use bodyParser()
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Error handler
app.use(function(err, req, res, next) {
	console.log('** Express ERROR:  ' + err);
})

router.use(function(req, res, next) {
    next(); 
});

//Home url
router.get('/', function(req, res) {
	res.json({ message: ' Welcome to the api!' }); 
});

/*
*GET /users
*POST /users
*/
router.route('/users')
		.get(function(req, res) {
		   sendResponse(res,createResponse,'get');
		})
		.post(function(req, res) {
			sendResponse(res,createResponse,'post');
		});

//GET /users/firstname/:firstname
router.route('/users/firstname/:firstname')
		.get(function(req, res) {
			for(let i=users.list.length-1;i>=0;i--){
				console.log(users.list[i].firstname);
				console.log(req.params.firstname);
				if(users.list[i].firstname==req.params.firstname){
					console.log(users.list[i]);
					return res.json({list:users.list[i]});
				}
			}
			console.log(req.params.firstname);
			res.writeHead(404, 'User not found!');
			res.end();
		});		
	
//////////////////////////////////////////////////////////////////////////////////////
//	sendResponse()
//  Function to call the url https://randomuser.me/api to get 10 user records
//  and then call the callback function to generate the response
//////////////////////////////////////////////////////////////////////////////////////
function sendResponse(res,callback,method){
	try {	
		var addUsers ={list:[]}
		for(let i=0 ;i<=10;i++){
			var userRequest=request.get("https://randomuser.me/api", function(error, response, body){
					if(error) {
						res.send(error);
					}
					var ans = JSON.parse(body);			
					var fetchUser=  {
					gender: ans.results[0].gender,
					firstname: ans.results[0].name.first,
					city: ans.results[0].location.city,
					email: ans.results[0].email,
					cell: ans.results[0].cell
				  }
				  
				  addUsers.list.push(fetchUser);
				  if(i==10){
					  callback(res,addUsers,method)
				  }					
				}); 
			}
	}catch(e){
		// Exception  ...
		console.log('sendResponse Exception: ' + e.name);
		exceptionCounter++;	
	}

}

//////////////////////////////////////////////////////////////////////////////////////
//  createResponse() 
//  CallBack function
//////////////////////////////////////////////////////////////////////////////////////
function createResponse(res,addUsers,method){
	if(method === 'get'){
		users = addUsers;
		res.json(addUsers);
		res.end();
	}else{
		users = addUsers;		
		res.writeHead(201, 'User successfully created!');
		res.end();	
	}
}

app.use('/api', router);


//////////////////////////////////////////////////////////////////////////////////////
//  startHttpServer
//////////////////////////////////////////////////////////////////////////////////////
function startHttpServer() {
	try {		
		var port = process.env.PORT || 8080;  
		app.listen(port);	
		console.log('startHttpServer port: ' + port);		
	} catch(e) {
		// Exception  ...
		console.log('startHttpServer Exception: ' + e.name);
		exceptionCounter++;
	};
};


