import { NextApiRequest, } from "next";
import { getSession } from "next-auth/react";
import prismadb from '@/lib/prismadb';

const serverAuth = async (req: NextApiRequest) => {
    console.log("ServerAuth called");
    const session = await getSession({ req });
    console.log("Session found:", session ? "Yes" : "No");
    console.log("Session user:", session?.user);
    
    if (!session?.user?.email) {
        console.log("No session or user email");
        throw new Error("Not signed in");
    }
    
    const currentUser = await prismadb.user.findUnique({
        where: {
            email: session.user.email
        }
    });
    
    console.log("Current user from DB:", currentUser ? "Found" : "Not found");
    
    if(!currentUser){
        throw new Error("Not signed in");
    }
    return { currentUser }
}

export default serverAuth;