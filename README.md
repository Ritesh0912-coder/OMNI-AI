# OMNI / Synapse AI - Frontend Architecture

> **Current Status:** Frontend Complete (v1.0) | **Next Phase:** Backend Development

## 🧠 Project Overview
**Synapse AI** is a premium, high-performance AI ecosystem designed for enterprise-grade intelligence. The application features a sophisticated, emerald-themed interface that unifies chat, browsing, and strategic analysis into a single "Neural Link."

## 🎨 Frontend Features (Completed)

### 1. **Neural Interface (Landing Page)**
- **Route:** `/`
- **Tech:** Framer Motion, Tailwind CSS
- **Features:**
  - Dynamic Hero section with neural animations (`LightRays`).
  - "Smart Solutions" grid showcasing enterprise capabilities.
  - Interactive "Real World Strategies" and Testimonials modules.
  - Fully responsive Navbar and Footer with cohesive branding.

### 2. **Synapse Chat Core**
- **Route:** `/chat`
- **Identity:** The central intelligence hub.
- **Key Features:**
  - **Dynamic Sidebar:** Collapsible, overlay-based navigation that preserves layout fluidly.
  - **Prompt Quota System:** Limits free users to **50 prompts/day** with real-time tracking.
  - **Smart Formatting:** Renders Markdown, lists, and code blocks beautifully.
  - **Auto-Upgrade Logic:** Triggers a "Quota Exhausted" modal at zero prompts, guiding users to Premium.

### 3. **Synapse Neural Browser**
- **Route:** `/browser`
- **Concept:** A simulated, privacy-first web browser within the app.
- **Key Features:**
  - **Tabbed Browsing:** Create, close, and switch between virtual tabs.
  - **Search Simulation:** Address bar simulating URL navigation and search queries.
  - **Data Persistence:** Mock implementations of **History** and **Bookmarks** (stored in `localStorage`).
  - **"Thesys" to "Synapse" Rebrand:** Fully updated branding logic across the interface.

### 4. **Premium Access Hub**
- **Route:** `/premium`
- **Design:** High-end pricing page with glassmorphism effects.
- **Tiers:**
  - **Free Tier:** Basic access (50 prompts).
  - **Pro Neural:** Advanced reasoning & priority queues.
  - **Titan AI:** Unlimited autonomous agents & API access.

### 5. **Additional Pages**
- **Services (`/services`):** Detailed breakdown of AI ecosystem offerings.
- **About (`/about`):** Corporate mission, "Collective" team section, and values.
- **Authentication (`/sign-in`):** Styled login interfaces.

### 6. **Micro-Interactions & Visual System**
A key differentiator of Synapse AI is the unparalleled attention to detail:

*   **Custom Color Ecosystem:** A bespoke **Emerald Green (`#00ff66`)** palette defines the brand, acting as the "energy source" against a deep void black background.
*   **Glassmorphism Engine:** Custom CSS utilities (`.glass`, `.glass-card`) create a frosted, multi-layered UI depth that feels tangible.
*   **"Matrix" Text Decoding:** A custom `TextDecode` component scrambles and reveals headers character-by-character for a cybernetic effect.
*   **Physics-Based Motion:** Frame Motion integration provides spring-physics animations (e.g., the chat sidebar), giving UI elements real weight and momentum.
*   **Infinite Immersion:** Custom scrollbar hiding techniques (`.scrollbar-hide`) ensure the interface looks like a native app, not a website.
*   **Optimistic Neural Navigation:** The browser interface simulates instant page loads by updating the UI state *before* background processes finish, creating a zero-latency feel.

---

## 🛠️ Technology Stack
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Custom Emerald Theme
- **Animations:** Framer Motion (Complex layout transitions, springs, presence)
- **Icons:** Lucide React

---

## 🚀 Moving to Backend (Python)
The frontend interface is fully polished. The next phase focuses on building a robust **Python Backend** to power the intelligence:

- [ ] **API Framework:** Setting up **FastAPI** or **Django** for high-performance AI services.
- [ ] **AI Orchestration:** Integrating advanced LLM chains (LangChain/LlamaIndex) for the "Neural" reasoning.
- [ ] **Data Layer:** transitioning from local storage to PostgreSQL/Vector Databases (Pinecone/Weaviate).
- [ ] **Authentication:** JWT-based secure handshakes between the Next.js frontend and Python backend.
