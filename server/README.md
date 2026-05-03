# A.L.S Trade  — Node.js Backend

REST API built with Node.js, Express and MongoDB for the A.L.S Trade  B2B wholesale platform.

---

## Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Runtime     | Node.js                             |
| Framework   | Express 4                           |
| Database    | MongoDB + Mongoose                  |
| Auth        | JWT + bcryptjs                      |
| Email       | Nodemailer (Gmail / SMTP)           |
| Uploads     | Multer (local disk)                 |
| Dev server  | Nodemon                             |

---

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secret and email credentials
```

### 3. Seed the database (optional)
```bash
npm run seed
```
This creates 6 sample batches and two accounts:
- Admin: `admin@returntrading.nl` / `admin1234`
- Customer: `customer@test.com` / `customer1234`

### 4. Run in development
```bash
npm run dev
# → https://als-trade-wholesale-production.up.railway.app/api/batches
```

---

## API Reference

### Auth
| Method | Endpoint               | Access  | Description           |
|--------|------------------------|---------|-----------------------|
| POST   | /api/users/register    | Public  | Create company account |
| POST   | /api/users/login       | Public  | Login, get JWT token   |
| GET    | /api/users/me          | Auth    | Get own profile        |
| PATCH  | /api/users/me          | Auth    | Update own profile     |

### Stock
| Method | Endpoint                  | Access     | Description                    |
|--------|---------------------------|------------|--------------------------------|
| GET    | /api/batches              | Public*    | All available stock            |
| GET    | /api/batches/sold         | Public     | All sold stock                 |
| GET    | /api/batches/:slug        | Public*    | Single batch detail            |
| POST   | /api/batches              | Admin      | Create new batch + images      |
| PUT    | /api/batches/:id          | Admin      | Update batch + images          |
| PATCH  | /api/batches/:id/sold     | Admin      | Mark batch as sold             |
| DELETE | /api/batches/:id          | Admin      | Delete batch                   |

*Price field is hidden for unauthenticated guests.

### Contact
| Method | Endpoint     | Access | Description               |
|--------|--------------|--------|---------------------------|
| POST   | /api/contact | Public | Submit contact form        |

### Admin
| Method | Endpoint                          | Access | Description        |
|--------|-----------------------------------|--------|--------------------|
| GET    | /api/admin/stats                  | Admin  | Dashboard numbers  |
| GET    | /api/admin/enquiries              | Admin  | All enquiries      |
| PATCH  | /api/admin/enquiries/:id/read     | Admin  | Mark as read       |
| GET    | /api/admin/users                  | Admin  | All customers      |

### Query parameters for GET /api/batches
- `?category=laptops` — filter by category (laptops / phones / tablets / mixed)
- `?brand=Apple` — filter by brand (case-insensitive)
- `?tested=true` — only tested batches
- `?search=macbook` — search in title

---

## Project structure

```
server/
├── index.js                  ← Entry point, Express app setup
├── config/
│   └── db.js                 ← MongoDB connection
├── models/
│   ├── Batch.js              ← Stock listing schema
│   ├── User.js               ← Company account schema
│   └── Enquiry.js            ← Contact form submission schema
├── controllers/
│   ├── batchController.js    ← Stock CRUD + price visibility
│   ├── userController.js     ← Register, login, profile
│   ├── contactController.js  ← Contact form + email sending
│   └── adminController.js    ← Dashboard stats + enquiries
├── routes/
│   ├── batchRoutes.js
│   ├── userRoutes.js
│   ├── contactRoutes.js
│   └── adminRoutes.js
├── middleware/
│   ├── authMiddleware.js     ← protect / softAuth / admin
│   └── uploadMiddleware.js   ← Multer image upload
├── utils/
│   └── seed.js               ← Database seeder
├── uploads/                  ← Uploaded batch images (git-ignored)
├── .env.example
├── .gitignore
└── package.json
```
