# GitHub Profile Analyzer 🔍

A modern, responsive web application that analyzes GitHub profiles using real-time data from the GitHub REST API.  
Built with a mobile-first approach, clean UI/UX, dark mode, charts, and advanced analytics.

🌐 **Live Demo:**
https://github.com/Sayed24/GitHub_Profile_Analyzer/tree/main

---

## ✨ Features

### 🔎 Profile Analysis
- GitHub avatar, bio, location, company, website
- Followers / Following
- Account creation date
- Clean handling of missing data

### 📊 Repository Analytics
- Total repositories
- Total stars & forks
- Most starred repositories
- Recently updated repositories

### 📈 Data Visualization
- Language usage (Doughnut chart)
- Top starred repositories (Bar chart)
- Built with Chart.js

### 🌗 Dark / Light Mode
- System preference detection
- Manual toggle
- Saved in localStorage

### 📱 Fully Responsive
- Mobile-first design
- Optimized for phones, tablets, and desktops
- GitHub Pages compatible

### 🔁 Search History
- Stores last 5 searches
- One-click reload

### 🔗 Shareable Profiles
- URL-based search support  
  `?user=octocat`

### 🆚 Profile Comparison (Advanced)
- Compare two GitHub users side-by-side
- Visual stat comparison
- Perfect for recruiter demos

---

## 🛠️ Tech Stack

- **HTML5**
- **CSS3 (Custom, mobile-first)**
- **Vanilla JavaScript**
- **Chart.js**
- **GitHub REST API**
- **LocalStorage**
- **GitHub Pages**

---

## 📁 Project Structure
github_profile_analyzer/
│
├── index.html
├── css/
│   └── styles.css
│
├── js/
│   ├── api.js
│   ├── ui.js
│   ├── charts.js
│   ├── theme.js
│   ├── main.js
│   └── compare.js
│
└── README.md

---

## 🚀 How to Run Locally

1. Clone the repository
2. Open `index.html` in your browser
3. Enter a GitHub username and analyze

---

## ⚠️ API Notes
- Uses GitHub public API (unauthenticated)
- Rate limit: 60 requests/hour
- Smart caching implemented with localStorage

---

## 📌 Future Improvements
- PDF export
- Offline mode
- Repo filtering & sorting
- OAuth for higher API limits

---

## 👤 Author
**Sayedrahim Sadat**  
Web Developer | JavaScript | UI/UX  
