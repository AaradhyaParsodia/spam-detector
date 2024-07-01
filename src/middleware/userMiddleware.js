import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

// Use Middleware for Maintaining a session
export default function authMiddleware(req, res, next){
    const auth = req.headers.authorization;

    if(!auth || !auth.startsWith('Bearer ')){
        res.status(403).json({
            message: 'Invalid Authorization Token or please login again'
        });
        return;
    }

    const authArr = auth.split(' ');
    const token = authArr[1];

    try {
        const decodeValue = jwt.verify(token, JWT_SECRET);

        if(decodeValue.number){
            req.userNumber = decodeValue.number;
            // console.log(`userMiddleware ${JSON.stringify(decodeValue, null, 2)}`);
            next();
        }
        else{
            return res.status(403).json({
                message: 'Invalid Authorixation Token'
            });
        }
    } catch (error) {
        console.error(error);
        res.status(403).json({
            message: 'Invalid Authorization Token'
        });
        return;
    }
}