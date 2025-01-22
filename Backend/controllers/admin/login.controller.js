require("dotenv").config();
const httpStatus = require("http-status");
const message = require("../../common/error.message");
const { decodeToken } = require("../../common/utils");
const loginData = require("../../service/admin/login.service");
const commonService = require("../../common/utils");
const LoginTokenDetails = require("../../model/admin/LoginTokenDetails.model");

exports.signUp = async (req, res) => {
    try {
        const headers = req.headers["authorization"];
        const tokenData = await decodeToken(headers);
        if (!tokenData) {
            const response = commonService.response(
                0,
                message.INVALID_TOKEN,
                null,
                message.ERROR
            );
            return res.status(httpStatus.NOT_FOUND).json(response);
        }

        const token = await commonService.createOneTimeToken(
            req.body,
            process.env.SECRET
        );

        async function createData(role) {
            if (role === "Admin") {
                const createUser = await loginData.loginService(req.body, token);
                return createUser;
            }
        }
        const user = await createData(tokenData.role, tokenData.email);
        res.status(user.status).send(user);
    } catch (error) {
        console.log("==error==", error);
        if (error.name === "ValidationError") {
            for (const err of Object.values(error.errors)) {
                const errorMessages = err.message
                res.status(400).send({
                    status: 400,
                    message: errorMessages
                });
            }
        } else {
            res.status(500).json({ error: message.UNIQUE_USER });
        }
    }
};

exports.getUsers = async (req, res) => {
    const headers = req.headers["authorization"];
    const uservalid = await commonService.verifyUser(headers);
    if (uservalid === true) {
        try {
            let userDetails = await loginData.findUserRoles();

            const limit = parseInt(req.query.limit) || 10;
            const offset = parseInt(req.query.offset) || 0;

            const startIndex = offset * limit;
            const endIndex = startIndex + limit;
            const pageItems = userDetails.slice(startIndex, endIndex);

            const totalItems = userDetails.length;
            const totalPages = Math.ceil(totalItems / limit);
            const status = totalItems === 1 ? "user" : "users";

            const response = {
                page: offset + 1,
                totalPages,
                itemsPerPage: limit,
                total: totalItems,
                pageItems: pageItems,
                message: `Total ${totalItems} ${status} available`,
            };
            res.status(200).send(response);
        } catch (error) {
            if (error.name === "ValidationError") {
                const errorMessages = Object.values(error.errors).map(
                    (err) => err.message
                );
                res.status(400).json({ errorMessages });
            } else {
                res.status(500).json({ error: "Internal Server Error" });
            }
        }
    }
    else {
        res.status(401).json({ message: "User Not Valid" });
    }
};

exports.logIn = async (req, res) => {
    try {
        const { email, password } = req.body;

        let user = await loginData.findUser({ email });

        if (!user) {
            const response = commonService.response(
                0,
                message.USER_NOT_FOUND,
                null,
                message.ERROR
            );
            return res.status(httpStatus.NOT_FOUND).json(response);
        }

        if (password !== user.password) {
            const response = commonService.response(
                0,
                message.MISMATCH_PASSWORD,
                null,
                message.ERROR
            );
            return res.status(httpStatus.NOT_FOUND).json(response);
        }

        let tokenData = {
            name: user["name"],
            email: user["email"],
            phoneNumber: user["phoneNumber"],
            isAdmin: user["role"] === "Admin" ? true : false,
            branch: user["branch"],
            role: user["role"]
        };
        const token = await commonService.createOneTimeToken(
            tokenData,
            process.env.SECRET
        );

        if (!token) {
            console.error("Token generation failed.");
            return;
        }

        let existingLoginDetails = await LoginTokenDetails.findOne({ email: user.email });

        if (existingLoginDetails) {
            await LoginTokenDetails.findOneAndUpdate({ email: user.email },
                {
                    email: user.email,
                    token: token
                },
                { new: true })
        } else {
            // Create new login details document if email does not exist
            existingLoginDetails = new LoginTokenDetails({
                email: user.email,
                token: token,
            });
            await existingLoginDetails.save();
            console.log('New login details created:', existingLoginDetails);
        }
        const response = {
            message: message.USER_SUCCESS_LOGIN,
            token,
            isBranch: user?.branch,
            email: user?.email,
            name: user?.name,
            isAdmin: (email == process.env.ADMIN_EMAIL && user["role"] === "Admin" ? 'master' : user["role"] === "Admin" ? true : false),
        };

        res.status(200).send(response);
    } catch (error) {
        console.log(error);
    }
};

exports.editUser = async (req, res) => {
    const headers = req.headers["authorization"];
    const uservalid = await commonService.verifyUser(headers);
    if (uservalid === true) {
        try {
            const token = req.params.tokenId;
            const editUserData = await loginData.editUserDetail(req.body, token);

            res.status(editUserData.status).send(editUserData);
        } catch (error) {
            console.log("==error==", error);
            if (error.name === "ValidationError") {
                for (const err of Object.values(error.errors)) {
                    const errorMessages = err.message
                    res.status(400).send({
                        status: 400,
                        message: errorMessages
                    });
                }
            } else {
                res.status(500).json({ error: message.UNIQUE_USER });
            }
        }
    }
    else {
        res.status(401).json({ message: "User Not Valid" });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const token = req.params.tokenId;
        const deleteUserData = await loginData.deleteUserDetail(token);

        res.status(deleteUserData.status).send(deleteUserData);
    } catch (error) {
        if (error.name === "ValidationError") {
            const errorMessages = Object.values(error.errors).map(
                (err) => err.message
            );
            res.status(400).json({ errorMessages });
        } else {
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
};
