//This is copied and pasted from gvbbase-storage module.
//Just with some useful edits.

var https = require("https"); //to make internet requests with.

var okStatusList = [200, 204, 206];

class GvbBaseFBStorage {
  constructor(bucket) {
    if (typeof bucket == "string") {
      this.bucket = bucket;
    } else {
      throw new Error(
        "Please provide a firebase bucket for GvbBaseStorage to use."
      );
    }
  }

  //The Firebase Storage Path And Hostname, Status URL is always requested so you can download and upload data.

  getFileStatusPath(file) {
    try {
      return `/v0/b/${this.bucket}/o/${encodeURIComponent(file)}`;
    } catch (e) {
      console.log(e);
    }
  }
  getDownloadPath(file, token) {
    try {
      return `/v0/b/${this.bucket}/o/${encodeURIComponent(
        file
      )}?alt=media&token=${token}`;
    } catch (e) {
      console.log(e);
    }
  }
  getUploadPath(file) {
    try {
      return `/v0/b/${this.bucket}/o?name=${encodeURIComponent(file)}`;
    } catch (e) {
      console.log(e);
    }
  }
  getDeletePath(file) {
    try {
      return `/v0/b/${this.bucket}/o/${encodeURIComponent(file)}`;
    } catch (e) {
      console.log(e);
    }
  }
  getFBStorageHostname() {
    try {
      return "firebasestorage.googleapis.com";
    } catch (e) {
      console.log(e);
    }
  }

  getFBRequiredHeaders() {
    return {
      "User-Agent": "GvbBaseFBStorage",
    };
  }

  //The API

  doRequest(options) {
    var _this = this;
    return new Promise((resolve, reject) => {
      var req = https.request(options, (res) => {
        //reject if not STATUS 200 (OK)

        if (!(okStatusList.indexOf(res.statusCode) > -1)) {
          reject("BAD STATUS " + res.statusCode);
          return;
        }

        //It's OK!, download the data.
        var data = [];
        res.on("data", (chunk) => {
          data.push(chunk);
        });

        res.on("end", () => {
          //resolve with a buffer output.
          resolve(Buffer.concat(data));
        });
      });

      //some sort of error handling.

      req.on("error", (e) => {
        reject({
          type: "other",
          message: e,
        });
      });

      req.end();
    });
  }
  getHeaderValue(headers, headerName) {
    for (var key of Object.keys(headers)) {
      if (key.toLowerCase() == headerName.toLowerCase()) {
        return headers[key];
      }
    }
    return null;
  }
  doRequestAdvanced(options) {
    var _this = this;
    return new Promise((resolve, reject) => {
      var req = https.request(options, (res) => {
        //reject if not STATUS 200 (OK)

        if (!(okStatusList.indexOf(res.statusCode) > -1)) {
          reject("BAD STATUS " + res.statusCode);
          return;
        }

        //It's OK!, download the data.
        var data = [];
        res.on("data", (chunk) => {
          data.push(chunk);
        });

        res.on("end", () => {
          resolve({
            buffer: Buffer.concat(data),
            response: res,
            request: req,
            headers: res.headers,
            status: res.statusCode,
          });
        });
      });

      //some sort of error handling.

      req.on("error", (e) => {
        reject({
          type: "other",
          message: e,
        });
      });

      req.end();
    });
  }

  doRequestAdvancedWithProxy(options, serverResponse, applyHeaders) {
    var _this = this;
    return new Promise((resolve, reject) => {
      var req = https.request(options, (res) => {
        //reject if not OK

        if (!(okStatusList.indexOf(res.statusCode) > -1)) {
          reject("BAD STATUS " + res.statusCode);
          return;
        }

        //It's OK!, download the data.
        var data = [];
        res.on("data", (chunk) => {
          data.push(chunk);
        });

        res.on("end", () => {
          resolve({
            buffer: Buffer.concat(data),
            response: res,
            request: req,
            headers: res.headers,
            status: res.statusCode,
          });
        });
        
        for (var name of applyHeaders) {
          var value = _this.getHeaderValue(res.headers, name);
          serverResponse.setHeader(name,value);
        }
        serverResponse.statusCode = res.statusCode;
        
        //Start proxying the response.

        res.pipe(serverResponse);
      });

      //some sort of error handling.

      req.on("error", (e) => {
        reject({
          type: "other",
          message: e,
        });
      });

      req.end();
    });
  }
  doRequestPOST(options, postdata) {
    var _this = this;
    return new Promise((resolve, reject) => {
      var req = https.request(options, (res) => {
        if (!(okStatusList.indexOf(res.statusCode) > -1)) {
          reject("BAD STATUS " + res.statusCode);
          return;
        }
        //It's OK!, download the data.
        var data = [];
        res.on("data", (chunk) => {
          data.push(chunk);
        });

        res.on("end", () => {
          //resolve with a buffer output.
          resolve(Buffer.concat(data));
        });
      });

      //some sort of error handling.

      req.on("error", (e) => {
        reject({
          type: "other",
          message: e,
        });
      });
      req.write(postdata);
      req.end();
    });
  }
  doRequestPOSTAdvanced(options, postdata) {
    var _this = this;
    return new Promise((resolve, reject) => {
      var req = https.request(options, (res) => {
        if (!(okStatusList.indexOf(res.statusCode) > -1)) {
          reject("BAD STATUS " + res.statusCode);
          return;
        }
        //It's OK!, download the data.
        var data = [];
        res.on("data", (chunk) => {
          data.push(chunk);
        });

        res.on("end", () => {
          resolve({
            buffer: Buffer.concat(data),
            response: res,
            request: req,
            headers: res.headers,
            status: res.statusCode,
          });
        });
      });

      //some sort of error handling.

      req.on("error", (e) => {
        reject({
          type: "other",
          message: e,
        });
      });
      req.write(postdata);
      req.end();
    });
  }

  getFileStatus(filename, customHeaders) {
    var _this = this;
    return new Promise((resolve, reject) => {
      var req = https.request(
        {
          path: _this.getFileStatusPath(filename),
          headers: { ..._this.getFBRequiredHeaders(), ...customHeaders },
          host: _this.getFBStorageHostname(),
          method: "GET",
        },
        (res) => {
          if (!(okStatusList.indexOf(res.statusCode) > -1)) {
            reject("BAD STATUS " + res.statusCode);
            return;
          }
          //It's OK!, download the data.
          var data = [];
          res.on("data", (chunk) => {
            data.push(chunk);
          });

          res.on("end", () => {
            //resolve with a buffer output.
            resolve(Buffer.concat(data));
          });
        }
      );

      //some sort of error handling.

      req.on("error", (e) => {
        reject({
          type: "other",
          message: e,
        });
      });

      req.end();
    });
  }

  downloadFile(filename, customHeaders) {
    var _this = this;
    return new Promise((resolve, reject) => {
      try {
        _this
          .getFileStatus(filename)
          .then((statusBuffer) => {
            try {
              var statusJSON = JSON.parse(statusBuffer).toString();
              _this
                .doRequest({
                  headers: {
                    ..._this.getFBRequiredHeaders(),
                    ...customHeaders,
                  },
                  host: _this.getFBStorageHostname(),
                  path: _this.getDownloadPath(
                    filename,
                    statusJSON.downloadTokens
                  ),
                  method: "GET",
                })
                .then((outputBuffer) => {
                  resolve(outputBuffer);
                })
                .catch(reject);
            } catch (e) {
              reject(e);
            }
          })
          .catch(reject);
      } catch (e) {
        reject(e);
      }
    });
  }
  downloadFileAdvanced(filename, customHeaders) {
    var _this = this;
    return new Promise((resolve, reject) => {
      try {
        _this
          .getFileStatus(filename)
          .then((statusBuffer) => {
            try {
              var statusJSON = JSON.parse(statusBuffer).toString();
              _this
                .doRequestAdvanced({
                  headers: {
                    ..._this.getFBRequiredHeaders(),
                    ...customHeaders,
                  },
                  host: _this.getFBStorageHostname(),
                  path: _this.getDownloadPath(
                    filename,
                    statusJSON.downloadTokens
                  ),
                  method: "GET",
                })
                .then((object) => {
                  resolve(object);
                })
                .catch(reject);
            } catch (e) {
              reject(e);
            }
          })
          .catch(reject);
      } catch (e) {
        reject(e);
      }
    });
  }

  downloadFileResponseProxy(filename, customHeaders, serverResponse, proxyHeaders) {
    var _this = this;
    return new Promise((resolve, reject) => {
      try {
        _this
          .getFileStatus(filename)
          .then((statusBuffer) => {
            try {
              var statusJSON = JSON.parse(statusBuffer).toString();
              _this
                .doRequestAdvancedWithProxy(
                  {
                    headers: {
                      ..._this.getFBRequiredHeaders(),
                      ...customHeaders,
                    },
                    host: _this.getFBStorageHostname(),
                    path: _this.getDownloadPath(
                      filename,
                      statusJSON.downloadTokens
                    ),
                    method: "GET",
                  },
                  serverResponse,
                  proxyHeaders
                )
                .then((object) => {
                  resolve(object);
                })
                .catch(reject);
            } catch (e) {
              reject(e);
            }
          })
          .catch(reject);
      } catch (e) {
        reject(e);
      }
    });
  }

  uploadFile(filename, data, ctype, customHeaders) {
    var _this = this;
    return new Promise((resolve, reject) => {
      var contenttype = "application/octet-stream";
      if (typeof ctype == "string") {
        contenttype = ctype;
      }
      //console.log(contenttype);
      //try{
      //_this.getFileStatus(filename).then((statusBuffer) => {
      try {
        _this
          .doRequestPOST(
            {
              headers: {
                ..._this.getFBRequiredHeaders(),
                "Content-Type": contenttype,
                ...customHeaders,
              },
              host: _this.getFBStorageHostname(),
              path: _this.getUploadPath(filename),
              method: "POST",
            },
            data
          )
          .then((outputBuffer) => {
            resolve(outputBuffer);
          })
          .catch(reject);
      } catch (e) {
        reject(e);
      }
      //});
      //}catch(e){reject(e)};
    });
  }
  
  uploadFileAdvanced(filename, data, ctype, customHeaders) {
    var _this = this;
    return new Promise((resolve, reject) => {
      var contenttype = "application/octet-stream";
      if (typeof ctype == "string") {
        contenttype = ctype;
      }
      //console.log(contenttype);
      //try{
      //_this.getFileStatus(filename).then((statusBuffer) => {
      try {
        _this
          .doRequestPOSTAdvanced(
            {
              headers: {
                ..._this.getFBRequiredHeaders(),
                "Content-Type": contenttype,
                ...customHeaders,
              },
              host: _this.getFBStorageHostname(),
              path: _this.getUploadPath(filename),
              method: "POST",
            },
            data
          )
          .then((object) => {
            resolve(object);
          })
          .catch(reject);
      } catch (e) {
        reject(e);
      }
      //});
      //}catch(e){reject(e)};
    });
  }
  deleteFile(filename, customHeaders) {
    var _this = this;
    return new Promise((resolve, reject) => {
      //_this.getFileStatus(filename).then((statusBuffer) => {
      try {
        _this
          .doRequest({
            headers: { ..._this.getFBRequiredHeaders(), ...customHeaders },
            host: _this.getFBStorageHostname(),
            path: _this.getDeletePath(filename),
            method: "DELETE",
          })
          .then((outputBuffer) => {
            resolve(outputBuffer);
          })
          .catch(reject);
      } catch (e) {
        reject(e);
      }
      //});
    });
  }
  deleteFileAdvanced(filename, customHeaders) {
    var _this = this;
    return new Promise((resolve, reject) => {
      //_this.getFileStatus(filename).then((statusBuffer) => {
      try {
        _this
          .doRequestAdvanced({
            headers: { ..._this.getFBRequiredHeaders(), ...customHeaders },
            host: _this.getFBStorageHostname(),
            path: _this.getDeletePath(filename),
            method: "DELETE",
          })
          .then((object) => {
            resolve(object);
          })
          .catch(reject);
      } catch (e) {
        reject(e);
      }
      //});
    });
  }
}

module.exports = GvbBaseFBStorage;
