const https = require("https");
const { URL } = require("url");
var URLModule = require("url");

var okServerResponses = [200, 201, 202, 203, 204, 205, 206, 207, 208, 226];

class GvbBaseSupabaseStorage {
  constructor(bucket, projectUrl, apiKey) {
    if (!bucket || !projectUrl || !apiKey) {
      throw new Error("Missing bucket name, project URL, or API key");
    }

    this.bucket = bucket;
    this.projectUrl = projectUrl.replace(/\/+$/, ""); // trim trailing slashes
    this.apiKey = apiKey;
  }

  _makeRequest(method, path, headers = {}, body = null) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, this.projectUrl);
      const options = {
        method,
        hostname: url.hostname,
        path: url.pathname + url.search,
        headers: {
          apikey: this.apiKey,
          Authorization: `Bearer ${this.apiKey}`,
          ...headers,
        },
      };

      const req = https.request(options, (res) => {
        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => {
          const buffer = Buffer.concat(chunks);
          if (res.statusCode >= 400) {
            return reject(
              new Error(`HTTP ${res.statusCode}: ${buffer.toString()}`)
            );
          }
          resolve({ buffer, response: res, request: req });
        });
      });

      req.on("error", reject);
      if (body) req.write(body);
      req.end();
    });
  }

  async getFileStatus(filename) {
    const path = `/storage/v1/object/${this.bucket}/${encodeURIComponent(
      filename
    )}`;
    const { buffer } = await this._makeRequest("GET", path);
    return true;
  }

  async downloadFile(filename) {
    const path = `/storage/v1/object/${this.bucket}/${encodeURIComponent(
      filename
    )}?v=${Date.now()}`;
    const { buffer } = await this._makeRequest("GET", path);
    return buffer;
  }

  async downloadFileAdvanced(filename) {
    const path = `/storage/v1/object/${this.bucket}/${encodeURIComponent(
      filename
    )}?v=${Date.now()}`;
    const { buffer, response, request } = await this._makeRequest("GET", path);
    return {
      buffer,
      response,
      request,
      headers: response.headers,
      status: response.statusCode,
    };
  }

  getHeaderValue(headers, headerName) {
    for (var key of Object.keys(headers)) {
      if (key.toLowerCase() == headerName.toLowerCase()) {
        return headers[key];
      }
    }
    return null;
  }

  downloadFileResponseProxy(
    filename,
    _customHeaders,
    serverResponse,
    proxyHeaders = []
  ) {
    return new Promise((resolve, reject) => {
      const path = `/storage/v1/object/${this.bucket}/${encodeURIComponent(
        filename
      )}?v=${Date.now()}`;
      var url = URLModule.parse(this.projectUrl + path);

      var customHeaders = {};
      if (_customHeaders) {
        customHeaders = _customHeaders;
      }

      var _this = this;

      const options = {
        method: "GET",
        headers: {
          apikey: this.apiKey,
          Authorization: `Bearer ${this.apiKey}`,
          ...customHeaders,
        },
        ...url,
      };

      https
        .get(options, (res) => {
          for (var header of proxyHeaders) {
            var value = _this.getHeaderValue(res.headers, header);
            if (value) serverResponse.setHeader(header, value);
          }
          if (okServerResponses.indexOf(res.statusCode) < 0) {
            reject(`HTTP ${res.statusCode}`);
            return;
          }
          serverResponse.statusCode = res.statusCode;
          res.pipe(serverResponse);

          var data = [];

          res.on("data", (chunk) => {
            data.push(chunk);
          });

          res.on("end", () => {
            resolve({
              buffer: Buffer.concat(data),
              response: res,
              headers: res.headers,
              status: res.statusCode,
            });
          });
        })
        .on("error", (err) => {
          reject(err);
        });
    });
  }

  async uploadFile(filename, data, contentType = "text/plain") {
    //Usually files get sent in text format.
    const path = `/storage/v1/object/${this.bucket}/${encodeURIComponent(
      filename
    )}`;

    var contentLength;
    if (typeof data === "string") {
      contentLength = Buffer.byteLength(data, "utf8");
    } else {
      // Assumes Buffer or other type with a byte-based .length property
      contentLength = data.length;
    }

    const { buffer } = await this._makeRequest(
      "POST",
      path,
      {
        "Content-Type": contentType,
        "Content-Length": contentLength,
        "x-upsert": "true",
        "cache-control": "max-age=0",
      },
      data
    );
    return buffer;
  }

  async uploadFileAdvanced(filename, data, contentType = "text/plain") {
    const path = `/storage/v1/object/${this.bucket}/${encodeURIComponent(
      filename
    )}`;

    var contentLength;
    if (typeof data === "string") {
      contentLength = Buffer.byteLength(data, "utf8");
    } else {
      // Assumes Buffer or other type with a byte-based .length property
      contentLength = data.length;
    }

    const { buffer, response, request } = await this._makeRequest(
      "POST",
      path,
      {
        "Content-Type": contentType,
        "Content-Length": contentLength,
        "x-upsert": "true",
        "cache-control": "max-age=0",
      },
      data
    );

    return {
      buffer,
      response,
      request,
      headers: response.headers,
      status: response.statusCode,
    };
  }

  async deleteFile(filename) {
    const path = `/storage/v1/object/${this.bucket}/${encodeURIComponent(
      filename
    )}`;
    const { buffer } = await this._makeRequest("DELETE", path);
    return buffer;
  }

  async deleteFileAdvanced(filename) {
    const path = `/storage/v1/object/${this.bucket}/${encodeURIComponent(
      filename
    )}`;
    const { buffer, response, request } = await this._makeRequest(
      "DELETE",
      path
    );
    return {
      buffer,
      response,
      request,
      headers: response.headers,
      status: response.statusCode,
    };
  }
}

module.exports = GvbBaseSupabaseStorage;
