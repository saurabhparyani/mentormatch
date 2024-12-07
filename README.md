# MentorMatch Platform

A modern web application connecting mentors and mentees in their respective fields. The platform facilitates meaningful connections through skills and interest matching.

## 🌐 Deployed URL
[MentorMatch Platform](https://mentormatch-platform.vercel.app)

## 🚀 Technologies Used

- **Frontend**
  - Next.js 14 (App Router)
  - TypeScript
  - Tailwind CSS
  - Socket.io Client (Real-time notifications)

- **Backend**
  - Prisma (Database ORM)
  - PostgreSQL
  - Next.js API Routes
  - Socket.io (WebSocket server)

- **Authentication**
  - Custom JWT-based authentication
  - Secure password hashing

## 🛠️ Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/mentormatch.git
   cd mentormatch
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env`
   ```bash
   cp .env.example .env
   ```
   - Fill in the required environment variables:
     - `DATABASE_URL`: Your PostgreSQL connection string
     - `JWT_SECRET`: Secret key for JWT token generation
     - `NEXTAUTH_SECRET`: Secret key for NextAuth.js
     

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   Open [http://localhost:3000](http://localhost:3000) in your browser

## 🌟 Features

- Real-time matching system
- Skill-based mentor/mentee pairing
- User profiles with skills and interests
- Real-time notifications
- Connection management
- Responsive design

