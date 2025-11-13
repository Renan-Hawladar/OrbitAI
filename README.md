"# Orbit AI - Modern Career Guidance Platform"

## 🎯 Overview

Orbit AI is a modern, full-stack AI-powered career guidance platform that provides personalized career path analysis and detailed roadmaps. Built with FastAPI, React, and Gemini AI.

## ✨ Features

### 🔐 Authentication
- User registration and login with JWT tokens
- Secure password hashing with bcrypt
- Session persistence

### 👤 Profile Management
- **PDF CV Upload** (replacing text input) - Maximum 5MB
- Profile picture upload (stored as base64 in database)
- Personal information (name, degree, qualifications, skills)
- **User-provided Gemini API Key** for AI analysis
- Complete data persistence - all information saved to MongoDB

### 🤖 AI-Powered Analysis
- **Career Path Analysis**: Get top 5 personalized career recommendations
- **Career Search**: Search for specific careers with tailored guidance
- Detailed roadmaps with step-by-step instructions
- Required skills identification
- Suitability analysis based on your profile

### 🎨 Modern UI/UX
- **Beautiful gradients and hover effects** on all components
- **Dark/Light mode** with smooth transitions
- Professional, modern design
- Fully responsive layout
- Animated interactions

## 🏗️ Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **MongoDB** - NoSQL database with UUID-based documents
- **Motor** - Async MongoDB driver for Python
- **JWT Authentication** - Secure token-based auth
- **PyPDF2** - PDF text extraction
- **Gemini AI** - Google's latest AI model (gemini-2.0-flash-exp)

### Frontend
- **React 19** - Latest React with TypeScript
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first CSS with custom gradients
- **Axios** - HTTP client for API calls
- **React Icons** - Beautiful icon library

### Database Schema (MongoDB Collections)
```javascript
users
  - user_id (UUID), email, password_hash, created_at
  
profiles
  - profile_id (UUID), user_id (UUID), name, degree, qualifications, skills
  - gemini_api_key, profile_picture_base64, cv_pdf_base64, cv_text
  
career_analyses
  - analysis_id (UUID), user_id (UUID), analysis_result_json, created_at
```

## 🚀 Running the Application

### Services Status

Check service status:
```bash
sudo supervisorctl status
```

### Backend (Port 8001)
```bash
# Restart backend
sudo supervisorctl restart backend

# View logs
tail -f /var/log/supervisor/backend.out.log
tail -f /var/log/supervisor/backend.err.log
```

### Frontend (Port 3000)
```bash
# Restart frontend
sudo supervisorctl restart frontend

# View logs
tail -f /var/log/supervisor/frontend.out.log
tail -f /var/log/supervisor/frontend.err.log
```

### MongoDB
```bash
# Check status
mongosh --eval "db.runCommand({ ping: 1 })"

# Access database
mongosh career_compass

# View collections
mongosh career_compass --eval "show collections"

# Query users
mongosh career_compass --eval "db.users.find().pretty()"
```

## 📁 Project Structure

```
/app/
├── backend/
│   ├── server.py           # Main FastAPI application
│   ├── database.py         # Database models and connection
│   ├── auth.py             # Authentication logic
│   ├── gemini_service.py   # Gemini AI integration
│   ├── pdf_parser.py       # PDF text extraction
│   ├── requirements.txt    # Python dependencies
│   └── .env               # Environment variables
│
└── frontend/
    ├── src/
    │   ├── components/     # React components
    │   │   ├── HomePage.tsx
    │   │   ├── Login.tsx
    │   │   ├── Dashboard.tsx
    │   │   ├── ProfileForm.tsx
    │   │   ├── CareerAnalysis.tsx
    │   │   ├── CareerSearch.tsx
    │   │   ├── Footer.tsx
    │   │   ├── Spinner.tsx
    │   │   └── icons.tsx
    │   ├── context/        # React contexts
    │   │   ├── AuthContext.tsx
    │   │   └── ThemeContext.tsx
    │   ├── services/       # API services
    │   │   └── api.ts
    │   ├── utils/          # Utility functions
    │   │   └── fileHelpers.ts
    │   ├── types.ts        # TypeScript types
    │   ├── App.tsx         # Main app component
    │   ├── index.tsx       # Entry point
    │   └── index.css       # Global styles
    ├── App.tsx        
    ├── index.html        
    ├── index.tsx        
    ├── types.ts        
    ├── package.json        # Dependencies
    ├── tailwind.config.js  # Tailwind configuration
    ├── vite.config.ts      # Vite configuration
    └── .env               # Environment variables
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Profile
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update profile (with PDF upload)

### Career Analysis
- `POST /api/analyze-career` - Analyze career paths (requires complete profile)
- `POST /api/search-career` - Search specific career
- `GET /api/analyses` - Get past analyses

### Health Check
- `GET /api/health` - Check API status

## 🎯 User Flow

1. **Sign Up/Login** → User creates account or logs in
2. **Complete Profile** → User fills in:
   - Name, degree, qualifications, skills
   - **Upload CV (PDF)** - automatically parsed
   - **Provide Gemini API Key** (get from https://aistudio.google.com/app/apikey)
   - Upload profile picture (optional)
3. **Get Analysis** → AI analyzes profile and suggests top 5 career paths
4. **Explore Roadmaps** → View detailed step-by-step guidance for each career
5. **Search Careers** → Search for specific careers and get personalized roadmaps

## 🎨 Design Features

### Gradient Colors
- **Primary**: Purple (#667eea) to Blue (#0ea5e9)
- **Secondary**: Pink (#f093fb) to Rose (#f5576c)
- **Accent**: Cyan gradients for highlights

### Hover Effects
- Transform scale and translate on buttons
- Shadow elevation on cards
- Smooth color transitions
- Animated roadmap reveals

### Dark Mode
- Complete dark theme support
- Smooth transitions
- Adjusted gradients for dark backgrounds
- Persisted user preference

## 📝 Environment Variables

### Backend (.env)
```env
MONGO_URL=mongodb://localhost:27017/career_compass
SECRET_KEY=your-secret-key-change-this-in-production-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8001
```

## 🔧 Development

### Install Dependencies
```bash
# Backend
cd /app/backend
pip install -r requirements.txt

# Frontend
cd /app/frontend
yarn install
```

### Run Development Servers
```bash
# Backend
cd /app/backend
python -m uvicorn server:app --reload --port 8001

# Frontend
cd /app/frontend
yarn dev --port 3000
```

## 🐛 Troubleshooting

### Backend Issues
```bash
# Check logs
tail -f /var/log/supervisor/backend.err.log

# Restart backend
sudo supervisorctl restart backend
```

### Frontend Issues
```bash
# Check if running
curl http://localhost:3000

# View logs
tail -f /var/log/frontend.log

# Clear cache and restart
cd /app/frontend
rm -rf node_modules/.vite
yarn dev
```

### MongoDB Issues
```bash
# Check if running
sudo supervisorctl status mongodb

# Restart MongoDB
sudo supervisorctl restart mongodb

# Check MongoDB logs
tail -f /var/log/mongodb.out.log
tail -f /var/log/mongodb.err.log
```

## 📊 Testing

### Test Backend APIs
```bash
# Run comprehensive test script
/app/test_backend.sh

# Or test manually:
# Health check
curl http://localhost:8001/api/health

# Register
curl -X POST http://localhost:8001/api/auth/register \
  -H \"Content-Type: application/json\" \
  -d '{\"email\":\"user@example.com\",\"password\":\"password123\"}'

# Login
curl -X POST http://localhost:8001/api/auth/login \
  -H \"Content-Type: application/json\" \
  -d '{\"email\":\"user@example.com\",\"password\":\"password123\"}'
```

## 🎓 Getting Gemini API Key

1. Visit https://aistudio.google.com/app/apikey
2. Sign in with your Google account
3. Click \"Create API Key\"
4. Copy the key and paste it in your profile

## ⚡ Performance

- Backend: FastAPI with async support and Motor async MongoDB driver
- Frontend: Vite for instant HMR and fast builds
- Database: MongoDB with indexed queries (email, user_id)
- File uploads: Base64 encoding (max 5MB)
- UUID-based document IDs for better JSON compatibility

## 🔒 Security

- JWT token authentication
- Bcrypt password hashing
- CORS configured
- User-specific API keys stored securely

## 📈 Future Enhancements

- File storage on disk instead of base64
- Email verification
- Password reset functionality
- Export roadmaps as PDF
- Career comparison feature
- Progress tracking
- Social sharing

## 💡 Notes

- All user data including profile pictures and Gemini API keys are stored in MongoDB
- Database uses UUID-based document IDs (not MongoDB ObjectID) for better JSON serialization
- CV PDFs are parsed automatically using PyPDF2
- Each user must provide their own Gemini API key
- Dark/Light mode preference is saved in localStorage
- All forms have proper validation
- Fully responsive design works on all devices (mobile, tablet, desktop)

---

**Built with ❤️ using FastAPI, React, MongoDB, and Gemini AI**
"
