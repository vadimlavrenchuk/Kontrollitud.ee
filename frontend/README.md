Kontrollitud.ee
A Modern Business Directory & Review Platform for Estonia

Kontrollitud.ee is a high-performance web application designed to bridge the gap between local businesses and customers. It features a robust automated moderation system, multi-language support, and a seamless user experience.

🚀 Key Features
Smart Automated Moderation: A 4-layer system that filters spam, profanity, and bots using keyword analysis, user trust scores (Trusted Badges), and rate limiting.

Dynamic Business Catalog: Interactive map integration (Leaflet/Mapbox) with real-time filtering by category and city.

Advanced Review System: Real-time rating calculation and review management.

Cloudinary Integration: Dynamic image uploading and optimization for business profiles.

Multi-language Support: Fully localized UI in Estonian (ET), English (EN), and Russian (RU).

SEO Optimized: Search-engine-friendly URLs (Slugs) for every business profile.

🛠 Tech Stack
Frontend
React + Vite: For a lightning-fast development experience and optimized production builds.

Tailwind CSS: Modern, responsive styling with a focus on mobile-first design.

React Router: Clean navigation with SEO-friendly URL patterns.

Backend & Infrastructure
Firebase / Firestore: NoSQL real-time database for high scalability.

Docker: Fully containerized environment ensuring "it works on my machine" consistency.

Cloudinary API: Cloud-based image management for fast content delivery.

🛡️ Moderation Architecture (The "Secret Sauce")
To ensure high-quality content without manual overhead, I implemented a hybrid moderation engine:

Blacklist Filter: Blocks 60+ common spam/profanity patterns across 3 languages.

Auto-Approval Logic: Validates length, character types, and prevents URL injection.

Trust System: Users with a history of positive contributions receive a "Trusted" badge, bypassing manual checks.

Anti-Flood Protection: Strict rate-limiting and cooldowns on the database level (Firestore Rules).

🔧 Installation & Setup
Clone the repository:

Bash

git clone https://github.com/your-username/kontrollitud.git
Set up Environment Variables: Create a .env file with your Firebase and Cloudinary credentials.

Run with Docker:

Bash

docker-compose up --build
Access the app: Open http://localhost:3000

📈 Roadmap
[x] Automated moderation system

[x] SEO-friendly Slugs & Multilingual UI

[ ] Deployment to Production (In progress)

[ ] Business Owner Dashboard for self-management

[ ] User Favorites & Bookmarks

## 📸 Preview

### Main Interface
![Main Page](assets/main-page.png)
*The landing page featuring our mission, statistics, and quick access to the business catalog.*

### Business Management
![Business List](assets/business-list.png)
*A clean, tabular view for administrators to manage verified listings, monitor ratings, and update content.*

![Admin Dashboard](assets/admin-dashboard.png)
*Managing business listings and moderation status*

![Review System](assets/review-system.png)
*User-friendly review and rating interface*

## 📧 Contact

For questions, suggestions, or collaboration opportunities:

- **Project Email**: contact@kontrollitud.ee
- **GitHub Issues**: [Open an issue](https://github.com/vadimlavrenchuk/kontrollitud/issues)
- **Website**: [kontrollitud.ee](https://kontrollitud.ee)

## 📄 License

This project is licensed under the MIT License. See LICENSE file for details.

---

**Built with ❤️ for the Estonian business community**