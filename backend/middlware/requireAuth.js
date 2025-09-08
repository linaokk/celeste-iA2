import { AUTHORIZATION_REQUIRED } from "../constants/errors";

const requireAuth = (req, res, next) => {
    const { authorization } = req.headers;

    if (!authorization) {
        return res.status(401).json({ error: AUTHORIZATION_REQUIRED });
    } 
    const token = authorization.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: AUTHORIZATION_REQUIRED });
    }
}