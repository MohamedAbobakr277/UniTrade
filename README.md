# 🎓 UniTrade

> A centralized, cross-platform peer-to-peer marketplace exclusively for university students — buy, sell, and exchange used academic materials in a secure, university-gated environment.

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" />
  <img src="https://img.shields.io/badge/Material_UI-007FFF?style=for-the-badge&logo=mui&logoColor=white" />
  <img src="https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
</p>

---

## 📋 Table of Contents

- [About the Project](#-about-the-project)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
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

The platform runs across **two interfaces** powered entirely by **Firebase**:

| Interface | Technology |
|---|---|
| 🌐 Web App + Admin Dashboard | React (Vite) + Material UI |
| 📱 Mobile App | React Native (Expo) + TypeScript |

---

## ✨ Features

### 🔐 Authentication
- University email verification (`.edu.eg` domain enforced at sign-up)
- Email & password sign up / sign in
- Block unverified logins until email is confirmed
- Password reset via email
- Protected routes on Web and navigation guards on Mobile (Expo Router)

### 👤 Profile
- Complete profile setup after first login (Name, Faculty, University, WhatsApp number, Profile picture)
- Upload & update profile picture
- View and edit profile at any time
- View your own active listings from your profile

### 📦 Product Listings
- Post listings with title, description, price, condition, category, and university
- Upload product images
- Edit and delete your own listings
- Mark items as **Sold**
- Dedicated **My Listings** page to manage all your posts

### 🏠 Browse & Discovery
- Marketplace home page with product grid (newest first, real-time updates via Firestore)
- Browse by academic category (Engineering, Medical, Tech, Science, Literature…)
- Product detail page with image gallery and seller info

### 🔍 Search & Filter
- Keyword search on product titles and descriptions
- Filter by category, condition (New / Like New / Used / Poor), and price range
- Filter by university
- All filters work together in real-time on the client side

### ❤️ Favourites
- Save and unsave products with a heart button
- Dedicated Favourites page (Web) and screen (Mobile)

### 🛒 Cart & WhatsApp Checkout
- Add items to cart (stored in Firestore user document)
- Cart items automatically grouped by seller
- One-tap checkout generates a pre-formatted WhatsApp message with all items and total price
- Opens WhatsApp directly via deep link (`wa.me/`)

### 👤 Seller Profiles
- View any seller's public profile and all their active listings
- Reach out directly via WhatsApp from the seller profile page

### 🛡️ Admin Dashboard
- Role-based access (`role: 'Admin'`)
- View platform stats (total users, listings, sold items)
- Manage users and listings (view + delete)

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Web Frontend | React 18, Vite, React Router v7, Material UI (MUI) v7, Lucide React |
| Mobile App | React Native 0.81, Expo SDK 54, Expo Router (file-based routing), TypeScript |
| Backend / Auth | Firebase Authentication |
| Database | Cloud Firestore (NoSQL, real-time) |
| File Storage | Firebase Storage / Cloudinary |
| Hosting | Firebase Hosting |

---

## 📁 Project Structure

```
UniTrade/
├── frontend/                  # Web App + Admin Dashboard (React + Vite)
│   └── src/
│       ├── pages/
│       │   ├── Login.jsx
│       │   ├── Signup.jsx
│       │   ├── ResetPassword.jsx
│       │   ├── Home.jsx           # Main marketplace feed
│       │   ├── ItemDetails.jsx    # Product detail view
│       │   ├── SellTool.jsx       # Create / edit listing
│       │   ├── MyListings.jsx     # Manage your posts
│       │   ├── Favourites.jsx
│       │   ├── Profile.jsx
│       │   ├── SellerProfile.jsx
│       │   └── AdminDashboard.jsx
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── Sidebar.jsx        # Filter sidebar
│       │   ├── CategoryBar.jsx
│       │   ├── ItemCard.jsx
│       │   ├── Topsection.jsx
│       │   ├── ProtectedRoute.jsx
│       │   └── ProtectedAdminRoute.jsx
│       ├── services/
│       │   └── auth.js
│       └── firebase.js
│
└── mobile-app/                # React Native App (Expo Router + TypeScript)
    └── app/
        ├── index.tsx          # Login screen
        ├── Home/
        ├── Profile/
        ├── Sell/
        ├── SignUp/
        ├── favorites/
        ├── product/
        ├── forgot-password/
        ├── reset-password/
        └── services/
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) v18+
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Expo Go](https://expo.dev/go) app on your phone (for mobile development)
- [Expo CLI](https://docs.expo.dev/get-started/installation/) — `npm install -g expo-cli`

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/MohamedAbobakr277/UniTrade.git
cd UniTrade
```

**2. Install dependencies for each sub-project**

```bash
# Web App (React + Vite)
cd frontend && npm install

# Mobile App (Expo + React Native)
cd ../mobile-app && npm install
```

### Environment Variables

Create a `.env` file inside the `frontend/` directory with your Firebase project settings.

**`frontend/.env`**
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

For the mobile app, create a `.env` file in `mobile-app/`:

**`mobile-app/.env`**
```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

> ⚠️ Never commit `.env` files to GitHub. They are already listed in `.gitignore`.

### Running the App

**Web App:**
```bash
cd frontend
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

**Mobile App:**
```bash
cd mobile-app
npx expo start
```
Scan the QR code with the **Expo Go** app on your phone, or press `a` for Android emulator / `i` for iOS simulator.

---

## 🗄️ Database Schema

UniTrade uses **Cloud Firestore** with the following collections:

### `users` collection
```
users/{uid}
├── uid              String    Firebase Auth UID
├── fullName         String
├── universityEmail  String    Must be .edu.eg
├── university       String    e.g. "Cairo University"
├── faculty          String    e.g. "Faculty of Engineering"
├── whatsappNumber   String    International format
├── profilePicUrl    String    Storage URL
├── role             String    "Student" | "Admin"
├── cart             Array     [{ productId, ... }]
├── favourites       Array     [productId, ...]
└── createdAt        Timestamp
```

### `products` collection
```
products/{productId}
├── sellerId         String    References users/{uid}
├── sellerName       String
├── title            String
├── description      String
├── price            Number    EGP
├── condition        String    "New" | "Like New" | "Used" | "Poor"
├── category         String    "Engineering" | "Medical" | "Tech" | "Science" | ...
├── university       String    Seller's university
├── imageUrls        Array     Storage URLs
├── status           String    "available" | "sold"
└── createdAt        Timestamp
```

---

## 🔥 Firebase Architecture

```
Firebase Project (unitrade-cc943)
├── Authentication        Email/Password + .edu.eg domain enforcement
├── Cloud Firestore       Main database (users + products, real-time)
└── Firebase Storage      Profile pictures + product images
```

### Firestore Security Rules (summary)

- Users can only **read and write their own** user document
- Any authenticated, email-verified user can **read** available products
- Users can only **edit or delete their own** products
- Only users with `role == 'Admin'` can access admin functionality

---

## 👥 Team

| Name | Role |
|---|---|
| **Mohamed Abobakr Ahmed** | Lead / PM / Full Stack |
| **Mohamed Ahmed Abobakr** | Frontend Developer (Web) |
| **Abdallah Mahmoud Osman** | Backend Developer |
| **Ahmad Emadelden Mohamed** | Backend Developer |
| **Ahmed Sayed Abdallah** | Mobile Developer |
| **Ahmed Emad Abdelmonem** | Mobile Developer |

---

## 🗺️ Roadmap

- [x] **Auth** — Sign In, Sign Up, Email Verification, Password Reset (Web & Mobile)
- [x] **Profile** — Setup, edit, upload photo, view own listings
- [x] **Admin Dashboard** — Platform stats, manage users & listings
- [x] **Sell Tool** — Create, edit, delete product listings
- [x] **Home Feed** — Browse all listings, newest first, real-time updates
- [x] **Category Browsing** — Filter by academic category
- [x] **Search & Filter** — By keyword, category, condition, price range, university
- [x] **Favourites** — Save & unsave items (Web & Mobile)
- [x] **WhatsApp Checkout** — Cart grouped by seller, deep-link to WhatsApp
- [x] **Seller Profiles** — View seller info and their active listings
- [ ] **AI Auto-Suggest** — Upload image → AI suggests title, description & price
- [ ] **Push Notifications** — Notify sellers when someone is interested
- [ ] **Firebase Hosting** — Deploy Web App + Admin Dashboard

---

## 📄 License

This project was built as a university project. All rights reserved © UniTrade Team 2025.

---

<p align="center">Made with ❤️ by the UniTrade Team</p>
