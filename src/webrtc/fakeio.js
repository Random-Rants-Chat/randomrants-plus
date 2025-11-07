function stringifyJSONSafe(a) {
  return JSON.stringify(JSON.parse(JSON.stringify(a)));
}

class fakeIOClient {
  constructor(...options) {
    var ws = new WebSocket(...options);
    this.ws = ws;
    var t = this;
    this.events = {
      emit: function (name, ...values) {
        this[name].forEach((f) => {
          f.apply(t, values);
        });
      },
      emitAsync: async function (name, ...values) {
        for (var f of this[name]) {
          await f.apply(t, values);
        }
      },
      connection: [],
      disconnect: [],
      connectionError: [],
    };
    ws.onclose = function (...args) {
      t.events.emit("disconnect", ...args);
    };
    ws.onerror = function (...args) {
      t.events.emit("connectionError", ...args);
    };
    ws.onopen = function (...args) {
      ws.onmessage = function (e) {
        try {
          var json = JSON.parse(e.data);
          if (!json) {
            return;
          }
          if (json.event == "auth") {
            t.sockID = json.sockID;
            t.id = t.sockID;
            t.events.emit("connection", ...args);
            return;
          }
          if (
            json.event == "connection" &&
            json.event == "disconnect" &&
            json.event == "connectionError"
          ) {
            return; // Event is not supposed to be emitted from the message.
          }
          if (t.events[json.event]) {
            t.events.emit(json.event, ...json.args);
          }
        } catch (e) {
          window.alert(e);
          ws.close();
        }
      };
    };
  }

  close() {
    this.ws.onclose();
    this.ws.onclose = function () {};
    this.ws.close();
  }

  emit(name, ...values) {
    this.ws.send(
      stringifyJSONSafe({
        event: name,
        args: values,
      }),
    );
  }

  on(eventName, func) {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(func);
  }

  removeEvent(eventName, func) {
    if (this.events[eventName]) {
      var newEventArray = [];

      var removed = false;

      for (var event of this.events[eventName]) {
        if (removed) {
          newEventArray.push(event);
        } else {
          if (event !== func) {
            newEventArray.push(event);
            removed = true;
          }
        }
      }

      this.events[eventName] = newEventArray;
    }
  }
}
module.exports = fakeIOClient;
