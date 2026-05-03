# East Point Lost & Found System

Campus lost and found web application for East Point College, Bangalore.

## 🔒 Security Setup (IMPORTANT!)

Before running the project, you need to create configuration files with your credentials:

### 1. Backend Configuration

Copy the example files and add your credentials:

```bash
# Copy config file
cp config.example.py config.py

# Copy database file
cp database.example.py database.py
```

Then edit these files with your actual values:
- `config.py` - Add your SECRET_KEY and Cloudinary credentials
- `database.py` - Add your MySQL password

### 2. Database Setup

Run this SQL command in MySQL:

```sql
CREATE DATABASE lost_found_db;
USE lost_found_db;

-- Create tables (refer to your schema)
-- Add points column
ALTER TABLE users ADD COLUMN points INT DEFAULT 0;
```

### 3. Install Dependencies

**Backend:**
```bash
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

**Frontend:**
```bash
cd frontend
npm install
```

### 4. Run the Application

**Backend:**
```bash
python app.py
```

**Frontend:**
```bash
cd frontend
npm run dev
```

## ⚠️ Never Commit These Files:
- `config.py`
- `database.py`
- `.env` files
- `venv/` folder
- `node_modules/` folder

## 📝 Features

- User authentication with JWT
- Report lost/found items
- AI-powered matching (TF-IDF)
- Image upload via Cloudinary
- Claim verification system
- Community points system
- Profile management

## 🛠️ Tech Stack

**Backend:** Python Flask, MySQL, scikit-learn  
**Frontend:** React, TypeScript, TanStack Router  
**Storage:** Cloudinary
