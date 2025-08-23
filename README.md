# VidStream - A Modern, Feature-Rich Video Streaming Platform

**[➡️ Live Demo](https://aistudio.google.com/apps/drive/1hiJE8aLHGU7Ge81itBRHH2sxWiJhrN0B?showPreview=true&showAssistant=true&showCode=true&showTreeView=true)**

VidStream is a full-featured video streaming application inspired by YouTube, built with a modern tech stack and designed for a premium user experience. It goes beyond a simple clone by incorporating a suite of advanced features for creators, viewers, and administrators, all powered by a newly architected, robust, and scalable backend.

---

## ✨ Features

VidStream is packed with features that rival top-tier streaming platforms, providing a complete ecosystem for content creation, consumption, and community interaction.

### For Viewers:
- **🖼️ Modern, Immersive UI:** A stunning dark-mode interface with an **Ambient Mode** that casts a subtle glow from the video onto the background for a captivating viewing experience.
- **⚡ Advanced Custom Player:** Full control over your viewing with on-the-fly **Video Quality** selection, **Playback Speed** controls, and native **Picture-in-Picture (PiP)** support.
- **📜 Interactive Transcripts:** A synchronized, searchable, and clickable transcript allows viewers to follow along, find keywords, and jump to any part of the video.
- **✂️ Community Clips:** Create and share short, 5-15 second clips of your favorite video moments to foster community engagement.
- **🔍 Advanced Search & Filtering:** A dedicated search page with powerful filters for upload date, video duration, and sorting criteria.
- **▶️ Dynamic "Up Next" Queue:** Build and manage a viewing queue on the fly with a sleek, re-orderable panel.
- **📱 Vertical Shorts Player:** An immersive, full-screen player for vertical short-form content with intuitive navigation.
- **📥 Offline Downloads:** Download videos to your device for offline viewing.

### For Creators:
- **🔴 Go Live:** A complete live streaming setup page with camera preview and real-time interactive chat for viewers.
- **💰 Full Monetization Suite:**
    - **Channel Memberships:** Create tiered memberships with exclusive perks and **Members-Only** videos.
    - **Super Thanks:** Viewers can purchase highlighted comments to show extra support.
    - **Merch Store:** A dedicated "Store" tab on channel pages to showcase merchandise.
- **📈 Creator Dashboard:** In-depth analytics on video performance, audience growth, and watch time.
- **⚙️ Advanced Upload & Customization:**
    - **Automatic Processing:** Backend processing simulates FFmpeg to auto-generate thumbnails and transcode videos into multiple resolutions (1080p, 720p, etc.).
    - **VTT Transcript Uploads:** Upload `.vtt` files to provide accessible transcripts for your videos.
    - **Drag-and-Drop Playlist Management:** Easily reorder videos in your playlists.

### For Admins:
- **🛡️ Powerful Admin Dashboard:** A centralized hub for site-wide management.
- **📊 Site-Wide Analytics:** Get a real-time snapshot of total users, videos, views, and more.
- **✅ Content Moderation:**
    - **Reporting Queue:** Review and act on user-submitted reports for videos and comments.
    - **Content Health Score:** Quickly assess video performance and community reception.
    - **Global Comment Search:** Find and remove inappropriate comments across the entire platform.
- **👥 User & Video Management:** View, manage, and delete users or videos directly from the dashboard.

---

## 🚀 Tech Stack

- **Frontend:** React, TypeScript, Tailwind CSS, React Router, Framer Motion
- **Backend:** Node.js, Express.js
- **Database:** LowDB (A lightweight JSON file-based database, perfect for this project's scope)
- **Media Processing (Simulated):** A dedicated service that simulates a real **FFmpeg** pipeline for transcoding, thumbnail generation, and HLS live streaming preparation.

---

## 🛠️ Robust Backend Architecture

The backend has been professionally restructured for scalability, maintainability, and power.

- **Modular Structure:** The code is organized by concern into `api`, `services`, `middleware`, `utils`, and `config` directories.
- **Centralized Routing & Error Handling:** A versioned API (`/api/v1`) with a root router and a global error handler that prevents crashes and ensures consistent error responses.
- **Request Logging:** All incoming requests are logged for easier debugging and monitoring.
- **Static Asset Serving:** The backend now properly serves uploaded media like thumbnails and user avatars.

---

## 🎨 UI/UX Showcase

Here's a glimpse into the modern and intuitive VidStream interface.

| For You Feed | Watch Page (Ambient Mode) |
| :---: | :---: |
| ![Personalized "For You" Feed](./docs/images/01-home-feed.png) | ![Modern Watch Page with Ambient Mode](./docs/images/03-ambient-mode.png) |
| **Live Stream** | **Creator Dashboard** |
| ![Live Stream with Real-Time Chat](./docs/images/04-live-stream.png) | ![Creator Dashboard with Analytics](./docs/images/07-creator-dashboard.png) |
| **Channel Page** | **Upload Page** |
| ![Creator Channel Page](./docs/images/06-channel-page.png) | ![Advanced Upload Interface](./docs/images/08-upload-page.png) |
| **Admin Dashboard** | **Search Page** |
| ![Powerful Admin Dashboard](./docs/images/09-admin-dashboard.png) | ![Advanced Search with Filters](./docs/images/10-search-results.png) |
| **Shorts Player** | **Watch Page (Standard)** |
| ![Immersive Shorts Player](./docs/images/05-shorts-player.png) | ![Watch Page with Custom Controls](./docs/images/02-watch-page.png) |


---

## 🚀 Getting Started

1.  **Dependencies:** Ensure you have Node.js installed.
2.  **Run the Server:** The project is configured to run the backend server automatically.

### Admin Credentials

To access the powerful admin features, log in with the following credentials:
-   **Email:** `admin@vidstream.com`
-   **Password:** `password123`