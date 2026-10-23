# MeterFlow Mobile (React Native + Expo)

A cross-platform mobile application for **MeterFlow** — Usage-Based Pricing, API Gateway, Metering, and Cost Showback engine.

Built with **React Native (v0.88)**, **Expo (v58)**, **React 19**, **React Navigation (v7)**, and `@expo/vector-icons`.

---

## 📱 Features & Screens

### 1. Authentication (`/src/screens/auth/`)
* **Role Switcher**: Segmented toggle between **Employee / Developer** and **Workspace Administrator**.
* **Role Capabilities Preview**: Dynamic capability badges previewing Developer Portal vs. Admin Console permissions.
* **Dual Security Guard**: Blocks employees from choosing Admin console and prompts admins to select Workspace Administrator.
* **Animated Loading Ring**: Continuous breathing pulse ring and status badge during authentication.
* **Session Persistence**: Stored via `@react-native-async-storage/async-storage`.

### 2. Admin Overview (`/src/screens/dashboard/AdminDashboardScreen.js`)
* **Key KPI Cards**: Total Invocations, Cost Showback (in INR/USD/EUR), Active Employees, and Connected Gateways.
* **Department Budget Showback**: Real-time progress bars for Development Team, AI Team, and Marketing Team.
* **Top Consuming Developers**: Ranked by request volume and estimated spend.
* **Live Gateway Telemetry**: Real-time HTTP status, provider latency, endpoint path, and cost per request.

### 3. Developer Portal (`/src/screens/dashboard/EmployeePortalScreen.js`)
* **Live Remaining Quota Meter**: Real-time counting remaining budget (e.g. ₹9,020 of ₹10,000) with dynamic progress bar.
* **⚡ Send Test Request**: 1-tap live execution through `/api/v1/gateway/proxy` that updates quota in real time.
* **Personal API Token**: Fast 1-tap clipboard copy with masked key security.
* **Quickstart Snippets**: One-tap copyable cURL, Node.js, and Python SDK code samples.

### 4. Employees Access Management (`/src/screens/features/EmployeesScreen.js`)
* **Summary Pool Cards**: Total Allocated Pool, Total Spent, and Available Remaining Quota.
* **Developer Directory**: Search by name, corporate email, role, or department.
* **Provision Account Modal**: Add developers with automatic API key provisioning and monthly budget limits.

### 5. API Keys Console (`/src/screens/features/ApiKeysScreen.js`)
* **Active Token Auditing**: Monthly limits, current request counts, and last ingestion timestamps.
* **New Key Generation**: Provision keys for Production, Staging, or Development.
* **Key Revocation**: Instant revocation with confirmation modal.

### 6. Gateway Ingestion Playground (`/src/screens/features/PlaygroundScreen.js`)
* **Pre-built Templates**: OpenAI, Google Gemini, Brevo (Email), Twilio (SMS), Razorpay (Orders).
* **Live Proxy Executor**: Test custom payloads and inspect returned JSON, round-trip latency, and metered cost.

### 7. Profile & Settings (`/src/screens/settings/SettingsScreen.js`)
* **Multi-Currency Switcher**: Seamlessly toggle between **INR (₹)**, **USD ($)**, and **EUR (€)**.
* **Endpoint Switcher**: Switch between Android Emulator (`10.0.2.2:5001`), iOS Simulator (`localhost:5001`), Custom LAN IP, and Production Cloud (`onrender.com`).
* **Connection Health Test**: Ping backend `/health` endpoint to test latency and status.
* **Secure Sign Out**: Destroys stored session and returns to login.

---

## 🚀 How to Run the App

### 1. Ensure the Backend is Running
From the repository root (`d:\Shubha`):
```bash
cd backend
npm start
```
*(Backend runs on `http://localhost:5001` with MongoDB Atlas connection)*

### 2. Start the Expo Mobile Development Server
From the mobile directory (`d:\Shubha\mobile`):
```bash
cd mobile
npm start
```

### 3. Choose Your Device / Platform
* **Android Emulator**: Press `a` in the terminal (auto-routes to `http://10.0.2.2:5001/api/v1`).
* **iOS Simulator**: Press `i` in the terminal (auto-routes to `http://localhost:5001/api/v1`).
* **Web Browser**: Press `w` in the terminal (opens in browser).
* **Physical Device**: Scan the QR code using the **Expo Go** app on iOS or Android.

---

## 🔑 Demo Credentials

| Role | Name | Email | Password | Monthly Quota |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | Rahul Sharma | `admin@meterflow.io` | `password123` | ₹100,000 |
| **Employee** | Vikash Yadav | `vikash.y@abctech.com` | `password123` | ₹10,000 |
| **Employee** | Amit Kumar | `amit.kumar@abctech.com` | `password123` | ₹20,000 |
| **Employee** | Priya Singh | `priya.s@abctech.com` | `password123` | ₹20,000 |
| **Employee** | Rahul Verma | `rahul.v@abctech.com` | `password123` | ₹25,000 |
| **Employee** | Neha Sharma | `neha.s@abctech.com` | `password123` | ₹15,000 |

Full details are documented in [`mobile/src/credentials.js`](file:///d:/Shubha/mobile/src/credentials.js).
