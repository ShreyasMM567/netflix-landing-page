import bcrypt from 'bcrypt';
import { NextApiRequest, NextApiResponse } from 'next';
import prismadb from '@/lib/prismadb';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if(req.method !== 'POST'){
        return res.status(405).end();
    }
    try{
        const { email, name, password} = req.body;
        console.log("Registration attempt for:", email);
        
        const existingUser = await prismadb.user.findUnique({
            where: {
                email,
            }
        });
        
        if(existingUser){
            console.log("Email already taken:", email);
            return res.status(422).json({ error: 'Email taken'});
        }
        
        const hashedPassword = await bcrypt.hash(password, 12);
        const user = await prismadb.user.create({
            data: {
                email,
                name,
                hashedPassword,
                image: "",
                emailVerified: new Date(),
            }
        });
        
        console.log("User created successfully:", user.email);
        return res.status(200).json(user);
    }
    catch(err){
        console.error("Registration error:", err);
        return res.status(400).json({ error: err.message });
    }
}