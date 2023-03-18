import jsonwebtoken from 'jsonwebtoken'
import express from 'express';
import * as fs from 'fs';
import AuthSchema from '../schema/auth/auth_schema'

class Token {

    static generateToken(payload: Object) {
        var privateKey = fs.readFileSync('private.key');
        var token = jsonwebtoken.sign({ user: payload }, privateKey, { expiresIn: "10m", });
        return token;
    }

    static verifyToken(req: express.Request, res: express.Response, next: any) {
        var privateKey = fs.readFileSync('private.key');
        let token = req.get('authorization');
        if (token) {
            token = token.replace('Bearer ', '');
            jsonwebtoken.verify(token, privateKey, (err, decoded) => {
                if (err) {
                    res.status(401).json({
                        status: 401,
                        success: false,
                        message: err.message,
                    });
                } else {
                    next();
                }
            });
        } else {
            res.status(401).json({
                status: 401,
                success: false,
                message: 'Access Denied: Unauthorized user',
            })
        }
    }


    static fetchProfile(req: express.Request, res: express.Response, next: any) {
        var privateKey = fs.readFileSync('private.key');
        let token = req.get('authorization');
        if (token) {
            token = token.replace('Bearer ', '');
            jsonwebtoken.verify(token, privateKey, (err, decoded) => {
                if (err) {
                    res.status(400).json({
                        status: 400,
                        success: false,
                        message: err.message,
                    });
                } else {
                    // parsing JWT payload
                    var parsedObject = JSON.stringify(decoded)
                    var auth = new AuthSchema(JSON.parse(parsedObject)['user'])
                    res.status(200).json({ status: 200, success: true, message: "Login successful!", token: token, user: auth });
                }
            });
        } else {
            res.status(401).json({
                status: 401,
                success: false,
                message: 'Access Denied: Unauthorized user',
            })
        }
    }

}

export default Token;