const CHAT_PATH = "/chat";
const APP_NAME = "Random Rants +";
const DEFAULT_TAG = "randomrants-plus";

var origin = "" + self.location.origin;
origin = origin.trim();
if (origin.endsWith("/")) {
  origin = origin.slice(0, origin.length - 1); //remove the ending slash.
}

async function isUserSubscribed() {
  const subscription = await self.registration.pushManager.getSubscription();
  return !!subscription; // returns true if subscription exists, false otherwise
}

self.addEventListener("push", async (event) => {
  event.waitUntil(handlePush(event));
});

async function sendPushNotification({
  title = APP_NAME,
  body = "",
  icon = "/images/push-notify-icon.png",
  tag = DEFAULT_TAG,
  data = {},
}) {
  await self.registration.showNotification(title, {
    body: body,
    icon: icon,
    badge: icon,
    tag: tag, // Replaces old invites in the tray
    renotify: true, // Always popup/sound even if tag matches
    requireInteraction: true, // Force it to stay visible on Chromebooks
    data: data,
  });
}

async function handleNotification(json) {
  if (json.type == "test") {
    sendPushNotification({
      body: "This is test notification",
    });
    return;
  }
  if (json.type == "invite") {
    var from = json.from;
    var roomName = json.roomName;
    var roomID = json.roomID;

    var targetURL = origin + CHAT_PATH + "#" + roomID;

    sendPushNotification({
      title: "Random Rants + | New Invite!",
      body: `@${from} has invited you to room "${roomName}"! Click to join!`,
      data: {
        targetURL,
      },
    });

    return;
  }
}

async function handlePush(event) {
  const clientList = await clients.matchAll({
    type: "window",
    includeUncontrolled: true,
  });

  const isInsideChat = clientList.some((client) => {
    const url = new URL(client.url);
    return (
      url.pathname.startsWith("/chat") && client.visibilityState === "visible"
    );
  });

  // Parse the data sent from your Node.js server
  var json = null;
  if (event.data) {
    json = event.data.json();
  } else {
    return;
  }

  await handleNotification(json);
}

function buildWsNotifyURL() {
  var protocol = self.location.protocol === "https:" ? "wss://" : "ws://";
  var wsUrl = `${protocol}${self.location.host}/notifications`;
  return wsUrl;
}

// 2. Handle Notification Clicks
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(handleNotificationClick(event));
});

async function handleNotificationClick(event) {
  const targetURL = event.notification.data.targetURL;
  if (!targetURL) {
    return;
  }
  const clientList = await clients.matchAll({
    type: "window",
    includeUncontrolled: true,
  });

  // If the room is already open in a tab, just focus it
  for (const client of clientList) {
    if (client.url === targetURL && "focus" in client) {
      return client.focus();
    }
  }

  // Otherwise, open a new window to that room
  if (clients.openWindow) {
    return clients.openWindow(targetURL);
  }
}

// 3. Lifecycle Management
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

async function sendInitialNotifcations() {
  var ws = new WebSocket(wsUrl);

  setTimeout(() => {
    try {
    } catch (e) {
      ws.close();
    }
  }, 2000);

  ws.onmessage = async function (event) {
    var json = JSON.parse(event.data);

    if (json.type == "current") {
      for (const notif of json.notifications) {
        await handleNotification(notif);
      }
    }
  };
}

self.addEventListener("message", async (event) => {
  if (event.data && event.data.type === "HEARTBEAT") {
    var cache = await caches.open("rr-meta");
    // Save the current timestamp
    await cache.put("last-seen-online", new Response(Date.now().toString()));
  } else if (event.data && event.data.type === "NOTIFY") {
    await sendPushNotification(event.data.payload);
  }
});

async function checkReEngagement() {
  var THREE_DAYS = 3 * 24 * 60 * 60 * 1000;
  var now = Date.now();

  var cache = await caches.open("rr-meta");
  var lastSeenResponse = await cache.match("last-seen-online");

  if (lastSeenResponse) {
    var lastSeen = parseInt(await lastSeenResponse.text());

    // If it's been more than 3 days since the last HEARTBEAT
    if (now - lastSeen > THREE_DAYS) {
      await sendPushNotification({
        title: "Missing the chaos?",
        body: "Your friends haven't seen you in a while! Jump back into the rants.",
        tag: "re-engage",
        data: { targetURL: "/chat" },
      });

      // Update timestamp so we don't nag them again for another 3 days
      await cache.put("last-seen-online", new Response(now.toString()));
    }
  }
}

var hasRunStartupCheck = false;

self.addEventListener("activate", (event) => {
  event.waitUntil(async () => {
    await clients.claim();

    if (!(await isUserSubscribed())) {
      return;
    }

    if (hasRunStartupCheck) return; // Skip if already done this session
    hasRunStartupCheck = true;

    await sendInitialNotifcations();
    await checkReEngagement();
  });
});
