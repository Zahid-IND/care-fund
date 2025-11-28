# CareFund Authentication Setup

This project uses NextAuth.js with MongoDB for authentication.

## Environment Variables

Add these environment variables to your Vercel project:

1. **MONGODB_URI**: Your MongoDB connection string
   \`\`\`
   mongodb+srv://carefund:carefund1234@carefund-cluster.2opojwx.mongodb.net/
   \`\`\`

2. **NEXTAUTH_SECRET**: A secret key for NextAuth (generate with `openssl rand -base64 32`)
   \`\`\`
   Example: dGhpc2lzYXJhbmRvbXNlY3JldGtleWZvcm5leHRhdXRo
   \`\`\`

3. **NEXTAUTH_URL**: Your deployment URL
   \`\`\`
   Production: https://your-domain.vercel.app
   Development: http://localhost:3000
   \`\`\`

## Database Collections

The app uses three MongoDB collections:

### 1. users
Stores user account information:
- `_id`: MongoDB ObjectId
- `name`: User's full name
- `email`: User's email address (unique)
- `password`: Hashed password (bcrypt)
- `createdAt`: Account creation timestamp
- `profileCompleted`: Boolean flag for profile completion

### 2. profiles
Stores user health profile data:
- `userId`: Reference to user._id
- `name`: Full name
- `city`: Selected city
- `area`: Area/locality
- `age`: User's age
- `occupation`: User's occupation
- `workShift`: Work shift (Day/Night/Rotating)
- `healthCondition`: Current health condition
- `pastSurgery`: Past surgery information
- `addictions`: Addiction information
- `createdAt`: Profile creation timestamp
- `updatedAt`: Last update timestamp

### 3. sessions (managed by NextAuth)
Stores user session data automatically.

## API Routes

- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/signin` - Sign in with credentials (managed by NextAuth)
- `GET /api/profile` - Get user profile data (requires authentication)
- `POST /api/profile` - Save/update user profile (requires authentication)

## Authentication Flow

1. User signs up via `/signup` page
   - Account created in MongoDB
   - Password hashed with bcrypt
   - Automatically signed in after signup

2. User logs in via `/login` page
   - Credentials validated against MongoDB
   - JWT session token created
   - Session stored in secure HTTP-only cookie

3. Protected routes (under `/dashboard`) require authentication
   - Middleware checks for valid session
   - Redirects to `/login` if not authenticated

## Security Features

- Password hashing with bcryptjs (10 salt rounds)
- JWT-based session management
- HTTP-only cookies for session storage
- Protected API routes with session validation
- MongoDB connection pooling for performance
