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
    var addUserMessageFilter = this.addUserMessageFilter.bind(this); //Add a message filter to a client, editing their messages sent.
    var removeUserMessageFilter = this.removeUserMessageFilter.bind(this); //Remove a message filter from a client.
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
          "The new command for all listed commands is ;help",
        );
        _this.doCommand(["help"], senderClient); //Run help command as the sender.
      },
      "Just a placeholder command, it only tells the person using it to use the help command.",
      false,
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
                `[bold][color css=yellow];${commandName}[/color][/bold] - ${_this.commandHelp[commandName]}`,
              );
            } else {
              sendFeedbackLocal(
                senderClient,
                'Help was unable to find command "' +
                  commandName +
                  '". You must mention this command in its proper case.',
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
        var excluded = ["commands", "align", "67"];
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
      false,
    );

    //Useful commands:

    addCommand(
      "restart",
      function (args, userInfo, senderClient) {
        wss._rrRefreshRoom(); //Random rants + has special properties assigned to client and the room websocket server.
      },
      "Restarts the room, this will clear all the messages.",
      true,
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
      true,
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
      true,
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
      true,
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
      true,
    );

    addCommand(
      "redirect",
      function (args, userInfo, senderClient) {
        var foundClients = searchUsersByKey(args[0], senderClient);
        const url = args[1];
        if (!/^https?:\/\//.test(url)) {
          sendFeedbackLocal(
            senderClient,
            "URL must start with http:// or https://",
          );
          return;
        }
        foundClients.forEach((otherClient) => {
          sendClientCommand(otherClient, "redirect", url);
        });
      },
      "<Username> <URL>[br]Redirects the user to a new page.",
      true,
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
      true,
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
            `[bold]${client._rrUsername}[/bold]'s display name was temporarily changed to "[bold]${newName}[/bold]".`,
          );
        });
      },
      "<Username> <New Display Name>[br]Changes display name for that user only for that room, or until they rejoin",
      true,
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
      true,
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
      true,
    );

    addCommand(
      "spin",
      function (args, userInfo, senderClient) {
        sendClientCommand(senderClient, "spin");
      },
      "Spinny spin spin!",
      false,
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
      true,
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
      true,
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
      true,
    );

    addCommand(
      "funni",
      function (args, userInfo, senderClient) {
        sendClientCommand(senderClient, "funni");
      },
      "XD",
      true,
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
      false,
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
      false,
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
      false,
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
      true, //Should be owner only because it could be laggy to inactive users when the errors start to stack up.
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
      true,
    );

    addCommand(
      "MichealWave",
      function (args, userInfo, senderClient) {
        var allClients = getActiveClients();
        var randomClient =
          allClients[Math.floor(Math.random(allClients.length - 1))];
        if (args[0]) {
          searchUsersByKey(args[0], senderClient).forEach((client) => {
            sendClientCommand(client, "breakdance");
          });
          return;
        }
        sendClientCommand(randomClient, "breakdance");
      },
      "<Username>[br]Shows a microwave breakdancing on someones screen, small in a random spot, and teleports around the screen every 1/2 seconds and keeps doing that until the user clicks him or after 30 seconds.",
      true,
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
      true,
    );
    addCommand(
      "align",
      function (args, userInfo, senderClient) {
        var foundClients = searchUsersByKey(args[0], senderClient);
        foundClients.forEach((otherClient) => {
          sendClientCommand(otherClient, "slowrotateEnd");
          removeUserMessageFilter(otherClient, "australian_filter");
        });
      },
      "<Username>[br]Aligns the specified users screen back to its default position from the mildly infuriating command, also clears the effect of the ;Australian command.",
      true,
    );
    addCommand(
      "importantMessage",
      function (args, userInfo, senderClient) {
        var foundClients = searchUsersByKey(args[0], senderClient);
        var message = args.slice(1, args.length).join(" ");
        if (message.trim().length < 1) {
          sendFeedbackLocal(
            senderClient,
            "Message needs to be at least one character.",
          );
          return CommandHandler.HIDE_MESSAGE;
        }
        foundClients.forEach((otherClient) => {
          sendClientCommand(otherClient, "importantMessage", message);
        });
        return CommandHandler.HIDE_MESSAGE;
      },
      "<Username> <Message>[br]Makes the screen of the target empty (besides the background color) except for a small black box, and if you click it - it slowly fades out and reveals a message, then after a second it returns the screen back to normal like nothing happened.",
      true,
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
      true,
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
            "Too many users are selected, only one user needs to be chosen.",
          );
          return CommandHandler.HIDE_MESSAGE;
        }
        var foundClient = foundClients[0];
        var message = args.slice(1, args.length).join(" ");
        var currentYear = new Date().getFullYear();
        if (message.length > 0) {
          sendFeedbackGlobalWithName(
            `“${message}” -${getUserInfo(foundClient).name}, ${currentYear}`,
            "[Notice]",
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
            `“${lastMessage}” -${getUserInfo(foundClient).name}, ${currentYear}`,
            "[Notice]",
          );
        }
        return CommandHandler.HIDE_MESSAGE;
      },
      "<Username> <Message (Optional)[br]Only doing the quote and username will have the “[Notice]” say “quote goes here” -<username>, " +
        new Date().getFullYear() +
        "” and the quote is the most recent message that the specified user sent. However if you write your own quote, it’ll just say the same thing but with the quote being the thing you said.",
      false,
    );

    addCommand(
      "me",
      function (args, userInfo, senderClient) {
        if (args.length < 1) {
          sendFeedbackLocal(senderClient, "Usage: ;me <message>");
          return CommandHandler.HIDE_MESSAGE;
        }

        var message = args.join(" ");

        sendFeedbackGlobalWithName(
          `[italic]${message}[/italic]`,
          `* ${userInfo.name}`,
        );

        return CommandHandler.HIDE_MESSAGE;
      },
      "<message>[br]Broadcasts an 'action' message to the room. (e.g., ';me is grounded')",
      false,
    );

    addCommand(
      "roll",
      function (args, userInfo, senderClient) {
        var max = 100;
        var roll = Math.floor(Math.random() * max) + 1;

        if (args[0] && args[0].includes("d")) {
          var parts = args[0].split("d");
          var dice = parseInt(parts[0]) || 1;
          var sides = parseInt(parts[1]) || 20;

          if (dice > 100) dice = 100; // Limit to 100 dice
          if (sides > 1000) sides = 1000; // Limit to 1000 sides

          roll = 0;
          for (var i = 0; i < dice; i++) {
            roll += Math.floor(Math.random() * sides) + 1;
          }
          sendFeedbackGlobal(
            `[bold]${userInfo.name}[/bold] rolled ${dice}d${sides} and got... [bold]${roll}[/bold]!`,
          );
        } else {
          // Simple ;roll 1-100
          sendFeedbackGlobal(
            `[bold]${userInfo.name}[/bold] rolled a [bold]${roll}[/bold] (1-100)`,
          );
        }

        return CommandHandler.HIDE_MESSAGE;
      },
      "<1d20 (optional)>[br]Rolls a dice. Defaults to 1-100.",
      false, // false = for everyone!
    );

    // ;8ball - The magic 8-ball
    addCommand(
      "8ball",
      function (args, userInfo, senderClient) {
        if (args.length < 1) {
          sendFeedbackLocal(senderClient, "Usage: ;8ball <question>");
          return CommandHandler.HIDE_MESSAGE;
        }

        var responses = [
          "As I see it, yes.",
          "Ask again later.",
          "Better not tell you now.",
          "Cannot predict now.",
          "Concentrate and ask again.",
          "Don't count on it.",
          "It is certain.",
          "It is decidedly so.",
          "Most likely.",
          "My reply is no.",
          "My sources say no.",
          "Outlook good.",
          "Outlook not so good.",
          "Reply hazy, try again.",
          "Signs point to yes.",
          "Very doubtful.",
          "Without a doubt.",
          "Yes.",
          "Yes - definitely.",
          "You may rely on it.",
        ];

        var question = args.join(" ");
        var answer = responses[Math.floor(Math.random() * responses.length)];

        sendFeedbackGlobal(
          `🎱 [bold]${userInfo.name}[/bold] asked: "[italic]${question}[/italic]"[br]The magic 8-ball says: [bold]${answer}[/bold]`,
        );

        return CommandHandler.HIDE_MESSAGE;
      },
      "<question>[br]Asks the magic 8-ball a question.",
      false, // false = for everyone!
    );

    // ;mute - The "timeout" command (now handles spaces)
    addCommand(
      "mute",
      function (args, userInfo, senderClient) {
        if (args.length === 0) {
          sendFeedbackLocal(senderClient, "Usage: ;mute <Username> <Minutes>");
          return;
        }

        var minutes = 5; // Default
        var nameToSearch;

        // Check if the last argument is a number (for time)
        var lastArg = args[args.length - 1];
        var parsedMinutes = parseFloat(lastArg);

        if (!isNaN(parsedMinutes) && parsedMinutes > 0) {
          // Last arg IS a time
          minutes = parsedMinutes;
          nameToSearch = args.slice(0, args.length - 1).join(" "); // All args *except* the last one
        } else {
          // Last arg is NOT a time, so it's part of the name
          minutes = 5; // Use default time
          nameToSearch = args.join(" "); // All args are the name
        }

        if (nameToSearch.length === 0) {
          sendFeedbackLocal(
            senderClient,
            "No user specified. Usage: ;mute <Username> <Minutes>",
          );
          return;
        }

        // Now, search with the *full name*
        var foundClients = searchUsersByKey(nameToSearch, senderClient);
        if (foundClients.length === 0) {
          sendFeedbackLocal(
            senderClient,
            "User not found: '" + nameToSearch + "'",
          );
          return;
        }

        var durationMs = minutes * 60 * 1000;

        foundClients.forEach((client) => {
          client._rrMutedUntil = Date.now() + durationMs;

          var targetInfo = getUserInfo(client);
          sendFeedbackGlobal(
            `[bold]${targetInfo.displayName}[/bold] has been muted for ${minutes} minute(s).`,
          );
          sendFeedbackLocal(
            client,
            `[bold][color css=red]You have been muted for ${minutes} minute(s) by an owner.[/color][/bold]`,
          );
        });
      },
      "<Username> <Minutes>[br]Mutes a user, preventing them from sending any messages or commands. Defaults to 5 minutes.",
      true, // true = owner only!
    );

    // ;unmute - The command to undo the mute (now handles spaces)
    addCommand(
      "unmute",
      function (args, userInfo, senderClient) {
        if (args.length === 0) {
          sendFeedbackLocal(senderClient, "Usage: ;unmute <Username>");
          return;
        }

        var nameToSearch = args.join(" "); // All args are the name
        var foundClients = searchUsersByKey(nameToSearch, senderClient);

        if (foundClients.length === 0) {
          sendFeedbackLocal(
            senderClient,
            "User not found: '" + nameToSearch + "'",
          );
          return;
        }

        foundClients.forEach((client) => {
          client._rrMutedUntil = null; // Clear the mute

          var targetInfo = getUserInfo(client);
          sendFeedbackGlobal(
            `[bold]${targetInfo.displayName}[/bold] has been unmuted.`,
          );
          sendFeedbackLocal(
            client,
            `[bold][color css=green]You have been unmuted by an owner.[/color][/bold]`,
          );
        });
      },
      "<Username>[br]Unmutes a user.",
      true, // true = owner only!
    );

    //;67 - don't do it
    addCommand(
      "67",
      function (args, userInfo, senderClient) {
        sendClientCommand(senderClient, "kick");
        sendFeedbackGlobal(`${userInfo.displayName} had six sevened the way out of the room`);
        senderClient.close();
      },
      "Six seven",
      false
    );

    addCommand(
      "Australian",
      function (args,userInfo,senderClient) {
        var nameToSearch = args[0];
        var foundClients = searchUsersByKey(nameToSearch, senderClient);

        foundClients.forEach((client) => {
          addUserMessageFilter(client, "australian_filter", function (originalMessage) {
            var message = "" + originalMessage; //Make sure its string.
            
            function safeFindAndReplace(str, find, replace) {
              var escapedFind = find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
              var regex = new RegExp(escapedFind, 'gi');
              return str.replace(regex, replace);
            }

            var bro_replace = "mate";
            var bro_words = ["bro", "friend", "dude", "bruh", "bru", "brother", "man"];
            var hello_replace = "Oi";
            var hello_words = ["hi", "hello", "hey"];

            for (var targetWord of bro_words) {
              message = safeFindAndReplace(message, targetWord, bro_replace);
            }

            for (var targetWord of hello_words) {
              message = safeFindAndReplace(message, targetWord, hello_replace);
            }

            return "[australian]" + message; //australian bracket applies the upside down username effect to users
          });
        });
        
        return CommandHandler.HIDE_MESSAGE;
      },
      "",
      true
    )

    ////////////////////////////////////////////////////
  }

  sendClientCommand(client, type, ...args) {
    //Allows certian commands that need browser behavior.
    client.send(
      JSON.stringify({
        type: "commandToClient",
        cType: type,
        args,
      }),
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
          client,
        );
        return output;
      } catch (e) {
        console.log(
          `[Command warning]: Command ${commandName} failed with error ${e}`,
        );
      }
    } else {
      this.sendFeedbackLocal(
        client,
        `Unable to find command "${commandName}". Remember commands are case sensitive.`,
      );
    }
  }

  getUserInfo(client) {
    return {
      displayName: client._rrDisplayName,
      username: client._rrUsername,
      name: client._rrDisplayName || client._rrUsername,
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

    // --- @ commands are the same ---
    if (lowercaseKey == "@all") {
      return clients;
    }
    if (lowercaseKey == "@others") {
      var otherClients = [];
      for (var client of clients) {
        if (client._rrConnectionID !== senderClient._rrConnectionID) {
          otherClients.push(client);
        }
      }
      return otherClients;
    }
    if (lowercaseKey == "@me" || lowercaseKey == "@self") {
      return [senderClient];
    }

    var foundClients = [];
    for (var client of clients) {
      var info = this.getUserInfo(client);

      if (info.username) {
        var lowercaseUsername = info.username.toLowerCase().trim();
        if (lowercaseUsername == lowercaseKey) {
          foundClients.push(client);
          continue;
        }
      }

      if (info.displayName && !info.loggedOn) {
        var lowercaseDisplayName = info.displayName.toLowerCase().trim();
        if (lowercaseDisplayName == lowercaseKey) {
          foundClients.push(client);
        }
      }
    }
    return foundClients; // Return an array of all matches
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

    if (client._rrMutedUntil && client._rrMutedUntil > Date.now()) {
      // User is muted. Send them a reminder and stop processing their message.
      var timeLeft = Math.ceil((client._rrMutedUntil - Date.now()) / 1000 / 60);
      this.sendFeedbackLocal(
        client,
        `[bold][color css=red]You are muted. You cannot send messages or commands for ${timeLeft} more minute(s).[/color][/bold]`,
      );
      return CommandHandler.HIDE_MESSAGE; // Stop here!
    } else if (client._rrMutedUntil) {
      // Mute expired, clear it
      client._rrMutedUntil = null;
    }

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
        }),
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
        }),
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
          }),
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
          }),
        );
      }
    }
  }

  addUserMessageFilter(client,id,func) {
    client._rrUserFilters["commands_"+id] = func;
  }

  removeUserMessageFilter(client,id,func) {
    delete client._rrUserFilters["commands_"+id];
  }
}

module.exports = CommandHandler;
