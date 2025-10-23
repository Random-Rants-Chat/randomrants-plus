class CommandHandler {
  static HIDE_MESSAGE = "HIDE_MESSAGE";
  constructor(wss) {
    if (!wss) {
      return;
    }
    this.wss = wss;

    this.initCommands();

    var addCommand = this.addCommand.bind(this); //API to add a command.
    var sendFeedbackLocal = this.sendFeedbackLocal.bind(this); //Send command feedback locally to client.
    var sendFeedbackLocalWithName = this.sendFeedbackLocalWithName.bind(this); //Send command feedback locally to client.
    var sendFeedbackGlobal = this.sendFeedbackGlobal.bind(this); //Send command feedback globally to client.
    var sendFeedbackGlobalWithName = this.sendFeedbackGlobalWithName.bind(this); //Send command feedback globally to client.
    var getUserInfo = this.getUserInfo.bind(this); //Get small user information.
    var searchUsersByKey = this.searchUsersByKey.bind(this); //Search users by their username or by @ symbol.
    var sendClientCommand = this.sendClientCommand.bind(this); //Send a browser based command to the user.
    var getActiveClients = this.getActiveClients.bind(this); //Gets everyone's conection socket in the room.
    var commandIsAllowed = this.commandIsAllowed.bind(this); //Checks if the command for that client is allowed.
    var _this = this;

    ////////////////////////////////////////////////////
    //Add your commands here.

    /*
		  addCommand usage:

		  addCommand("name", function (commandArguments, senderUserInformation, senderClient) {
			//Code here.
		  }, "Note for help command", true); //True means owner only.
		*/

    //This command is here because the original Random Rants using ;commands for a list of commands.
    //This just simply tells the person to migrate to using ;help.
    addCommand(
      "commands",
      function (args, userInfo, senderClient) {
        sendFeedbackLocal(
          senderClient,
          "The new command for all listed commands is ;help"
        );
        _this.doCommand(["help"], senderClient); //Run help command as the sender.
      },
      "Just a placeholder command, it only tells the person using it to use the help command.",
      false
    );

    //This is a useful command, but is separated because yes:

    addCommand(
      "help",
      function (args, userInfo, senderClient) {
        if (typeof args[0] == "string") {
          var commandName = args[0];

          if (commandName.length > 0) {
            if (
              _this.commandExists(commandName) &&
              commandIsAllowed(senderClient, commandName)
            ) {
              sendFeedbackLocal(
                senderClient,
                `[bold][color css=yellow];${commandName}[/color][/bold] - ${_this.commandHelp[commandName]}`
              );
            } else {
              sendFeedbackLocal(
                senderClient,
                'Help was unable to find command "' +
                  commandName +
                  '". You must mention this command in its proper case.'
              );
            }
            return;
          }
        }
        var text = "";
        if (!userInfo.isOwner) {
          text +=
            "[color css=orange][bold]To unlock all commands, get ownership (admin) powers![/bold][/color][br]";
        }
        text += "Command list: ";
        var excluded = ["commands", "align"];
        for (var c of Object.keys(_this.commands)) {
          var isNotExcluded = excluded.indexOf(c) < 0;
          if (isNotExcluded && commandIsAllowed(senderClient, c)) {
            text +=
              "[br]" +
              `[bold][color css=yellow];${c}[/color][/bold][br]${_this.commandHelp[c]}`;
          }
        }
        sendFeedbackLocal(senderClient, text);
      },
      "<Command Name (Not required)>[br]Gives you the list of commands, or type the command name as the first argument for it.",
      false
    );

    //Useful commands:

    addCommand(
      "restart",
      function (args, userInfo, senderClient) {
        wss._rrRefreshRoom(); //Random rants + has special properties assigned to client and the room websocket server.
      },
      "Restarts the room, this will clear all the messages.",
      true
    );

    addCommand(
      "runAs",
      function (args, userInfo, senderClient) {
        var foundClients = searchUsersByKey(args[0], senderClient);
        var commandArgs = args.slice(1);
        if (commandArgs.length < 1) {
          return;
        }
        if (commandArgs[0].startsWith(";")) {
          commandArgs[0] = commandArgs[0].slice(1);
        }
        if (commandArgs[0] == "runAs") {
          sendFeedbackGlobal("command runAs can't be chained.");
          return;
        }
        foundClients.forEach((otherClient) => {
          _this.doCommand(commandArgs, otherClient);
        });
      },
      "<Username> <Command>[br]Runs the following command as someone else (as the sender) or multiple people.[br]This should [bold]n o t[/bold] be very annoying.",
      true
    );

    addCommand(
      "popupMessage",
      function (args, userInfo, senderClient) {
        var foundClients = searchUsersByKey(args[0], senderClient);
        var message = args.slice(1);
        foundClients.forEach((otherClient) => {
          sendClientCommand(otherClient, "popupMessage", message.join(" "));
        });
      },
      "<Username> <Message>[br]Shows a popup to the user's browser saying the message provided.",
      true
    );

    addCommand(
      "kick",
      function (args, userInfo, senderClient) {
        var foundClients = searchUsersByKey(args[0], senderClient);
        foundClients.forEach((otherClient) => {
          sendClientCommand(otherClient, "kick");
          otherClient.close();
        });
      },
      "<Username>[br]Kick out the specified user from the room.",
      true
    );

    addCommand(
      "freeze",
      function (args, userInfo, senderClient) {
        var foundClients = searchUsersByKey(args[0], senderClient);
        foundClients.forEach((otherClient) => {
          sendClientCommand(otherClient, "freeze");
        });
      },
      "<Username>[br]Freezes the UI temporarily for the user.",
      true
    );

    addCommand(
      "redirect",
      function (args, userInfo, senderClient) {
        var foundClients = searchUsersByKey(args[0], senderClient);
        const url = args[1];
        if (!/^https?:\/\//.test(url)) {
          sendFeedbackLocal(
            senderClient,
            "URL must start with http:// or https://"
          );
          return;
        }
        foundClients.forEach((otherClient) => {
          sendClientCommand(otherClient, "redirect", url);
        });
      },
      "<Username> <URL>[br]Redirects the user to a new page.",
      true
    );

    addCommand(
      "broadcast",
      function (args, userInfo, senderClient) {
        var foundClients = searchUsersByKey(args[0], senderClient);
        var message = args.join(" ");
        sendFeedbackGlobalWithName(message, "[Notice]");
        return CommandHandler.HIDE_MESSAGE;
      },
      "<Message>[br]Broadcasts a message with the [bold][Notice][/bold] name",
      true
    );

    addCommand(
      "nickname",
      function (args, userInfo, senderClient) {
        var foundClients = searchUsersByKey(args[0], senderClient);
        var newName = args.slice(1, args.length).join(" ");
        var renamed = false;
        foundClients.forEach((client) => {
          renamed = true;
          client._rrRenameDisplayName(newName);
          sendFeedbackGlobal(
            `[bold]${client._rrUsername}[/bold]'s display name was temporarily changed to "[bold]${newName}[/bold]".`
          );
        });
      },
      "<Username> <New Display Name>[br]Changes display name for that user only for that room, or until they rejoin",
      true
    );

    //Joke commands:

    //Ones that block view or stop user action and don't just send to self are owner/ownership only.

    addCommand(
      "uh",
      function (args, userInfo, senderClient) {
        var allClients = getActiveClients();
        allClients.forEach((client) => {
          sendClientCommand(client, "macreJoke");
        });
      },
      "Ballz",
      true
    );

    addCommand(
      "luig",
      function (args, userInfo, senderClient) {
        var allClients = getActiveClients();
        allClients.forEach((client) => {
          sendClientCommand(client, "luigJoke");
        });
      },
      "Run it, and it will explain it all",
      true
    );

    addCommand(
      "spin",
      function (args, userInfo, senderClient) {
        sendClientCommand(senderClient, "spin");
      },
      "Spinny spin spin!",
      false
    );

    addCommand(
      "popcat",
      function (args, userInfo, senderClient) {
        var numb = +args[0] || 5;
        if (numb > 5) {
          numb = 5;
        }
        if (numb < 0.1) {
          numb = 0.1;
        }
        sendClientCommand(senderClient, "popcat", numb);
      },
      "<Seconds>[br]Pop pop pop pop pop",
      true
    );

    addCommand(
      "shake",
      function (args, userInfo, senderClient) {
        var foundClients = searchUsersByKey(args[0], senderClient);
        foundClients.forEach((otherClient) => {
          sendClientCommand(otherClient, "shake", Number(args[1]));
        });
      },
      "<Username> <Intensity>[br]Gives the username typed a screen shake.",
      true
    );

    addCommand(
      "flash",
      function (args, userInfo, senderClient) {
        var foundClients = searchUsersByKey(args[0], senderClient);
        foundClients.forEach((otherClient) => {
          sendClientCommand(otherClient, "flash");
        });
      },
      "<Username>[br]Flashes the screen background for a moment.",
      true
    );

    addCommand(
      "funni",
      function (args, userInfo, senderClient) {
        sendClientCommand(senderClient, "funni");
      },
      "XD",
      true
    );

    addCommand(
      "confetti",
      function (args, userInfo, senderClient) {
        var foundClients = searchUsersByKey(args[0], senderClient);
        if (!args[0]) {
          foundClients = getActiveClients();
        }
        foundClients.forEach((otherClient) => {
          sendClientCommand(otherClient, "confetti");
        });
      },
      "<Username>[br]Yipee!",
      false
    );

    addCommand(
      "doom",
      function (args, userInfo, senderClient) {
        var foundClients = getActiveClients();
        foundClients.forEach((client) => {
          sendClientCommand(client, "doom");
        });
      },
      'Triggers a "dramatic" DOOM countdown on everyone\'s screen.',
      false
    );

    addCommand(
      "bandicam",
      function (args, userInfo, senderClient) {
        var foundClients = getActiveClients();
        foundClients.forEach((client) => {
          sendClientCommand(client, "bandicam");
        });
      },
      "Enjoy your free trial!",
      false
    );

    addCommand(
      "xperrors",
      function (args, userInfo, senderClient) {
        var foundClients = searchUsersByKey(args[0], senderClient);
        foundClients.forEach((otherClient) => {
          sendClientCommand(otherClient, "bsod");
        });
      },
      "<Username>[br]Summons a bunch of fake errors and does BSOD on the username.",
      true //Should be owner only because it could be laggy to inactive users when the errors start to stack up.
    );

    addCommand(
      "vineboom",
      function (args, userInfo, senderClient) {
        var allClients = getActiveClients();
        allClients.forEach((otherClient) => {
          sendClientCommand(otherClient, "vineboom");
        });
      },
      "Plays vineboom on everyone's device",
      true
    );

    addCommand(
      "MichealWave",
      function (args, userInfo, senderClient) {
        var allClients = getActiveClients();
        var randomClient =
          allClients[Math.floor(Math.random(allClients.length - 1))];
        sendClientCommand(randomClient, "breakdance");
      },
      "Shows a microwave breakdancing on someones screen, small in a random spot, and teleports around the screen every 1/2 seconds and keeps doing that until the user clicks him or after 30 seconds.",
      true
    );

    addCommand(
      "mildlyInfuriating",
      function (args, userInfo, senderClient) {
        var foundClients = searchUsersByKey(args[0], senderClient);
        foundClients.forEach((otherClient) => {
          sendClientCommand(otherClient, "slowrotate");
        });
        return CommandHandler.HIDE_MESSAGE;
      },
      "<Username>[br]Makes the specified users screen veeeeeeeeeery slowly start rotating to the left. VEEEEEEEEEEEEERY slow so that eventually they’ll start to realize their screen is a bit off",
      true
    );
    addCommand(
      "align",
      function (args, userInfo, senderClient) {
        var foundClients = searchUsersByKey(args[0], senderClient);
        foundClients.forEach((otherClient) => {
          sendClientCommand(otherClient, "slowrotateEnd");
        });
      },
      "<Username>[br]Aligns the specified users screen back to its default position from the mildly infuriating command, this command won’t show in the ;help list",
      true
    );
    addCommand(
      "importantMessage",
      function (args, userInfo, senderClient) {
        var foundClients = searchUsersByKey(args[0], senderClient);
        var message = args.slice(1, args.length).join(" ");
        if (message.trim().length < 1) {
          sendFeedbackLocal(
            senderClient,
            "Message needs to be at least one character."
          );
          return CommandHandler.HIDE_MESSAGE;
        }
        foundClients.forEach((otherClient) => {
          sendClientCommand(otherClient, "importantMessage", message);
        });
        return CommandHandler.HIDE_MESSAGE;
      },
      "<Username> <Message>[br]Makes the screen of the target empty (besides the background color) except for a small black box, and if you click it - it slowly fades out and reveals a message, then after a second it returns the screen back to normal like nothing happened.",
      true
    );
    addCommand(
      "cheese",
      function (args, userInfo, senderClient) {
        var foundClients = searchUsersByKey(args[0], senderClient);
        foundClients.forEach((otherClient) => {
          sendClientCommand(otherClient, "cheeseStorm");
        });
      },
      '<Username>[br]Many cheese images will show up on the users screen and each stay there for a few seconds. When the user clicks them, they go away and show "+1 cheese".',
      true
    );
    addCommand(
      "quote",
      function (args, userInfo, senderClient) {
        var foundClients = searchUsersByKey(args[0], senderClient);
        if (foundClients.length == 0) {
          sendFeedbackLocal(senderClient, "No user was found");
          return CommandHandler.HIDE_MESSAGE;
        }
        if (foundClients.length !== 1) {
          sendFeedbackLocal(
            senderClient,
            "Too many users are selected, only one user needs to be chosen."
          );
          return CommandHandler.HIDE_MESSAGE;
        }
        var foundClient = foundClients[0];
        var message = args.slice(1, args.length).join(" ");
        var currentYear = new Date().getFullYear();
        if (message.length > 0) {
          sendFeedbackGlobalWithName(
            `“${message}” -${userInfo.username}, ${currentYear}`,
            "[Notice]"
          );
        } else {
          var lastMessage = null;
          var info = getUserInfo(foundClient);
          for (var messageData of wss._rrRoomMessages) {
            if (messageData.username == info.username) {
              lastMessage = messageData.message;
            }
          }
          if (!lastMessage) {
            sendFeedbackLocal(senderClient, "Couldn't find message");
            return CommandHandler.HIDE_MESSAGE;
          }
          sendFeedbackGlobalWithName(
            `“${lastMessage}” -${getUserInfo(foundClient).username}, ${currentYear}`,
            "[Notice]"
          );
        }
        return CommandHandler.HIDE_MESSAGE;
      },
      "<Username> <Message (Optional)[br]Only doing the quote and username will have the “[Notice]” say “quote goes here” -<username>, " +
        new Date().getFullYear() +
        "” and the quote is the most recent message that the specified user sent. However if you write your own quote, it’ll just say the same thing but with the quote being the thing you said.",
      false
    );

    ////////////////////////////////////////////////////
  }

  sendClientCommand(client, type, ...args) {
    //Allows certian commands that need browser behavior.
    client.send(
      JSON.stringify({
        type: "commandToClient",
        cType: type,
        args,
      })
    );
  }

  initCommands() {
    this.commands = {};
    this.commandHelp = {};
    this.commandPermissions = {};
  }

  addCommand(name, funct, help, permission) {
    this.commands[name] = funct;
    this.commandHelp[name] = help;
    this.commandPermissions[name] = permission;
  }

  commandExists(name) {
    if (this.commands[name]) {
      return true;
    }
    return false;
  }

  doCommand(args, client) {
    var commandName = args[0];

    if (this.commandExists(commandName)) {
      try {
        var output = this.commands[commandName](
          args.slice(1),
          this.getUserInfo(client),
          client
        );
        return output;
      } catch (e) {
        console.log(
          `[Command warning]: Command ${commandName} failed with error ${e}`
        );
      }
    } else {
      this.sendFeedbackLocal(
        client,
        `Unable to find command "${commandName}". Remember commands are case sensitive.`
      );
    }
  }

  getUserInfo(client) {
    return {
      displayName: client._rrDisplayName,
      username: client._rrUsername,
      loggedOn: client._rrLoggedIn, //If false, the user is a guest.
      color: client._rrUsername,
      isOwner: client._rrLoggedIn && client._rrIsOwner, //_rrIsOwner means if owner or has ownership
    };
  }

  getActiveClients() {
    var activeUsers = [];
    for (var client of this.wss.clients) {
      if (client._rrIsReady) {
        activeUsers.push(client);
      }
    }
    return activeUsers;
  }

  searchUsersByKey(key, senderClient) {
    if (typeof key !== "string") {
      return [];
    }

    var lowercaseKey = key.trim().toLowerCase();
    var clients = this.getActiveClients();
    var senderClientInfo = this.getUserInfo(senderClient);

    //You can use @all, @others, and @me to do multiple people or yourself.

    if (lowercaseKey == "@all") {
      //Everyone, including the sender.
      return clients;
    }

    if (lowercaseKey == "@others") {
      //Everyone, except the sender.
      var otherClients = [];
      for (var client of clients) {
        //The server should reject people joining with the same username so it will be fine.
        if (senderClientInfo.username !== this.getUserInfo(client).username) {
          otherClients.push(client);
        }
      }
      return otherClients;
    }

    if (lowercaseKey == "@me" || lowercaseKey == "@self") {
      //Only the sender, better than typing your username.
      return [senderClient];
    }

    //Otherwise, its a username search.

    for (var client of clients) {
      var lowercaseUsername = this.getUserInfo(client)
        .username.toLowerCase()
        .trim(); //trim(), just to make sure.
      if (lowercaseUsername == lowercaseKey) {
        return [client];
      }
    }

    //Else, return empty array.
    return [];
  }

  commandIsAllowed(client, commandName) {
    var userInfo = this.getUserInfo(client);

    if (userInfo.isOwner) {
      //Owners get all commands.
      return true;
    }

    if (!this.commandPermissions[commandName]) {
      //If the owner only flag on the command is false/empty, then return true.
      return true;
    }

    return false;
  }

  handleMessage(client, message) {
    var { displayName, username, color } = this.getUserInfo(client);

    var trimmedMessage = message.trim();

    if (trimmedMessage.startsWith(";")) {
      var slicedMessage = trimmedMessage.slice(1);
      var splitMessage = slicedMessage.split(" ");
      if (splitMessage.length < 1) {
        return;
      }

      var commandName = splitMessage[0];
      if (!this.commandIsAllowed(client, commandName)) {
        return; //No message, just return.
      }

      return this.doCommand(splitMessage, client);
    }
  }

  sendFeedbackLocal(client, message) {
    if (client._rrIsReady) {
      client.send(
        JSON.stringify({
          type: "newMessage",
          message: message,
          isServer: true,
          displayName: "[Commands]",
        })
      );
    }
  }

  sendFeedbackLocalWithName(client, message, name) {
    if (client._rrIsReady) {
      client.send(
        JSON.stringify({
          type: "newMessage",
          message: message,
          isServer: true,
          displayName: name,
        })
      );
    }
  }

  sendFeedbackGlobal(message) {
    for (var client of this.wss.clients) {
      if (client._rrIsReady) {
        client.send(
          JSON.stringify({
            type: "newMessage",
            message: message,
            isServer: true,
            displayName: "[Commands]",
          })
        );
      }
    }
  }

  sendFeedbackGlobalWithName(message, name) {
    for (var client of this.wss.clients) {
      if (client._rrIsReady) {
        client.send(
          JSON.stringify({
            type: "newMessage",
            message: message,
            isServer: true,
            displayName: name,
          })
        );
      }
    }
  }
}

module.exports = CommandHandler;
