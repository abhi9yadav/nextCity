# 🌆 NextCity

NextCity is a **smart civic issue management platform** designed to bridge the gap between citizens and city authorities. It enables seamless complaint registration, tracking, and resolution through a structured multi-role system.

---

## 🚀 Features

### 👤 Citizen (Public User)
- Sign up and log in manually
- File complaints for city issues (e.g., electricity, roads, water, health)
- Upload images to automatically generate complaints with AI-based classification
- View all complaints within their city
- Upvote complaints to highlight common issues
- Track complaint status:
  - 🟢 Open
  - 🟡 In Progress
  - 🔵 Resolved
- Reopen complaints if not satisfied with resolution

---

### 🛡️ SuperAdmin (System Authority)
- Single predefined role (cannot register manually)
- Create and manage cities
- Assign City Admins to cities
- Create and manage departments:
  - Electricity ⚡
  - Roads & Infrastructure 🛣️
  - Water 💧
  - Health 🏥 etc.

---

### 🏙️ City Admin
- Created only by SuperAdmin
- Manages a specific city
- Creates and manages zones within the city
- Assigns Department Admins for each department
- Monitors department performance and progress

---

### 🏢 Department Admin
- Created by City Admin
- Manages a specific department within a city
- Creates or invites workers
- Assigns complaints to workers
- Reassigns complaints if reopened by citizens

---

### 👷 Worker
- Created by Department Admin
- Handles assigned complaints
- Gets complaint location 📍 and navigation route 🗺️
- Updates complaint status after resolving issues

---

## 🧠 Smart Complaint System

- Citizens can upload images instead of writing descriptions
- AI automatically:
  - Detects issue type
  - Assigns appropriate department
  - Generates a description

---

## 🛠️ Tech Stack


### Frontend
- React.js
- Tailwind CSS
- Axios

### Backend
- Node.js
- Express.js

### Database
- MongoDB

### Other Tools & Services
- Firebase Authentication
- AI APIs for image-based complaint detection
- Maps API for location and routing

---

## 📸 Image-Based Complaint Flow

1. Citizen uploads image  
2. AI processes image  
3. System:
   - Detects issue type  
   - Generates description  
   - Assigns department  
4. Complaint auto-created  

---

## ⚙️ Installation & Setup

### 1. Clone Repository
```bash
git clone https://github.com/your-username/NextCity.git
cd NextCity
```
## 2. Setup Backend
```bash
cd server
npm install
npm run dev
```

## 3. Setup Frontend
```bash
cd client
npm install
npm run dev
```
---

## 🤝 Contributing

### Contributions are welcome!

- Fork the repository
- Create a new branch
- Commit your changes
- Submit a Pull Request

---

### 📜 License

This project is open-source and available under the MIT License.

---

### 📞 Support

For bug reports, feature requests, or questions, please open an Issue in this repository.

🌐 GitHub Repo: [GitHub - NextCity](https://github.com/abhi9yadav/nextCity)
