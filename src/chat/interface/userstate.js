class RRUserState {
  constructor() {
    this.isOwner = false;
    this.roomID = null;
    this.noPermissionDialog =
      "Sorry man, but this feature is blocked!\nPlease try asking someone to enable the permission for this action.";
    this.permissions = {
      soundboard: true, //Allow playing sounds on soundboard.
      media: true, //Allow starting media via the media play button.
    };

    var thisObj = this;

    this.events = {
      emit: function (name, ...values) {
        thisObj.events[name].forEach((f) => {
          f.apply(thisObj, values);
        });
      },
      emitAsync: async function (name, ...values) {
        for (var f of thisObj.events[name]) {
          await f.apply(thisObj, values);
        }
      },
      //Events
      permissionUpdate: [],
    };
  }

  updatePermission(name, value) {
    this.permissions[name] = value;
    this.emitEvent("permissionUpdate", name, value);
  }

  hasPermission(name) {
    return this.permissions[name];
  }

  emitEvent(name, ...values) {
    return this.events.emit(name, ...values);
  }

  async emitEventAsync(name, ...values) {
    return await this.events.emitAsync(name, ...values);
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

module.exports = new RRUserState();
