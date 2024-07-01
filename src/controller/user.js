import zod from "zod";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET;

// Schema Creation using ZOD for validation
const userSchema = zod.object({
    name: zod.string().max(35),
    password: zod.string().min(6).max(18),
    number: zod.string().length(10),
    email: zod.string().email().max(45).optional()
})

const userSigninSchema = zod.object({
    number: zod.string().length(10),
    password: zod.string().min(6).max(18)
})

// Util functions
function createUser(name, number, email) {
    const user = prisma.users.create({
        data: {
            name: name,
            number: number,
            email: email
        }
    });
    return user;
}
function createCredentails(id, token, hash) {
    const user = prisma.credentials.create({
        data: {
            userId: id,
            token: token,
            hash: hash
        }
    })
    return user;
}

// Signup POST Route for auth 
export async function signup(req, res) {
    
    const body = req.body;
    const { name, number } = req.body;

    try {
        const { success } = userSchema.safeParse(req.body);
        const { email } = req.body || null;

        if (!success) {
            console.log(success);
            return res.status(411).json({
                message: "Incorrect input's"
            });
        }

        const token = jwt.sign({
            number: number
        }, JWT_SECRET);

        const salt = 10;
        let hash;
        
        // using hashing for password storage 
        bcrypt.hash(body.password, salt, (error, hsh) => {
            if (error) {
                console.error(`error in signup hash generator ${error}`);
                res.status(500).json({ error: 'Internal server error' });
            }
            else {
                hash = hsh
            }
        });

        const newUser = await createUser(name, number, email);
        const result = await createCredentails(newUser.id, token, hash);

        res.status(200).json({
            message: "User created successfully",
            token: token
        });

    } catch (error) {
        console.error(`error in signup controller ${error}`);
        res.status(404).send({ message: error });
    }
}

// Signin POST route for auth
export async function signin(req, res) {

    const body = req.body;

    try {
        const { success } = userSigninSchema.safeParse(req.body);

        if (!success) {
            return res.status(411).json({
                message: "Incorrect input's"
            });
        }

        const result = await prisma.users.findFirst({
            where: {
                number: body.number
            }
        });

        const { hash } = await prisma.credentials.findFirst({
            where: {
                userId: result.id
            },
            select: {
                hash: true
            }
        });

        bcrypt.compare(body.password, hash, (error, result) => {
            if (error) {
                return res.status(500).json({ error: 'Internal server error' });
            }
            else if (!result) {
                return res.status(401).json({ error: 'Invalid number or password' });
            }
        });

        const token = jwt.sign({
            number: body.number
        }, JWT_SECRET);

        return res.status(200).json({
            message: 'Login successful',
            token: token
        });

    } catch (error) {
        console.error(`error in signin controller ${error}`);
        res.status(404).send({ message: error });
    }
}

// Marking Spam Number Endpoint 
export async function markAsSpam(req, res) {
    
    const number = req.params.number;
    const { userNumber } = req.userNumber;
    
    try {
        const user = await prisma.users.findFirst({
            where: {
                number: userNumber
            }
        });

        if (user.number === number) {
            throw new Error("Cannot mark own number as spam");
        }

        const globalData = await prisma.globalDB.upsert({
            where: {
                number: number
            },
            create: {
                number: number,
            },
            update: {

            }
        });

        const spamReport = await prisma.spamReport.create({
            data: {
                reportedById: user.id,
                globalDBId: globalData.id
            }
        });

        res.status(200).json({ message: 'This Number is successfully marked as spam' });
    } catch (error) {
        console.error(`error in markspam controller ${error}`);
        res.status(404).send({ message: error });
    }
}

// Search By Name Endpoint for user details
export async function searchByName(req, res) {
    const { search } = req.params;

    try {

        const names = await prisma.name.findMany({
            where: {
                OR: [
                    { name: { startsWith: search.toLowerCase() } },
                    { name: { contains: search.toLowerCase(), not: { startsWith: search.toLowerCase() } } }
                ]
            },
            orderBy: {
                name: 'desc'
            },
            select: {
                name: true,
                globalDBId: true
            }
        });

        const promisesResponse = await Promise.all(names.map(async (name) => {
            const globalDB = await prisma.globalDB.findUnique({
                where: { id: name.globalDBId }
            });
            return globalDB;
        }));

        const numbers = promisesResponse.map((globalDB) => ({
            number: globalDB.number,
            id: globalDB.id
        }));

        const spamReports = await prisma.spamReport.findMany({
            where: {
                globalDBId: { in: names.map((name) => name.globalDBId) }
            }
        })


        const likelihoods = names.map(async (name) => {
            const globalDBId = name.globalDBId;
            const likelihood = await calculateLikelihood(spamReports, globalDBId);
            return { name: name.name, likelihood };
        });

        const likelihoodsResult = await Promise.all(likelihoods);

        res.status(200).json({
            data: names,
            number: numbers,
            // spamReports: spamReports,
            likelihoods: likelihoodsResult
        });

    } catch (error) {
        console.error(`error in searchByName controller ${error}`);
        res.status(404).send({ message: error });
    }
}

// Helping function for calculation of spam metrix
async function calculateLikelihood(spamReports, globalDBId) {
    const count = await prisma.spamReport.count({
        where: {
            globalDBId: globalDBId
        }
    });

    const totalGlobalDBIds = await prisma.spamReport.findMany({
        distinct: ['globalDBId'],
        select: {
            globalDBId: true
        }
    }).then((results) => results.length);

    return (count / totalGlobalDBIds) * 100;
}

// Search By Number Endpoint For Number details
export async function searchByNumber(req, res) {
    const { search } = req.params;

    try {
        const globalDB = await prisma.globalDB.findFirst({
            where: {
                number: search
            }
        });

        if (globalDB.isRegistered) {
            const registeredUser = await prisma.users.findFirst({
                where: {
                    id: globalDB.registeredUserId
                }
            });

            res.status(200).json({
                data: registeredUser
            });
            return;
        }

        const names = await prisma.name.findMany({
            where: {
                globalDBId: globalDB.id
            }
        });

        const promisesResponse = await Promise.all(names.map(async (name) => {
            const globalDB = await prisma.globalDB.findUnique({
                where: { id: name.globalDBId }
            });
            return globalDB;
        }));

        const numbers = promisesResponse.map((globalDB) => ({
            number: globalDB.number,
            id: globalDB.id
        }));

        const spamReports = await prisma.spamReport.findMany({
            where: {
                globalDBId: { in: names.map((name) => name.globalDBId) }
            }
        });

        const likelihoods = names.map(async (name) => {
            const globalDBId = name.globalDBId;
            const likelihood = await calculateLikelihood(spamReports, globalDBId);
            return { name: name.name, likelihood };
        });

        const likelihoodsResult = await Promise.all(likelihoods);

        res.status(200).json({
            data: names,
            number: numbers,
            likelihoods: likelihoodsResult
        });


    } catch (error) {
        console.error(`error in searchByNumber controller ${error}`);
        res.status(404).send({ message: error });
    }
}