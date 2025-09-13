import { NextApiRequest, NextApiResponse } from "next";
import serverAuth from "@/lib/serverAuth";

export default async function handler(req: NextApiRequest, res: NextApiResponse){
    if(req.method !== 'GET'){
        return res.status(405).end();
    }
    try{
        console.log("Current user API called");
        const { currentUser } = await serverAuth(req);
        console.log("Current user found:", currentUser?.email);
        return res.status(200).json(currentUser);
    }
    catch(err){
        console.error("Current user API error:", err);
        return res.status(400).json({ error: err.message });
    }
}