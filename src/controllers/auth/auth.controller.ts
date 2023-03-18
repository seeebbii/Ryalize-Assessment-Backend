import express from 'express'
import AuthSchema from '../../schema/auth/auth_schema'
import Token from "../../service/token"
require('dotenv').config()

// ! TWilio configs
import twilio from 'twilio';
const client = twilio(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN);

// ! Package imports
import { genSaltSync, hashSync, compareSync } from 'bcrypt'
import { Utils } from '../../service/utils';


// ! Register User
exports.registerAccount = async (req: express.Request, res: express.Response, next: any) => {

    console.log(req.body)

    // Parsing the payload to Auth Schema
    var authSchema = new AuthSchema(req.body)
    authSchema.complete_phone = authSchema.country_code + authSchema.phone;

    if(req.body.email == null || req.body.password == null || req.body.name == null || req.body.country_code == null || req.body.phone == null){
        res.status(400).json({ status: 400, message: "Bad Request", success: false });
    }

    // Checking Duplicate Entries
    const foundUser = await AuthSchema.findOne({
        $or: [
            { email: authSchema.email }, { phone: authSchema.phone }
        ]
    });

    if (foundUser == null) {
        // Generating password salt
        const salt = genSaltSync(10);
        authSchema.password = hashSync(authSchema.password, salt);

        // Creating user
        authSchema.save().then(async (result) => {
            sendOtp(authSchema);

            res.status(201).json({ status: 201, success: true, message: "OTP sent to your phone number", data: result });
        }).catch((err) => {
            if (err.name === "ValidationError") {
                let errors = Utils.returnErrorsMap(err);
                return res.status(500).json({ status: 500, message: "Validation Error", err: errors, success: false });
            }
            res.status(400).json({ status: 400, message: err, success: false });
        })

    } else {
        // If the user already exists and not verified
        if (foundUser.verified === false) {
            sendOtp(authSchema);
            res.status(401).json({ status: 401, message: "Please verify your account", success: false });
        } else {
            // If the account is verified but the entries are duplicate
            if (foundUser.email === authSchema.email) {
                res.status(404).json({ status: 404, message: "Email with this account is already registered", success: false });
            }

            else if (foundUser.phone === authSchema.phone) {
                res.status(404).json({ status: 404, message: "This phone number is already linked with an account", success: false });
            }

        }

    }
}

//! Login User
exports.login = async (req: express.Request, res: express.Response, next: any) => {
    console.log(req.body)
    const { phone, password } = req.body;

    var auth = await AuthSchema.findOne({ complete_phone: phone });

    if (auth !== null) {

        const validPassword = compareSync(password, auth.password);

        if (validPassword) {

            // Check if the account is verified
            if (auth.verified === false) {
                sendOtp(auth);
                res.status(400).json({ status: 400, success: false, message: "Account not verified: OTP has been sent to your phone", });
                return;
            }

            const token = Token.generateToken(auth);
            res.status(200).json({ status: 200, success: true, message: "Login successful!", token: token, user: auth });

        } else {
            res.status(404).json({ status: 401, message: "Invalid phone or password", success: false });
        }
    } else {
        res.status(404).json({ status: 401, message: "Invalid phone or password", success: false });
    }

}

// Verify Otp
exports.verifyOtp = async (req: express.Request, res: express.Response, next: any) => {

    const { complete_phone, code } = req.body;

    let result = await client.verify.v2.services(process.env.SERVICE_ID!).verificationChecks.create({ to: complete_phone, code: code });

    if (result == null) {
        res.status(401).json({ status: 401, message: "Invalid OTP", success: false });
        return;
    }

    if (result.status === "approved") {
        // Update account verified status
        const updatedUser = await AuthSchema.findOneAndUpdate({ complete_phone: complete_phone }, { verified: true, verified_at: Date.now() });
        if (updatedUser != null) {
            res.status(200).json({ status: 200, success: true, message: "Account verified", });
        } else {
            res.status(401).json({ status: 401, message: "Invalid OTP", success: false });
        }
    } else {
        res.status(401).json({ status: 401, message: "Invalid OTP", success: false });
    }
}

//! SEND OTP FUNCTION
async function sendOtp(authSchema: any) {

    let result = await client.verify.v2.services(process.env.SERVICE_ID!)
        .verifications
        .create({ to: authSchema.complete_phone, channel: 'sms' });
    console.log(result)

    if (result.status === "pending") {
        return true;
    } else {
        return false;
    }
}


//! RESEND OTP
exports.resendOtp = async (req: express.Request, res: express.Response, next: any) => {

    var auth = new AuthSchema({ complete_phone: req.body.complete_phone });

    const status = await sendOtp(auth);

    if (status) {
        res.status(200).json({
            message: "OTP sent"
        });
    } else {
        res.status(500).json({
            message: "An error occurred sending OTP"
        });
    }
}


exports.changePassword = async (req: express.Request, res: express.Response, next: any) => {
    let { complete_phone, password } = req.body

    const salt = genSaltSync(10);
    password = hashSync(password, salt);

    let authresponse = await AuthSchema.updateOne({ complete_phone: complete_phone }, { password: password })

    if (authresponse != null) {
        return res.status(200).json({ status: 200, success: true, message: "Password Updated Successfully", })
    } else {
        return res.status(200).json({ status: 500, success: false, message: "Error Updating Password", })
    }
}



exports.getAll = async (req: express.Request, res: express.Response, next : any) => {

    let userMap = <Array<Map<any, any>>>[];
    
    AuthSchema.find().then((result) => {

        res.status(200).json({status:200, success: true, data: result})
    }).catch((err) => {
        res.status(400).json({status:400, message: err, success: false });
    })
    
}

