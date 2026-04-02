# 🏨 Hayday Hotel - Luxury Hotel Booking System

![Hayday Hotel Banner](https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80)

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.x-2D3748.svg)](https://www.prisma.io/)
[![Docker](https://img.shields.io/badge/Docker-24.x-2496ED.svg)](https://www.docker.com/)

## 🌟 Overview

Hayday Hotel is a comprehensive, enterprise-grade hotel booking and management system built with modern web technologies. It provides a seamless experience for guests to book rooms, manage reservations, and access hotel services, while offering powerful administrative tools for hotel management.

### ✨ Key Features

#### For Guests
- 🏠 **Smart Room Booking** - Real-time availability with interactive calendar
- 💰 **Dynamic Pricing** - Seasonal rates, last-minute deals, and loyalty discounts
- 👥 **User Profiles** - Manage personal information, view booking history
- 💬 **Real-time Chat** - Live communication with hotel staff
- 🌍 **Multi-language** - Support for English, Amharic, Arabic, and French
- 📱 **Mobile Responsive** - Perfect experience on all devices
- 🔔 **Push Notifications** - Booking confirmations and reminders
- ⭐ **Reviews & Ratings** - Share your experience with other guests

#### For Administrators
- 📊 **Analytics Dashboard** - Real-time revenue, occupancy, and performance metrics
- 🛏️ **Room Management** - Add, edit, and manage room inventory
- 👥 **User Management** - Manage guest accounts and permissions
- 📅 **Calendar View** - Visual overview of all bookings
- 🎯 **Marketing Tools** - Email campaigns, promotions, and A/B testing
- 💳 **Payment Integration** - Stripe payment processing
- 📈 **ML Predictions** - Revenue forecasting and churn prediction
- 🔐 **Role-based Access** - Secure admin controls

## 🏗️ Architecture
┌─────────────────────────────────────────────────────────────┐
│ Client Applications │
├─────────────────────────────────────────────────────────────┤
│ Web App (React) │ Mobile (PWA) │ Admin Dashboard │
└─────────────────────────────────────────────────────────────┘
│
┌─────────────────────────────────────────────────────────────┐
│ API Gateway (Nginx) │
└─────────────────────────────────────────────────────────────┘
│
┌─────────────────────────────────────────────────────────────┐
│ Backend Services │
├─────────────────────────────────────────────────────────────┤
│ Express.js │ Socket.io │ GraphQL │ Redis Cache │
└─────────────────────────────────────────────────────────────┘
│
┌─────────────────────────────────────────────────────────────┐
│ Data Layer │
├─────────────────────────────────────────────────────────────┤
│ MySQL │ Redis │ Cloudinary │ Elasticsearch │
└─────────────────────────────────────────────────────────────┘


## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm 9+ or yarn 1.22+
- MySQL 8.0+ (or Docker)
- Redis 7.0+ (or Docker)
- Git

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/hayday-hotel.git
cd hayday-hotel
chmod +x setup.sh
./setup.sh
```