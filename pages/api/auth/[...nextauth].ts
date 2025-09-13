import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prismadb from '@/lib/prismadb'
import { compare } from 'bcrypt';
import GithubProvider from 'next-auth/providers/github'
import GoogleProvider from 'next-auth/providers/google'

// Validate required environment variables
if (!process.env.NEXTAUTH_SECRET) {
    console.error('NEXTAUTH_SECRET is not set in environment variables');
    throw new Error('NEXTAUTH_SECRET is required');
}

const authOptions = NextAuth({
    providers: [
        GithubProvider({
            clientId: process.env.GITHUB_ID || "",
            clientSecret: process.env.GITHUB_SECRET || "",
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
        Credentials({
            id: 'credentials',
            name: 'Credentials',
            credentials: {
                email: {
                    label: 'Email',
                    type: 'text',
                },
                password: {
                    label: 'Password',
                    type: 'password',
                }
            },
            authorize: async(credentials) => {
                console.log("Auth attempt with credentials:", credentials);
                if(!credentials?.email || !credentials?.password){
                    console.log("Missing email or password");
                    throw new Error("Email and password required");
                }
                
                try {
                    const user = await prismadb.user.findUnique({
                        where: {
                            email: credentials.email
                        }
                    });
                    
                    console.log("Found user:", user ? "Yes" : "No");
                    
                    if(!user || !user.hashedPassword){
                        console.log("User not found or no hashed password");
                        throw new Error("Email does not exist");
                    }
                    
                    const isCorrectPassword = await compare(credentials.password, user.hashedPassword);
                    console.log("Password correct:", isCorrectPassword);
                    
                    if(!isCorrectPassword){
                        throw new Error("Incorrect password");
                    }
                    
                    console.log("Authentication successful for user:", user.email);
                    return user;
                } catch (error) {
                    console.error("Auth error:", error);
                    throw error;
                }
            }
        })
    ],
    pages: {
        signIn: '/auth',
    },
    debug: process.env.NODE_ENV === 'development',
    adapter: PrismaAdapter(prismadb),
    session: {
        strategy: 'jwt',
    },  
    jwt: {
        secret: process.env.NEXTAUTH_SECRET,
    },
    secret: process.env.NEXTAUTH_SECRET,
});

export { authOptions };
export default authOptions;