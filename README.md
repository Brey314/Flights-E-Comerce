# Flights E-Commerce

A full-stack web application for searching, comparing and buying flights online.  
The project is organized into a **Backend**, a **Frontend** (`Frontend/breyflights`) and a **Documentation** folder.

---

## Features

### For users

- Search flights by origin, destination and date.
- View flight details: airline, schedule, price, duration, etc.
- Add flights to a cart / booking list.
- Complete the purchase flow (selection, confirmation, and summary).
- Basic user account flow (sign up / login / logout). _Edit if not implemented._

### For admins (optional)

- Manage available flights (create, update, delete). _Remove if you don’t have this._
- View bookings and basic sales info.

---

## Tech Stack

- **Frontend**: React, react-dom, react-router-dom, framer-motion, @sendgrid/mail, @stripe/react-stripe-js
- **Backend**: JavaScript, Nodejs, stripe, mongoose, express, dotenv, cookie-parser, bcryptjs, axios
- **Database**: MongoDB 
- **Version control**: GitHub

---

## Project Structure

```text
Flights-E-Comerce/
├── Backend/               # Backend API source code
│   └── Middleware          
│   └── Models
│   └── Routes
├── Frontend/
│   └── breyflights/       # Frontend app (UI, pages, components)
│       └── src
│           └── pages
│               └── css
│           └── context
│           └── components
└── Documentation/         # Diagrams, reports or extra docs (optional)
```
---

## Installation and execution

### 1. Clone the Repository

```bash
git clone https://github.com/Brey314/Flights-E-Comerce.git
cd Flights-E-Comerce
```

---

### 2. Install Backend Dependencies

```bash
cd Backend
npm install
```

---

### 3. Create the `.env` File (Backend)

Create a `.env` file inside the `Backend` folder and add:

```ini
MONGODB_URI=mongodb_connection_url
JWT_SECRET=secret_key_for_tokens
STRIPE_SECRET_KEY=secret_key_for_sending_payment_gateway_data
STRIPE_WEBHOOK_SECRET=secret_key_for_receiving_payment_gateway_data
REACT_APP_API_URL=backend_url (default http://localhost:5000)
PORT=5000
SENDGRID_API_KEY=key_generated_in_Sendgrid
```

---

## 4. Install Frontend Dependencies

```bash
cd reactapp
npm install
```

---


## 6. Running the Project

### Start the Backend:
```bash
cd Backend
node server.js
```

### Build the Frontend:
```bash
cd reactapp
npm run build
serve -s build
```

---
