# 🎓 UniTrade

> A centralized, cross-platform peer-to-peer marketplace exclusively for university students — buy, sell, and exchange used academic materials in a secure, gated environment.

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" />
  <img src="https://img.shields.io/badge/Material_UI-007FFF?style=for-the-badge&logo=mui&logoColor=white" />
  <img src="https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white" />
</p>

---

## 📋 Table of Contents

- [About the Project](#-about-the-project)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the App](#running-the-app)
- [Database Schema](#-database-schema)
- [Firebase Architecture](#-firebase-architecture)
- [Team](#-team)
- [Roadmap](#-roadmap)
- [License](#-license)

---

## 📖 About the Project

UniTrade is built to ease the financial burden on university students by giving them a trusted, gated space to trade academic resources — textbooks, lab equipment, notes, and more. Access is restricted to verified university emails (`.edu.eg`), ensuring a safe community of real students only.

The platform runs across **three interfaces** powered entirely by **Firebase**:

| Interface | Technology |
|---|---|
| 🌐 Web App | React (Vite) + Material UI |
| 📱 Mobile App | React Native (Expo) |
| 🛡️ Admin Dashboard | React (Vite) + Material UI |

---

## ✨ Features

### 🔐 Authentication
- University email verification (`.edu.eg` domain enforced via Firebase Cloud Functions)
- Email & password sign up / sign in
- Block unverified logins until email is confirmed
- Protected routes on Web and navigation guards on Mobile

### 👤 Profile
- Complete profile setup after first login (Name, Faculty, WhatsApp number, Profile picture)
- Upload profile picture to Firebase Storage
- View and edit profile at any time

### 📦 Product Listings
- Post listings with title, description, price, condition, and academic category
- Upload up to 5 product images (Firebase Storage)
- Edit and delete your own listings
- Mark items as **Sold**

### 🏠 Browse & Discovery
- Marketplace home page with product grid (newest first)
- Browse by academic category (Engineering, Medical, Tech, Science…)
- Product detail page with image gallery and seller info

### 🔍 Search & Filter
- Keyword search on product titles
- Filter by category, condition (New / Like New / Used), and price range
- Sort by newest, price low→high, price high→low
- Composite Firestore indexes for combined filters

### ❤️ Favourites
- Save and unsave products with a heart button
- Dedicated Favourites page / screen

### 🛒 Cart & WhatsApp Checkout
- Add items to cart (stored in user document)
- Cart items automatically grouped by seller
- One-tap checkout generates a pre-formatted WhatsApp message with all items and total price
- Opens WhatsApp directly via deep link (`wa.me/`)

### 🛡️ Admin Dashboard
- Role-based access (`role: 'Admin'`)
- View platform stats (total users, listings, sold items)
- Manage users and listings (view + delete)

### 🤖 AI Feature *(Week 6)*
- Upload a product image → AI (Gemini / OpenAI Vision) auto-suggests title, description, and price
- Powered by Firebase Cloud Functions

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Web Frontend | React 18, Vite, React Router, Material UI (MUI) |
| Mobile App | React Native, Expo, React Navigation |
| Admin Dashboard | React 18, Vite, Material UI (MUI) |
| Backend | Firebase Cloud Functions (Node.js) |
| Database | Cloud Firestore (NoSQL) |
| Authentication | Firebase Authentication |
| File Storage | Firebase Storage |
| Hosting | Firebase Hosting (Web + Dashboard) |
| Search | Firestore queries + client-side filtering (Algolia optional) |

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) v18+
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/) — `npm install -g expo-cli`
- [Firebase CLI](https://firebase.google.com/docs/cli) — `npm install -g firebase-tools`

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/MohamedAbobakr277/UniTrade.git
cd UniTrade
git checkout Testing
```

**2. Install dependencies for each sub-project**

```bash
# Web App
cd web && npm install

# Mobile App
cd ../mobile && npm install

# Admin Dashboard
cd ../dashboard && npm install

# Firebase Cloud Functions
cd ../functions && npm install
```

### Environment Variables

Create a `.env` file in each of the `web/`, `mobile/`, and `dashboard/` directories. Copy the values from your Firebase project settings.

**`web/.env` and `dashboard/.env`**
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

**`mobile/.env`**
```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

> ⚠️ Never commit `.env` files to GitHub. They are already listed in `.gitignore`.

---

## 🗄️ Database Schema

UniTrade uses **Cloud Firestore** with the following collections:

### `users` collection
```
users/{uid}
├── uid              String    Firebase Auth UID
├── fullName         String
├── universityEmail  String    Must be .edu.eg
├── faculty          String    e.g. "Faculty of Engineering"
├── whatsappNumber   String    International format
├── profilePicUrl    String    Firebase Storage URL
├── role             String    "Student" | "Admin"
├── cart             Array     [{ productId, quantity }]
├── favourites       Array     [productId, ...]
└── createdAt        Timestamp
```

### `products` collection
```
products/{productId}
├── sellerId         String    References users/{uid}
├── title            String
├── description      String
├── price            Number    EGP
├── condition        String    "New" | "Like New" | "Used"
├── category         String    "Engineering" | "Medical" | "Tech" | "Science"
├── imageUrls        Array     Firebase Storage URLs
├── status           String    "Available" | "Sold"
└── createdAt        Timestamp
```

---

## 🔥 Firebase Architecture

```
Firebase Project
├── Authentication        Email/Password + university domain enforcement
├── Cloud Firestore       Main database (users + products)
├── Firebase Storage      Profile pictures + product images
├── Cloud Functions
│   ├── beforeCreate      Validates .edu.eg email on registration
│   ├── deleteUser        Admin-only: delete user + auth record
│   ├── deleteProduct     Admin-only: delete any listing
│   ├── getStats          Returns platform-wide counts
│   └── aiSuggest         Calls Gemini/OpenAI Vision, returns title + desc + price
└── Firebase Hosting      Hosts Web App + Admin Dashboard
```

### Firestore Security Rules (summary)

- Users can only **read and write their own** user document
- Any authenticated user can **read** available products
- Users can only **edit or delete their own** products
- Only users with `role == 'Admin'` can access admin Cloud Functions

---

## 👥 Team

| Name | Role |
|---|---|
| **Mohamed Abobakr Ahmed** | Lead / PM / Full Stack |
| **Mohamed Ahmed Abobakr** | Frontend Developer (Web) |
| **Abdallah Mahmoud** | Backend Developer |
| **Ahmed Emad** | Backend Developer |
| **Ahmed Sayed** | Mobile Developer |
| **Ahmed Emad** | Mobile Developer |

---

## 🗺️ Roadmap

- [x] **Week 1** — Sign In & Sign Up (Firebase Auth, Web & Mobile)
- [x] **Week 2** — Profile Setup, Admin Dashboard & Add Item
- [ ] **Week 3** — Home Page & Category browsing
- [ ] **Week 4** — Search & Filter
- [ ] **Week 5** — Favourites & WhatsApp Checkout
- [ ] **Week 6** — AI auto-suggest, Refinement & Deployment

---

## 📄 License

This project was built as a university project. All rights reserved © UniTrade Team 2025.

---

<p align="center">Made with ❤️ by the UniTrade Team</p>
