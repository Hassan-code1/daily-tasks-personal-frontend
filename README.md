# Daily Tasks Calendar — Frontend (React)

A premium, glassmorphic daily tasks management application built with React, Vite, Tailwind CSS v4, and Framer Motion. This frontend offers a fluid, interactive user experience for organizing daily tasks with real-time status tracking.

## ✨ Key Features

- **Premium Glassmorphic UI**: High-fidelity design with dark gradients, blur effects, and ambient orbs.
- **Dynamic 42-Cell Calendar**: Custom grid generation (via `date-fns`) for a comprehensive monthly view.
- **Fluid Animations**: 
  - Staggered grid entry for tiles.
  - Smooth modal transitions and task item reordering.
  - Animated status markers (✔ checkmarks vs task ratios).
  - Respects OS-level `prefers-reduced-motion` settings.
- **Optimistic UI Updates**: Instant task toggling and deletion for a "snappy" feel.
- **Authentication Pages**: User login and registration with animated tab switches.
- **State Management**: Context API for global calendar navigation and authentication persistence.

## 🛠️ Tech Stack

- **Framework**: React 19 (Vite 8)
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **Date Utilities**: Date-fns
- **HTTP Client**: Axios (with JWT interceptors)

## 📦 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16+)
- A running [Daily Tasks Backend](https://github.com/Hassan-code1/daily-tasks-personal-backend)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Hassan-code1/daily-tasks-personal-frontend.git
   cd daily-tasks-personal-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env` file (refer to `.env.example`):
   ```env
   VITE_API_URL=http://localhost:5000
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

---

## 🏗️ Architecture

- **`src/components/`**: Atomic components like `CalendarTile`, `StatusMarker`, and `DayModal`.
- **`src/context/`**: 
  - `AuthContext`: Manages login/logout state and JWT persistence in `localStorage`.
  - `CalendarContext`: Handles month navigation and fetches summary metrics.
- **`src/api/`**: 
  - `tasks.js`: Axios instance with request/response interceptors to handle `Authorization` headers and `401 Unauthorized` redirects automatically.

---


## 📄 License

This project is licensed under the MIT License.
