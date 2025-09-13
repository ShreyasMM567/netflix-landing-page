# Authentication Setup Guide

## Issues Fixed

1. **Missing SessionProvider**: Added NextAuth SessionProvider to `_app.tsx`
2. **Registration Flow**: Fixed the registration flow to properly sign in users after registration
3. **Error Handling**: Added better error handling and debugging logs
4. **API Function Name**: Fixed typo in register API function name

## Required Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-make-it-long-and-random-at-least-32-characters

# Database (MongoDB)
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/netflix-clone?retryWrites=true&w=majority"

# OAuth Providers (optional - you can add these later)
# GITHUB_ID=your-github-client-id
# GITHUB_SECRET=your-github-client-secret
# GOOGLE_CLIENT_ID=your-google-client-id
# GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## Database Setup

1. **MongoDB Atlas**: Set up a free MongoDB Atlas cluster
2. **Connection String**: Get your connection string and replace the DATABASE_URL
3. **Prisma Setup**: Run the following commands:

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push
```

## Testing Authentication

1. Start the development server: `npm run dev`
2. Navigate to `http://localhost:3000`
3. You should be redirected to `/auth` if not authenticated
4. Try registering a new user
5. Try logging in with existing credentials
6. Check the browser console and server logs for debugging information

### Test Page

Visit `http://localhost:3000/test-auth` to see a detailed authentication status page that shows:
- NextAuth session status
- Current user API response
- User information from both sources
- Sign in/out buttons for testing

## Common Issues

1. **"Not signed in" errors**: Check if NEXTAUTH_SECRET is set correctly
2. **Database connection errors**: Verify DATABASE_URL is correct
3. **Registration fails**: Check server logs for detailed error messages
4. **Login doesn't work**: Verify user exists in database and password is correct

## Debugging

The application now includes extensive logging:
- Registration attempts and results
- Authentication attempts and results
- Session creation and validation
- Database queries and results

Check the browser console and server terminal for detailed logs.
