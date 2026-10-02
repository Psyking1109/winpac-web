# WINPAC website

Vue 3 front end, Node.js/Express server and a SQLite database, with an admin panel and a light/dark mode switch.

Everything the site stores lives in one folder, `data/`:

- `data/winpac.db` holds all products, brands and details.
- `data/uploads/` holds all photos and logos.
- `data/backups/` holds the backups you make.

To back up the site, copy that folder.

## Free test launch (about 10 minutes)

This runs the site on your own computer and gives you a free public **https** link, through Cloudflare. Anyone can open the link on their phone or computer while your computer is on.

1. **Install Node.js.** Download the **LTS** version from https://nodejs.org and install it with the default options. You need Node.js 22.13 or newer.
2. **Unzip** this folder somewhere, for example on your Desktop.
3. **Start it:**
   - **Windows:** double-click `start-test.bat`.
   - **Mac:** open Terminal, type `bash `, drag `start-test.sh` into the window and press Enter.
4. **The first time only**, it installs the parts it needs and asks you to create the **admin username and password**. Type them and press Enter.
5. The site opens in your browser at http://localhost:8080.
6. A few seconds later the window shows a line like `https://something-random.trycloudflare.com`. **That is your public link.** Send it to anyone to test the site.

**Things to know about the test link:**

- The site is online only while that window is open and your computer is awake. Close the window to take it offline.
- You get a new random link each time you start it.
- Your products and photos are kept in `data/` between runs.
- To go into the admin, click the faint lock icon in the footer's bottom-right corner, or go to `/admin`.

## Permanent website

When you're ready for `winpac.lk`, use a small cloud server (about USD 5–6 a month) with Docker:

1. Create an Ubuntu 24.04 server and install Docker: `curl -fsSL https://get.docker.com | sh`
2. Point your domain's **A records** (`@` and `www`) to the server's IP address.
3. Copy this folder to the server, then run:
   ```
   cp .env.example .env
   nano .env                    # set DOMAIN, JWT_SECRET, ADMIN_USERNAME, ADMIN_PASSWORD
   docker compose up -d --build
   ```
4. Caddy gets a free HTTPS certificate automatically. The site is live at `https://your-domain`.

Any host that runs Node.js 22 and keeps files between restarts also works. Run `npm install && npm run build`, then `npm start`.

**Don't** use hosts that wipe their disk on restart, such as the free tier of Render or Koyeb. Your products and photos would be lost.

## Useful commands

| Task | Command |
|---|---|
| Change the admin password, or add an admin | `npm run create-admin -- admin NewPassword123` |
| Back up the database | `npm run backup`, then also copy `data/uploads` |
| Edit the site's code with live reload | `npm install`, then `npm run dev`, then open http://localhost:5173 |
| Rebuild after code changes | `npm run build` |

With Docker, put `docker compose exec web` in front of these commands. For example:
`docker compose exec web node server/create-admin.js admin NewPassword123`

## Project layout

```
client/              Vue app (already built into client/dist)
server/index.js      API, admin sign-in, uploads, serves the site
server/db.js         SQLite storage and field rules
server/seed*.        Starting content: company details, ranges, brands and logos
server/setup.js      First-run setup used by start-test
start-test.bat/.sh   Free test launch with a public link
```

## Security

- **Admin sign-in:** passwords are hashed with bcrypt. The session is an HttpOnly, SameSite=Strict cookie that lasts 12 hours.
- **Sign-in limit:** 10 attempts per 15 minutes from one address.
- **Changes from other sites:** requests that change data must carry the site's own request header, so other websites can't send changes.
- **Uploads:** only real JPG, PNG and WEBP images up to 8 MB are accepted, checked by their contents.
- **Stored data:** only known fields are saved, and links must start with `http(s)://`.
- **Images:** product images can only point to this site's own uploads.
- **Database queries:** all use parameters, so typed text can never change a query.
- **Page protections:** strict security headers and a Content-Security-Policy.
