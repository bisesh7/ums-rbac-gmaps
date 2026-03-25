## Tech Stack

| Layer       | Technology                          |
| ----------- | ----------------------------------- |
| Frontend    | React, React Bootstrap, Formik, Yup |
| Backend     | Node.js, Express                    |
| Database    | MongoDB, Mongoose                   |
| Auth        | JWT, bcrypt                         |
| File Upload | Multer                              |

---

## SuperAdmin Account

A default **SuperAdmin** account is created for testing and administration:

- **Username:** `superadmin`
- **Password:** `superadmin`
- **Role:** `ADMIN`

> ⚠️ The SuperAdmin account **cannot be deleted or have its role changed**.

### 1. Clone the Repository

```bash
git clone https://github.com/bisesh7/ums-rbac-gmaps
cd ums-rbac-gmaps
```

### 2. Backend Setup

```bash
cd backend
npm install
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

---

## Running the Project

### Backend

```bash
cd backend
npm run dev
```

Runs on **http://localhost:5002**

### Frontend

```bash
cd frontend
npm run dev
```

Runs on **http://localhost:3000**

---
