
//This is not meant to be a permanent solution for storing data,
//unless your file system is persistent and large enough to hold these files.

var fs = require("fs");
var path = require("path");
var process = require("process");

var STORAGE_PATH_ENV = process.env.diskStoragePath;

if (STORAGE_PATH_ENV) {
	const STORAGE_PATH = STORAGE_PATH_ENV;
} else {
	const STORAGE_PATH = path.join(__dirname,"../.debugdbstorage");
	if (!fs.existsSync(STORAGE_PATH)) {
		fs.mkdirSync(STORAGE_PATH);
	}
}

var mimeTypes = {
	"webm": "image/webm",
	"png": "image/png",
	"svg": "image/svg+xml",
};

//You can include your own mime type list here by uncommenting and changing path:
mimeTypes = require("./mime.js");

class DebugDiskStorage {
	constructor() {
		console.log("Warning: using DebugDiskStorage instead of main storage module. Storage may delete automatically depending on your filesystem and container.");
	}
	
	_makeRequest() {
		throw new Error("Internal function call _makeRequest, which isn't supported by DebugDiskStorage.");
	}
	
	getFileStatus(filename) { //This might be used for getting if a file exists or not.
		return new Promise((resolve,reject) => {
			var p = path.join(STORAGE_PATH,filename);
			fs.exists(p,(r) => {
				if (r) {
					resolve(true);
				} else {
					reject("404 NOT FOUND"); //trying to mock the server storage module a bit.
				}
			});
		});
	}
	
	downloadFile(filename, cache = true) { //Used to download a file, throws rejection if can't find or has another issue. no range header on this function.
		var {getFileStatus} = this;
		return new Promise((resolve,reject) => {
			try{
				var filepath = path.join(STORAGE_PATH,filename);
			}catch(e){
				reject(new Error("Unable to parse path"));
				return;
			}
			getFileStatus(filename).then(() => {
				try{
					fs.readFile(filepath, {}, (error,buffer) => {
						if (error) {
							reject(error);
						} else {
							resolve(buffer)
						}
					});
				}catch(e){
					console.log("Internal file error: ",e);
					reject(e);
				}
			}).catch((e) => {
				reject(e);
			});
		});
	}
	
	_____provideFakeResponse(headers = {}, statusCode = 200) {
		var fakeResponse = {
			headers,
			statusCode,
			//These are dummies in case the server tries to call them.
			on: () => {},
			once: () => {},
			isFake: true  //This might be used in the server in case it needs to tell the difference.
		};
		return fakeResponse;
	}
	
	_____provideFakeRequest(headers) {
		var fakeRequest = {
			headers,
			//These are dummies in case the server tries to call them.
			on: () => {},
			once: () => {},
			isFake: true  //This might be used in the server in case it needs to tell the difference.
		};
		return fakeRequest;
	}
	
	downloadFileAdvanced(filename) { //This is harder to mock because we must provide a response. Usually this involvles objects a lot. Hope the server isn't comparing types!
		var {_____provideFakeResponse, _____provideFakeRequest, downloadFile} = this;
		
		return new Promise((resolve,reject) => {
			downloadFile(filename)
				.then((buffer) => {
					var headers = {};
					var request = _____provideFakeRequest(headers);
					var response = _____provideFakeResponse(headers, 200);
					return {
					  buffer,
					  response,
					  request,
					  headers: response.headers,
					  status: 200,
					};
				})
				.catch((error) => { //It sounds dumb to reject (since there's a status code property, but the original stoage.js rejects if statusCode is greater than or equal to 400.
					reject(error);
				});
		});
	}
	
	getHeaderValue(headers, headerName) { //Copied and pasted from the original storage, more of a utility than for storage, but server probably would use it.
		for (var key of Object.keys(headers)) {
		  if (key.toLowerCase() == headerName.toLowerCase()) {
			return headers[key];
		  }
		}
		return null;
	  }
	  
	async downloadFileResponseProxy(
		//Really tough one, this one acts as an "proxy" while still providing the original response data.
		//Used to serve via the "range" header if it has one.
		filename,
		_customHeaders,
		serverResponse,
		proxyHeaders = [],
    ) {
		var {
			getHeaderValue,
			_____provideFakeResponse
		} = this;
		var res = serverResponse;
		
		function hasHeader(type) {
			var matchableType = (""+type).trim().toLowerCase();
			for (var header of proxyHeaders) {
				var matchableHeader = (""+header).trim().toLowerCase();
				if (matchableType == matchableHeader) {
					return true; //Yes we have that header as a proxyable type.
				}
			}
			return false; //Couldn't find one so return false.
		}
		
		function setIfHasHeader(res, name, value) {
			if (hasHeader(name)) {
				res.setHeader(name,value);
			}
		}
		
		var filePath = path.join(STORAGE_PATH, filename);
		var extension = (""+filePath).split(".").pop();
		
		var fileStat = fs.statSync(filePath);
		var fileLength = fileStat.size;
		var type = mimeTypes[extension] ? mimeTypes[extension] : "text/plain";
		
		var range = getHeaderValue(_customHeaders, "range");
		if (range) {
            try{// Parse the range manually if it ends with a dash
            var rangeParts = range.split("=")[1].split("-");
            var start = parseInt(rangeParts[0], 10);
            var end = rangeParts[1]
              ? parseInt(rangeParts[1], 10)
              : fileLength - 1;
              
		  }catch(e){
			  // Handle errors parsing the Range header
            res.statusCode = 416; // Range Not Satisfiable
            res.setHeader("Content-Range", `bytes */${fileLength}`);
            res.end();
            return;
		  }

            if (end >= fileLength) {
              end = fileLength - 1;
            }

            if (start >= fileLength || start > end) {
              res.statusCode = 416; // Range Not Satisfiable
              setIfHasHeader(res,"Content-Range", `bytes */${fileLength}`);
              res.end();
              return;
            }
            
            // Set headers for partial content response
            res.statusCode = 206; // Partial Content
            setIfHasHeader(res,"Content-Type", type); // Correct MIME type for audio
            setIfHasHeader(
				res,
              "Content-Range",
              `bytes ${start}-${end}/${fileLength}`,
            );
            setIfHasHeader(res,"Content-Length", end - start + 1);
            setIfHasHeader(res,"Accept-Ranges", "bytes"); // Inform the client we support ranges

            var stream = fs.createReadStream(filePath, { start, end });
            var buffers = []; //Server may also want it's own buffer.
            stream.pipe(res); 
            await (new Promise((resolve,reject) => {
				stream.on("data", (chunk) => {
					buffers.push(buffers);
				});
				stream.on("end", () => {
					var buffer = Buffer.concat(buffers);
					var response = _____provideFakeResponse(res.headers,res.statusCode);
					resolve({
					  buffer: buffer,
					  response,
					  headers: response.headers,
					  status: response.statusCode,
					});
				});
				stream.on("error", (streamErr) => {
				  if (!res.headersSent) {
					res.statusCode = 500;
					res.end("Internal Server Error while streaming file content.");
				  } else {
					res.destroy();
				  }
				  reject(streamErr);
				});
			}));
            return;
        }
        
        //we're most likley not dealing with a "range" header, this case, send the full file.
        
        var stream = fs.createReadStream(filePath);
            var buffers = []; //Server may also want it's own buffer.
            stream.pipe(res); 
            await (new Promise((resolve,reject) => {
				stream.on("data", (chunk) => {
					buffers.push(chunk);
				});
				stream.on("end", () => {
					var buffer = Buffer.concat(buffers);
					var response = _____provideFakeResponse(res.headers,res.statusCode);
					resolve({
					  buffer: buffer,
					  response,
					  headers: response.headers,
					  status: response.statusCode,
					});
				});
				stream.on("error", (streamErr) => {
				  if (!res.headersSent) {
					res.statusCode = 500;
					res.end("Internal Server Error while streaming file content.");
				  } else {
					res.destroy();
				  }
				  reject(streamErr);
				});
			}));
	}
	
	uploadFile(filename, data, contentType = "text/plain") { //contentType is ignored here.
		return new Promise((resolve,reject) => {
			try{
				var p = path.join(STORAGE_PATH,filename);
			}catch(e){
				reject("Path parse error");
				return;
			}
			fs.writeFile(p, data, (err) => {
				if (err) {
					reject(err);
				} else {
					resolve();
				}
			});
		});
	}
	
	uploadFileAdvanced() { //Server probably barely uses this, but we should keep it for compatibility.
		var {_____provideFakeResponse, _____provideFakeRequest} = this;
		return new Promise((resolve,reject) => {
			try{
				var p = path.join(STORAGE_PATH,filename);
			}catch(e){
				reject("Path parse error");
				return;
			}
			fs.writeFile(p, data, (err) => {
				if (err) {
					reject(err);
				} else {
					//We have a buffer property for this action... weird.
					//I guess kinda useful for checking the response data, but why add it?
					var response = this._____provideFakeResponse({},200);
					var request = this._____provideFakeRequest({});
					resolve({
					  buffer: Buffer.from(JSON.stringify({ //Some json to pretend we're a database server.
						  success:true
					  })),
					  response,
					  request,
					  headers: response.headers,
					  status: response.statusCode,
					});
				}
			});
		});
	}
	
	deleteFile(filename) {
		return new Promise((resolve,reject) => {
			try{
				var p = path.join(STORAGE_PATH,filename);
			}catch(e){
				reject("Path parse error");
				return;
			}
			fs.rm(p, (err) => {
				if (err) {
					reject(err);
				} else {
					resolve();
				}
			});
		});
	}
	
	deleteFileAdvanced(filename) {
		var {_____provideFakeResponse, _____provideFakeRequest} = this;
		return new Promise((resolve,reject) => {
			try{
				var p = path.join(STORAGE_PATH,filename);
			}catch(e){
				reject("Path parse error");
				return;
			}
			fs.rm(p, (err) => {
				if (err) {
					reject(err);
				} else {
					//We have a buffer property for this action... weird.
					//I guess kinda useful for checking the response data, but why add it?
					var response = this._____provideFakeResponse({},200);
					var request = this._____provideFakeRequest({});
					resolve({
					  buffer: Buffer.from(JSON.stringify({ //Some json to pretend we're a database server.
						  success:true
					  })),
					  response,
					  request,
					  headers: response.headers,
					  status: response.statusCode,
					});
				}
			});
		});
	}
}

module.exports = DebugDiskStorage;
