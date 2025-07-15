# 🎉 Event Management API

A RESTful API for managing events and user registrations, built using **Node.js**, **Express**, and **PostgreSQL**.  
It supports full event lifecycle management, user registration, capacity handling, and real-time stats.

---

## 🚀 Features

- ✅ Create & list events
- ✅ Register users for events (with constraints)
- ✅ Cancel registrations
- ✅ Get full event details with registered users
- ✅ Get live event statistics
- ✅ List all upcoming events (sorted by date and location)

---

## 📦 Tech Stack

- **Backend**: Node.js, Express
- **Database**: PostgreSQL
- **Client Tools**: Postman, pgAdmin 4
- **ORM/Driver**: pg (node-postgres)

---

## ⚙️ Setup Instructions

### 1. Clone the repository

```
git clone https://github.com/your-username/event-management-api.git
cd event-management-api
```

### 2. Install dependencies

```
npm install
```

### 3. Configure .env file
Create a .env file in the root:

```
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_NAME=event_management
```

### 4. Create PostgreSQL database & tables
Run this SQL in pgAdmin Query Tool:

```
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  datetime TIMESTAMP NOT NULL,
  location VARCHAR(255) NOT NULL,
  capacity INTEGER NOT NULL CHECK (capacity > 0 AND capacity <= 1000)
);

CREATE TABLE registrations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
  UNIQUE(user_id, event_id)
);
```

### 5. Start the server

```
npm run dev
```
📬 API Endpoints
🔹 Create Event
POST /events

```
{
  "title": "Tech Conference",
  "datetime": "2025-08-01T18:00:00Z",
  "location": "Kolkata",
  "capacity": 200
}
```
Response
```
{ "eventId": 1 }
```
🔹 Get Event Details
GET /events/:id
Response

```
{
  "id": 1,
  "title": "Tech Conference",
  "datetime": "...",
  "location": "Kolkata",
  "capacity": 200,
  "registrations": [ { "id": 1, "name": "Apabrita", "email": "..." } ]
}
```

🔹 Register for Event
POST /events/:id/register

```
{ "userId": 1 }
```
Constraints

❌ No duplicate registrations

❌ Cannot register if full or past

Response

```
{ "message": "User registered successfully" }
```
🔹 Cancel Registration
DELETE /events/:id/cancel

```
{ "userId": 1 }
```
Response

```
{ "message": "Registration cancelled" }
```
🔹 List Upcoming Events
GET /events/upcoming

Returns events after current datetime, sorted by:

📅 Date (ascending)

📍 Location (alphabetically)

🔹 Get Event Stats
GET /events/:id/stats

Response
```
{
  "totalRegistrations": 45,
  "remainingCapacity": 55,
  "percentageUsed": "45.00%"
}
```
🧪 Example SQL to Create Users
```
INSERT INTO users (name, email) VALUES
('Apabrita', 'apabrita@example.com'),
('John', 'john@example.com');
```
📂 Folder Structure
```
event-management-api/
├── controllers/
├── routes/
├── models/
├── db/
├── utils/
├── app.js
├── .env
├── README.md
```
📄 License
MIT — free to use for educational and commercial purposes.
