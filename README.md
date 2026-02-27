# MotoLog

MotoLog is a social motorcycle riding platform that combines ride tracking, rider community features, events, and personal bike management in one app.

The main idea is simple: riders should be able to **track rides**, **share progress**, **connect with other riders**, and **organize group activities** without jumping between multiple apps.

---

## Why MotoLog?

Most apps focus on only one thing (tracking, chat, or social feed). MotoLog combines:

- Ride history and statistics
- Bike garage and maintenance records
- Social profiles, followers/following, likes and comments
- Group chat and rider communities
- Local/global event creation and participation
- Mobile app wrapper for iOS using Capacitor

---

## Core Features

### Ride Tracking & History
- Start and save rides
- Store GPS points and route data
- View ride metrics (distance, duration, average speed, top speed)
- Public/private ride visibility
- Ride photos upload support

### Social Layer
- User profiles with avatars and bio
- Follow / unfollow users
- Like and comment on rides
- View followers and following

### Bike Garage
- Add and edit multiple bikes
- Attach bike photos
- Track bike odometer and notes
- Log bike maintenance history

### Groups & Messaging
- Create rider groups
- Add/remove members
- Group chat with read state
- 1:1 direct messages

### Events System
- Create/edit events
- Category-based events
- Local (country-based) or global events
- Join/leave events and participant limits
- Optional GPS coordinates for event location

### Mobile (iOS)
- Capacitor-based iOS wrapper
- Native bridge for camera/geolocation/file features

---

## Tech Stack

**Backend**
- Python + Flask
- SQLite

**Frontend**
- Jinja templates
- HTML/CSS/JavaScript
- Leaflet + OpenStreetMap (map previews)

**Mobile**
- Capacitor (iOS)
- Vite/TypeScript bridge code

---

## Project Structure (simplified)

```
MotoLogv2/
├── app.py                     # Main Flask app
├── templates/                 # Jinja UI pages
├── static/                    # CSS, JS, uploads
├── mobile-app/                # Capacitor iOS wrapper
├── leaderboard-app/           # Separate leaderboard frontend workspace
├── scripts/migrations/        # DB migration scripts
├── requirements.txt           # Python dependencies
└── package.json               # JS tooling (root)
```

---

## Getting Started

### 1) Clone
```bash
git clone https://github.com/NpKOI/MotoLog.git
cd MotoLogv2
```

### 2) Python environment
```bash
python -m venv .venv
source .venv/bin/activate   # macOS/Linux
pip install -r requirements.txt
```

### 3) Run the web app
```bash
python app.py
```

Then open: `http://127.0.0.1:5000`

---

## Mobile iOS Build (Capacitor)

From `mobile-app/`:

```bash
npm install
npm run build
npx cap sync ios
npx cap open ios
```

Build and run from Xcode.

---

## Current Status

MotoLog is an active project focused on:

- Stability and bug fixing
- Better mobile UX
- Better event management flow
- Better profile and group management

---

## Roadmap

- Multilingual UI support (API-assisted translation + manual overrides)
- Better notifications and activity feed
- Enhanced route visualization and analytics
- App Store release preparation

---

## Contributing

Contributions, bug reports, and feature suggestions are welcome.

If you want to contribute:
- Fork the repo
- Create a feature branch
- Open a pull request with a clear description

---

## License

This project is licensed under the GNU GPL v3.

