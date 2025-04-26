

# 🌟 Green Grocers - Online Store (Admin + Customer)

An online platform to manage and view organic products. Built with:

- **Next.js** (Frontend)
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

- **Frontend**: Next.js, TailwindCSS
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

## 📸 Screenshots (Optional)
*(You can add some UI screenshots here if you want.)*

---

## 📑 License

This project is licensed under the [MIT License](LICENSE).

---

# ✅ That's it!

You’re ready to **run**, **test**, and **deploy** your application easily.

---

Would you also like me to create a **`package.json` scripts section** that helps auto-run both backend and frontend together for local dev?  
👉 Like with `concurrently` or a single `npm run dev` command? 🚀  
(Just say yes if you want!)
