const CHAT_PATH = "/chat";
const APP_NAME = "Random Rants +";
const DEFAULT_TAG = "randomrants-plus";

self.addEventListener('push', async (event) => {
  event.waitUntil(handlePush(event));
});

async function sendPushNotification({title = APP_NAME, body = "", icon = "/images/push-notify-icon.png", tag = DEFAULT_TAG, data = {}}) {
    await self.registration.showNotification(title, {
    body: body,
    icon: icon,
    badge: icon,
    tag: tag,         // Replaces old invites in the tray
    renotify: true,           // Always popup/sound even if tag matches
    requireInteraction: true, // Force it to stay visible on Chromebooks
    data: data
  });
}

async function handlePush(event) {
  const clientList = await clients.matchAll({ type: 'window', includeUncontrolled: true });

  const isInsideChat = clientList.some(client => {
    const url = new URL(client.url);
    return url.pathname.startsWith('/chat') && client.visibilityState === 'visible';
  });

  var origin = ""+self.location.origin;
  origin = origin.trim();
  if (origin.endsWith("/")) {
    origin = origin.slice(0,origin.length-1); //remove the ending slash.
  }

  // Parse the data sent from your Node.js server
  var json = null;
  if (event.data) {
    json = event.data.json();
  } else {
    return;
  }

  if (json.type == "test") {
    sendPushNotification({
        body: "This is test notification"
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
        targetURL
      }
    });

    return;
  }
}

// 2. Handle Notification Clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(handleNotificationClick(event));
});

async function handleNotificationClick(event) {
  const targetURL = event.notification.data.targetURL;
  if (!targetURL) {
    return;
  }
  const clientList = await clients.matchAll({ type: 'window', includeUncontrolled: true });

  // If the room is already open in a tab, just focus it
  for (const client of clientList) {
    if (client.url === targetURL && 'focus' in client) {
      return client.focus();
    }
  }

  // Otherwise, open a new window to that room
  if (clients.openWindow) {
    return clients.openWindow(targetURL);
  }
}

// 3. Lifecycle Management
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});