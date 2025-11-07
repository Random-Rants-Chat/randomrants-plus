var storage = require("./storage.js");
class WaitYourTurnStorage {
  constructor(bucket, projectUrl, apiKey) {
    this._storage = new storage(bucket, projectUrl, apiKey);
    this._turns = {};
  }
  async _handleTurns(filePath) {
    if (!this._turns[filePath]) {
      return;
    }
    var fileTurns = this._turns[filePath];
    while (fileTurns.length > 0) {
      var turn = fileTurns[0];
      try {
        await turn();
      } catch (e) {
        console.log(e);
      }
      await (function () {
        return new Promise((resolve) => setTimeout(resolve, 1));
      })();
      fileTurns = fileTurns.slice(1, fileTurns.length);
      this._turns[filePath] = fileTurns;
    }
    this._turns[filePath] = undefined;
  }
  _handleTurn(filePath, func, ...args) {
    var _this = this;
    return new Promise((resolve, reject) => {
      var justCreated = false;
      if (!_this._turns[filePath]) {
        _this._turns[filePath] = [];
        justCreated = true;
      }
      _this._turns[filePath].push(async function () {
        try {
          resolve(await func(...args));
        } catch (e) {
          reject(e);
        }
      });

      if (justCreated) {
        _this._handleTurns(filePath);
      }
    });
  }

  async getFileStatus(...args) {
    var storage = this._storage;
    return await this._handleTurn(
      args[0],
      storage.getFileStatus.bind(storage),
      ...args,
    );
  }

  async downloadFile(...args) {
    var storage = this._storage;
    return await this._handleTurn(
      args[0],
      storage.downloadFile.bind(storage),
      ...args,
    );
  }

  async downloadFileAdvanced(...args) {
    var storage = this._storage;
    return await this._handleTurn(
      args[0],
      storage.downloadFileAdvanced.bind(storage),
      ...args,
    );
  }

  async downloadFileResponseProxy(...args) {
    var storage = this._storage;
    return await this._handleTurn(
      args[0],
      storage.downloadFileResponseProxy.bind(storage),
      ...args,
    );
  }

  async uploadFile(...args) {
    var storage = this._storage;
    return await this._handleTurn(
      args[0],
      storage.uploadFile.bind(storage),
      ...args,
    );
  }

  async uploadFileAdvanced(...args) {
    var storage = this._storage;
    return await this._handleTurn(
      args[0],
      storage.uploadFileAdvanced.bind(storage),
      ...args,
    );
  }

  async deleteFile(...args) {
    var storage = this._storage;
    return await this._handleTurn(
      args[0],
      storage.deleteFile.bind(storage),
      ...args,
    );
  }

  async deleteFileAdvanced(...args) {
    var storage = this._storage;
    return await this._handleTurn(
      args[0],
      storage.deleteFileAdvanced.bind(storage),
      ...args,
    );
  }
}

module.exports = WaitYourTurnStorage;
