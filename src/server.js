/*
Server Side Public License
VERSION 1, OCTOBER 16, 2018
Copyright AnyWhichWay, LLC 2019
 */

const Schema = require("./schema.js"),
	User = require("./user.js"),
	hashPassword = require("./hash-password.js"),
	Thunderhead = require("./thunderhead.js"),
	dboPassword = require("../dbo.js"),
	secure = require("./secure.js");

let thunderhead;
addEventListener('fetch', event => {
	const request = event.request;
	request.URL = new URL(request.url);
	thunderhead = new Thunderhead({request,namespace:NAMESPACE,dbo: new User("dbo",{"#":"User@dbo",roles:{dbo:true}})});
	event.respondWith(handleRequest({request}));
});

async function handleRequest({request,response}) {
	/*const mail = await fetch("https://api.mailgun.net/v3/mailgun.anywhichway.com/messages", {
	  method: "POST",
	  body:encodeURI(
		"from=Excited User <syblackwell@anywhichway.com>&" +
		"to=syblackwell@anywhichway.com&"+
		"subject=Hello&"+
		"text=Testing some Mailgun awesomeness!"
	  ),
	  headers: {
	    Authorization: "Basic YXBpOmM4MDE0N2UzYjhjOTVlNzQ1MmU1YmE5MjUxMWQ0MGFhLTI5Yjc0ODhmLWQwMzI5YWVh",
	    "Content-Type": "application/x-www-form-urlencoded"
	  }
	}).then(async (response) => `${response.ok} ${response.status} ${JSON.stringify(await response.json())}`)
	.catch((e) => e.message+'Err');
	return new Response(JSON.stringify(mail),{
		headers:
		{
			"Content-Type":"text/plain",
			"Access-Control-Allow-Origin": `"${request.URL.protocol}//${request.URL.hostname}"`
		}
	});*/
	
	let body = "Not Found",
		status = 404;
	if(request.URL.pathname!=="/db.json") {
		return fetch(request);
	}
	if(request.method==="OPTIONS") {
		return new Response(null,{
			headers: {
				"Access-Control-Allow-Origin": "*",
				"Access-Control-Allow-Headers": "X-Auth-Username,X-Auth-Password",
				"Access-Control-Allow-Methods": "GET, OPTIONS"
			}
		})
	}
	try {
		let dbo = await thunderhead.getItem("User@dbo",{user:thunderhead.dbo});
		/*return new Response(JSON.stringify([dbo]),{
			headers:
			{
				"Content-Type":"text/plain",
				"Access-Control-Allow-Origin": `"${request.URL.protocol}//${request.URL.hostname}"`
			}
		});*/
		if(!dbo) {
			Object.assign(thunderhead.dbo,await hashPassword(dboPassword,1000));
			dbo = await thunderhead.putItem(thunderhead.dbo,{user:thunderhead.dbo});
			/*return new Response(JSON.stringify([dbo]),{
				headers:
				{
					"Content-Type":"text/plain",
					"Access-Control-Allow-Origin": `"${request.URL.protocol}//${request.URL.hostname}"`
				}
			});*/
		}
		//let userschema = await thunderhead.getSchema(User);
		//if(!userschema) {
		//const userschema = await thunderhead.putItem(new Schema(User),{user:thunderhead.dbo});
		//}
		body = decodeURIComponent(request.URL.search);
		const command = JSON.parse(body.substring(1)),
			fname = command[0],
			args = command.slice(1);
		/*return new Response(JSON.stringify(fname + " " + thunderhead[fname]),{
			status: 200,
			headers:
			{
				"Content-Type":"text/plain",
				"Access-Control-Allow-Origin": `"${request.URL.protocol}//${request.URL.hostname}"`
			}
		});*/
		/*const value = await NAMESPACE.get(...args)
		  if (value === null) {
		    return new Response("Value not found", {status: 404})
		  }
		  return new Response(JSON.stringify(value));*/
		if(thunderhead[fname]) {
			if(fname==="createUser") {
				args.push({user:thunderhead.dbo});
			} else {
				// add user to request instead of passing in options?
				const userName = request.headers.get("X-Auth-Username"),
					password = request.headers.get("X-Auth-Password"),
					user = await thunderhead.authUser(userName,password,{user:thunderhead.dbo}); // thunderhead.dbo;
				request.user = user;
				if(!user) {
					return new Response("null",{
						status: 403,
						headers:
						{
							"Content-Type":"text/plain",
							"Access-Control-Allow-Origin": `"${request.URL.protocol}//${request.URL.hostname}"`
						}
					});
				}
				//const user = await thunderhead.authUser("dbo","dbo",{user:thunderhead.dbo});
				args.push({user});
			}
			const secured = await secure({key:fname,action:"execute",user:args[args.length-1].user,data:args,request});
			if(!secured.data || secured.removed.length>0) {
				return new Response("null",{
					status: 403,
					headers:
					{
						"Content-Type":"text/plain",
						"Access-Control-Allow-Origin": `"${request.URL.protocol}//${request.URL.hostname}"`
					}
				});
			}
			/*return new Response(JSON.stringify(args),{
				status: 200,
				headers:
				{
					"Content-Type":"text/plain",
					"Access-Control-Allow-Origin": `"${request.URL.protocol}//${request.URL.hostname}"`
				}
			});*/
			/*return new Response(JSON.stringify([fname,...args] + thunderhead[fname]),{
				status: 200,
				headers:
				{
					"Content-Type":"text/plain",
					"Access-Control-Allow-Origin": `"${request.URL.protocol}//${request.URL.hostname}"`
				}
			});*/
			return thunderhead[fname](...args)
			.then((result) => {
				const type = typeof(result);
				if(result===undefined) result = "@undefined";
				else if(result===Infinity) result = "@Infinity";
				else if(result===-Infinity) result = "@-Infinity";
				else if(type==="number" && isNaN(result)) result = "@NaN";
				else if(result && type==="object") {
					if(result instanceof Date) {
						result = `Date@${result.getTime()}`;
					}
					if(result instanceof Error) {
						return new Response(JSON.stringify(result.errors.map(error => error+"")),
							{
								status:422,
								headers:
								{
									"Content-Type":"text/plain",
									"Access-Control-Allow-Origin": `"${request.URL.protocol}//${request.URL.hostname}"`
								}
							});
					}
				}
				//const response = new Response(JSON.stringify(result));
				//response.body.pipeTo(writable);
				return new Response(JSON.stringify(result),{
					headers:
					{
						"Content-Type":"text/plain",
						"Access-Control-Allow-Origin": `"${request.URL.protocol}//${request.URL.hostname}"`
					}
				});
			});
			//return new Response(readable,
			//	{
			//		headers:
			//		{
			//			"Content-Type":"text/plain",
			//			"Access-Control-Allow-Origin": `"${request.URL.protocol}//${request.URL.hostname}"`
			//		}
			//	}
			//)
		}  else {
			status = 404;
			body = "404 - Not Found";
		}
	} catch(e) {
		body = JSON.stringify(e+body);
		status = 500;
	}
	//return fetch(request);
	return new Response(JSON.stringify(body),
			{
				status,
				headers:
				{
					"Content-Type":"text/plain",
					"Access-Control-Allow-Origin": `"${request.URL.protocol}//${request.URL.hostname}"`
				}
			}
	);
	return response;
}
