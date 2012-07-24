var http = require('http');
var url = require('url');
var fs = require('fs');

var start = function(host, port, root) {

	var listener = function (req, res) {

		var pathname = url.parse(req.url).pathname;
		console.log("Handling request for: " + pathname);
		
		if(req.headers["x-requested-with"] === "XMLHttpRequest") {
			var result = '{"result": "' + req.method + ' ' + pathname + '"}'
			res.writeHead(200);
			res.write(result);
			res.end();
		} else {
			fs.readFile(root + pathname, function (err, data){
				if(!err) {
					res.writeHead(200);
					res.write(data);
					res.end();
				} else {
					res.writeHead(404, "Not Found!!!");
					res.end("Not Found!!!");
				}
			});
		}
	};

	http.createServer(listener).listen(port, host);
	console.log("Server running at http://" + host + ":" + port);
};

exports.start = start;

