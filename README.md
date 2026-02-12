[![Random Rants +](./wpstatic/images/randomrants-plus.svg)](https://randomrants-plus.onrender.com)

# Random Rants +

> **The page nobody reads, but you should.**

**Random Rants +** is the next generation of Random Rants—a goofy, chaotic site that lets you hang out with your friends online. Aimed at students needing a break or anyone who enjoys small bursts of chaos, this is the place to escape reality and enter the internet.

It features video chat, soundboards, and interactive media, all designed so you don't get bored easily.

> **⚠️ HOSTING UPDATE:**
> **Glitch.com is no longer hosting projects.** This means our old instances don't work there anymore. We have switched to **Render.com** to run Random Rants +.

---

## 🌟 Features

* **Video & Voice Chat:** Powered by WebRTC (P2P). No sus servers watching your face.
* **Screen Sharing:** One share per room. Expect battles for dominance.
* **Chat + Commands:** Use `;help` to see owner commands.
* **Soundboard:** Synced memes and goofy noises. (RIP headphone users).
* **Interactive Media:** A virtual TV that handles embedded sites, shared painting canvases, and Scratch cloud mini-games (via modified TurboWarp).
* **File Uploads:** Drop memes, cursed content, or files directly into the chat.
* **Custom Profiles:** Change your display name, color, pfp, and fonts anytime.

---

## 🛠️ Installation & Building

Want to run your own instance? Follow these steps.

### 1. Prerequisites: Supabase
**Do not skip this.** You must create a Supabase project to run the server.

_(Create a .env file if you don't want to add enviroment variables to your machine)_

Create a project at [supabase.com](https://supabase.com) and gather the following environment variables:

* `sbBucket`: Your Supabase storage bucket name.
* `sbAPIKey`: Your Supabase Secret Key (recommended) or API Key.
* `sbURL`: Your Supabase project URL (e.g., `https://projectid.supabase.co`).

**DO NOT SHARE SUPABASE STORAGE API KEYS AND URLS**, these must remain private so that people don't sneak in and change the account data.

#### 1.2 Enviroment variables for Push Notifications.

This step is optional but highly recommended now. If skipped, push notificiations will not work:

Run the terminal command (tested only in github codespaces) to generate the keys: `npm run webpush` or `yarn webpush`.

Example output:
```
=======================================

Public Key:
<YOUR PUSH NOTIFICATIONS PUBLIC KEY>

Private Key:
<YOUR PUSH NOTIFICATIONS PRIVATE KEY>

=======================================
```

Add these enviroment variables:

* `pushWebsite`: The website the server is accesible on. (OPTIONAL, defaults to the random rants + website)

* `publicPushKey`: The public push notifcations key that was in the output of the command above.

* `privatePushKey`: The private push notifcations key that was in the output of the command above. (DO NOT SHARE THE KEY)

### 2. Local Setup
I recommend using **Node.js 16.x**.

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Random-Rants-Chat/randomrants-plus.git
    cd randomrants-plus
    ```
    *(Or download the ZIP file and extract it).*

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Build the website:**
    ```bash
    npm run build
    ```

### 3. Running the Server

* **Production Start:**
    ```bash
    npm run start
    ```
* **Development (Auto-reload):**
    ```bash
    npm run development
    ```
    *Note: The development command works for both building and server code.*

Once running, go to `http://localhost:3000/` to see the functional Random Rants + site in action.

---

## 👥 Credits

* **Gvbvdxx:** Creator. Obsessed with code. Sacrificed education and homework to make this site. Banned from [Scratch](https://scratch.mit.edu) for making chat sites. Responsible for almost all the programming (with some help from ChatGPT & Gemini).
* **MOP 3000 (aka Im_CatmanYT):** The Idea Guy. Came up with the concept of Random Rants. A 2D animator obsessed with animation.

---

## 📛 The Badge Wall

[![forthebadge](https://forthebadge.com/images/badges/built-by-developers.svg)](https://forthebadge.com)
[![forthebadge](https://forthebadge.com/images/badges/contains-tasty-spaghetti-code.svg)](https://forthebadge.com)
[![forthebadge](https://forthebadge.com/images/badges/ctrl-c-ctrl-v.svg)](https://forthebadge.com)
[![forthebadge](https://forthebadge.com/images/badges/designed-in-ms-paint.svg)](https://forthebadge.com)
[![forthebadge](https://forthebadge.com/images/badges/not-a-bug-a-feature.svg)](https://forthebadge.com)
[![forthebadge](https://forthebadge.com/images/badges/works-on-my-machine.svg)](https://forthebadge.com)
[![forthebadge](https://forthebadge.com/images/badges/you-didnt-ask-for-this.svg)](https://forthebadge.com)
[![forthebadge](https://forthebadge.com/images/badges/0-percent-optimized.svg)](https://forthebadge.com)
[![forthebadge](https://forthebadge.com/images/badges/60-percent-of-the-time-works-every-time.svg)](https://forthebadge.com)
[![forthebadge](https://forthebadge.com/images/badges/powered-by-jeffs-keyboard.svg)](https://forthebadge.com)
[![forthebadge](https://forthebadge.com/images/badges/powered-by-electricity.svg)](https://forthebadge.com)
[![forthebadge](https://forthebadge.com/images/badges/uses-brains.svg)](https://forthebadge.com)
