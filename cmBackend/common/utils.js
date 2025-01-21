require("dotenv").config();
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const multer = require("multer");
const path = require("path");
const logInDetail = require("../model/admin/login.model");
const LoginTokenDetails = require("../model/admin/LoginTokenDetails.model");
const createOneTimeToken = async (user, secretKey) => {
    try {
        return jwt.sign(
            {
                name: user?.name,
                email: user?.email,
                phoneNumber: user?.phoneNumber,
                password: user?.password,
                role: user?.role,
                signUp: {
                    singleTimeToken: Date.now()
                }
            },
            secretKey
        );
    } catch (err) {
        return null;
    }
};

const decodeToken = async (token) => {
    try {
        const decode = jwt.verify(token, process.env.SECRET);
        return decode;
    } catch (err) {
        return null;
    }
};

const verifyUser = async (token) => {
    try {
        const decoded = await decodeToken(token);
        // Check if the decoded information exists in the loginData database
        const user = await logInDetail.findOne({ email: decoded?.email });
        if (user) {
            return true;
        } else {
            return false
        }
    } catch (err) {
        console.log('====================================');
        console.log(err);
        console.log('====================================');
        return false; // Return false if token verification fails
    }
};

const compareUserKeys = async (decodedUser, dbUser) => {
    const keysToCheck = ['name', 'email', 'phoneNumber', 'password', 'role'];

    const commonKeys = Object.keys(decodedUser).filter(key => keysToCheck.includes(key));

    for (const key of commonKeys) {
        if (decodedUser[key] !== dbUser[key]) {
            return false; // Return false if any key doesn't match
        }
    }

    return true; // All common keys match
};
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "Images");
    },
    filename: (req, file, cb) => {
        console.log("==Date.now() + path.extname(file.originalname)==", Date.now() + path.extname(file.originalname));
        console.log("===file===", file);
        cb(null, Date.now() + path.extname(file.originalname));

    },
});

const upload = multer(
    {
        storage: storage,
        limits: { fileSize: "10000000" },
        fileFilter: (req, file, cb) => {
            console.log("==file===", file);
            const fileTypes = /jpeg|jpg|png|gif|JPG/;
            const mimeType = fileTypes.test(file.mimetype);
            const extname = fileTypes.test(path.extname(file.originalname));
            if (mimeType && extname) {
                return cb(null, true);
            }
            cb("This file formate is not allow to do upload");
        },
    }).single("gallery");

const responseWithJsonBody = (res, statusCode, body, reqHeaders = {}) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, authorization"
    );
    res.setHeader("Access-Control-Allow-Credentials", true);

    const response = {
        headers: reqHeaders,
        body: body
    };

    res.status(statusCode).json(response);
};


const response = (
    responseCode,
    responseMessage,
    responseData,
    responseStatus
) => {
    return {
        responseCode,
        responseMessage,
        responseData,
        responseStatus,
    };
};

const uniqueId = async () => {
    return uuidv4();
};

module.exports = {
    createOneTimeToken,
    decodeToken,
    response,
    uniqueId,
    verifyUser,
    upload,
};
