# 🌟 Green Grocers - Online Store (Admin + Customer)

An online platform to manage and view organic products. Built with:

- **TypeScript** (Frontend)
- **Express.js** (Backend API)
- **PostgreSQL** (Hosted on [Neon](https://neon.tech))
- **Render** (For Deployment)

---

## 🚀 Project Features

- 🌱 Product listing and management
- 🛒 Customer view for products
- 🔒 Admin Panel with secure login
- 📦 Add, edit, delete products
- 📊 Store data in PostgreSQL remotely
- ⚡ Smooth integration of backend + frontend

---

## 📂 Folder Structure

```
/client      → Next.js frontend
/server      → Express.js backend
```

---

## 🛠 Tech Stack

- **Frontend**: TypeScript, TailwindCSS
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL (Neon)
- **ORM/Query Builder**: drizzle-orm (or knex etc.)
- **Deployment**: Render

---

## 🧑‍💻 How to Setup Locally

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

---

### 2. Install Dependencies

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

---

### 3. Environment Variables

Create a `.env` file in `/server` and `/client` directories.

**In `/server/.env`**

```env
DATABASE_URL=your_neon_postgresql_database_url
JWT_SECRET=your_secret_key
```

**In `/client/.env.local`**

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

### 4. Start the Application

First, start the backend:

```bash
cd server
npm run dev
```

Backend will run at:  
👉 `http://localhost:5000`

Then, start the frontend:

```bash
cd client
npm run dev
```

Frontend will run at:  
👉 `http://localhost:3000`

---

## 🧑‍🏫 Dummy Admin Credentials

| Username  | Password |
|-----------|----------|
| rahul_07  | 123456   |

You can use this to log in as Admin and manage products.

---

## ⚡ Production Deployment (Render)

Backend:
- Create a **Web Service** on Render
- Build Command: `npm install`
- Start Command: `npm run start`
- Expose Port: `5000`

Frontend:
- Create a **Static Site** on Render
- Build Command: `npm run build`
- Publish Directory: `out/` (for Next.js static export) or if using server, connect to backend.

✅ Set correct environment variables on Render dashboard.

---

## 📸 Screenshots
![Screenshot (102)](https://github.com/user-attachments/assets/11958fc9-16db-418a-b4d9-1dd8eae3e1d8)
![Screenshot (103)](https://github.com/user-attachments/assets/2915b529-6e24-4615-a05d-ee9ea0d98e77)
![Screenshot (104)](https://github.com/user-attachments/assets/62751b5a-965f-4cc2-bbf1-fe4d94382dd1)
![Screenshot (105)](https://github.com/user-attachments/assets/b7b83e20-517a-4c1b-9b7e-7a2c05b5d723)
---

## 📑 License

This project is licensed under the [MIT License](LICENSE).

---

# ✅ That's it!

You’re ready to **run**, **test**, and **deploy** your application easily.

---
