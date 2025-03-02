require("dotenv").config();
const { verifyUser } = require("../../common/utils");
const enrollService = require("../../service/enroll/Enroll.service");
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

exports.createEnroll = async (req, res) => {
    try {
        // Extract access token from headers
        const accessToken = req.headers["authorization"];
        if (!accessToken) {
            return res.status(401).json({ message: "Access token is missing" });
        }

        // Verify user validity
        const isUserValid = await verifyUser(accessToken);
        if (!isUserValid) {
            return res.status(401).json({ message: "Invalid user" });
        }

        // Extract isAdmin and isBranch from request parameters
        const isAdmin = req.params.admin;
        const isBranch = req.params.branch;

        // Save PDF file
        if (req.body.file && req.body.fileName) {
            const base64Data = req.body.file.split(";base64,").pop();
            const fileName = req.body.fileName;
            const directoryPath = path.join(__dirname, "..", "..", "public");
            const filePath = path.join(directoryPath, fileName);

            // Ensure the directory exists
            if (!fs.existsSync(directoryPath)) {
                fs.mkdirSync(directoryPath, { recursive: true });
            }

            // Decode and write file
            fs.writeFile(filePath, base64Data, { encoding: "base64" }, async (err) => {
                if (err) {
                    console.error("Error saving PDF file:", err);
                    return res.status(500).json({ error: "Failed to save PDF file" });
                }

                // Call the enrollment service
                const enrollData = await enrollService.createEnrollDetail(req.body, isAdmin, isBranch);

                // Check if enrollment data is valid
                if (!enrollData) {
                    return res.status(400).json({ error: "Invalid enrollment information" });
                }

                // Send response after file is saved
                res.status(200).json(enrollData);
            });
        } else {
            return res.status(400).json({ error: "Please provide file and file name" });
        }
    } catch (error) {
        console.error("Error:", error);
        if (error.name === "ValidationError") {
            const errorMessages = Object.values(error.errors).map((err) => err.message);
            return res.status(400).json({ errorMessages });
        } else {
            return res.status(500).json({ error: "Internal Server Error" });
        }
    }
};

exports.settleEnroll = async (req, res) => {
    const headers = req.headers["authorization"];
    const uservalid = await verifyUser(headers);
    if (uservalid === true) {
        const isCN = req.params.isCN;
        const isBranch = req.params.branch;
        try {
            const enrollData = await enrollService.settleEnroll(
                req.body,
                isCN,
                isBranch
            );

            if (!enrollData) {
                throw new Error("Please enter valid enroll information!");
            }

            res.status(enrollData.status).send(enrollData);
        } catch (error) {
            console.log('====================================');
            console.log(error);
            console.log('====================================');
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

exports.getDemoEnroll = async (req, res) => {
    const headers = req.headers["authorization"];
    const uservalid = await verifyUser(headers);
    if (uservalid === true) {
        try {
            const isAdmin = req.params.admin;
            const isBranch = req.params.branch;
            const findEnroll = await enrollService.getDemoEnroll(isAdmin, isBranch);
            const response = {
                pageItems: findEnroll,
                message: `Total ${findEnroll.length || 0} available`,
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
exports.createDemoEnroll = async (req, res) => {
    const headers = req.headers["authorization"];
    const uservalid = await verifyUser(headers);
    if (uservalid === true) {
        const isAdmin = req.params.admin
        const isBranch = req.params.branch
        try {
            const enrollData = await enrollService.createDemoEnroll(
                req.body,
                isAdmin,
                isBranch
            );

            if (!enrollData) {
                throw new Error("Please enter valid enroll information!");
            }

            res.status(enrollData.status).send(enrollData);
        } catch (error) {
            console.log('====================================');
            console.log(error);
            console.log('====================================');
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

exports.getEnroll = async (req, res) => {
    const headers = req.headers["authorization"];
    const uservalid = await verifyUser(headers);
    if (uservalid === true) {
        try {
            const isAdmin = req.params.admin;
            const isBranch = req.params.branch;
            const findEnroll = await enrollService.findEnroll(isAdmin, isBranch);
            const response = {
                pageItems: findEnroll,
                message: `Total ${findEnroll.length || 0} available`,
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
exports.getBookNumber = async (req, res) => {
    try {
        const isCN = req.params.isCN;
        const isBranch = req.params.branch;
        const findEnroll = await enrollService.findBookNumber(isBranch, isCN);
        const response = {
            pageItems: findEnroll,
            message: `Total ${findEnroll.length || 0} available`,
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
};
exports.getPaymentSlip = async (req, res) => {
    const headers = req.headers["authorization"];
    const uservalid = await verifyUser(headers);
    if (uservalid === true) {
        try {
            const isAdmin = req.params.admin;
            const isBranch = req.params.branch;
            const findEnroll = await enrollService.getPaymentSlip(req.body, isAdmin, isBranch);
            const response = {
                pageItems: findEnroll,
                message: `Total ${findEnroll.length || 0} available`,
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
exports.editBookNumber = async (req, res) => {
        const isCN = req.params.isCN;
        const isBranch = req.params.branch;
        try {
            const enrollData = await enrollService.editBookNumber(
                isBranch,
                isCN
            );

            if (!enrollData) {
                throw new Error("Please enter valid enroll information!");
            }

            res.status(enrollData.status).send(enrollData);
        } catch (error) {
            console.log('====================================');
            console.log(error);
            console.log('====================================');
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
exports.findSettleEnroll = async (req, res) => {
    const headers = req.headers["authorization"];
    const uservalid = await verifyUser(headers);
    if (uservalid === true) {
        try {
            const isAdmin = req.params.admin;
            const isBranch = req.params.branch;
            const findEnroll = await enrollService.findSettleEnroll(req.body, isAdmin, isBranch);
            const response = {
                pageItems: findEnroll,
                message: `Total ${findEnroll?.pageItems?.length || 0} available`,
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
exports.getFilterEnroll = async (req, res) => {
    const headers = req.headers["authorization"];
    const uservalid = await verifyUser(headers);
    if (uservalid === true) {
        try {
            const isAdmin = req.params.admin;
            const isBranch = req.params.branch;
            const findEnroll = await enrollService.findFilterEnroll(req.body, isAdmin, isBranch);
            const response = {
                pageItems: findEnroll,
                message: `Total ${findEnroll.length || 0} available`,
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
exports.downloadEnrollData = async (req, res) => {
    const headers = req.headers["authorization"];
    const uservalid = await verifyUser(headers);
    if (uservalid === true) {
        try {
            const isAdmin = req.params.admin;
            const isBranch = req.params.branch;
            const findEnroll = await enrollService.downloadEnrollData(req.body, isAdmin, isBranch);
            if (findEnroll?.length > 0) {
                const enrollments = findEnroll.map(enrollment => enrollment);

                const workbook = new ExcelJS.Workbook();
                const worksheet = workbook.addWorksheet('Enroll Data');

                // Extract headers dynamically from the first object in the array
                // const headers = Object.keys(findEnroll[0]);
                const headers = [
                    'name',
                    'enrollDate',
                    'enquireType',
                    'course',
                    'mobileNumber',
                    'paymentType',
                    'totalFees',
                    'discount',
                    'pendingFees',
                    'partialPayment',
                    'payFees',
                    'installment',
                    'payInstallment',
                    'enquireBranch',
                    'grossPayment',
                    'iGst',
                    'sGst',
                    'cGst',
                ]
                // Add headers
                worksheet.addRow(headers);

                // Add data
                enrollments.forEach(enrollment => {
                    const rowData = headers.map(header => enrollment[header]);
                    worksheet.addRow(rowData);
                });

                // Generate Excel file
                const buffer = await workbook.xlsx.writeBuffer();

                // Send Excel file as response
                res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
                res.setHeader("Content-Disposition", "attachment; filename=enrollData.xlsx");
                res.status(200).send(buffer);
            } else {
                res.status(405).send({ error: "Data Not Found" });
            }
        } catch (error) {
            console.log('error', error);
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
exports.downloadSlipData = async (req, res) => {
    const headers = req.headers["authorization"];
    const uservalid = await verifyUser(headers);
    if (uservalid === true) {
        try {
            const isAdmin = req.params.admin;
            const isBranch = req.params.branch;
            const findEnroll = await enrollService.downloadSlipData(req.body, isAdmin, isBranch);
            if (findEnroll?.length > 0) {
                const enrollments = findEnroll.map(enrollment => enrollment);

                const workbook = new ExcelJS.Workbook();
                const worksheet = workbook.addWorksheet('Enroll Data');

                // Extract headers dynamically from the first object in the array
                // const headers = Object.keys(findEnroll[0]);
                const headers = [
                    'name',
                    'refundAmount',
                    'settlementDate',
                    'state',
                    'iGst',
                    'sGst',
                    'cGst',
                    'payInstallmentFees',
                    'course',
                    'payFeesDate',
                    'payFeesFormatFeesDate',
                    'paymentDetails',
                    'payInstallment',
                    'paymentReceiver',
                    'paymentSlipNumber',
                    'payInstallmentNumbers',
                ]
                // Add headers
                worksheet.addRow(headers);

                // Add data
                enrollments.forEach(enrollment => {
                    const rowData = headers.map(header => enrollment[header]);
                    worksheet.addRow(rowData);
                });

                // Generate Excel file
                const buffer = await workbook.xlsx.writeBuffer();

                // Send Excel file as response
                res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
                res.setHeader("Content-Disposition", "attachment; filename=enrollData.xlsx");
                res.status(200).send(buffer);
            } else {
                res.status(405).send({ error: "Data Not Found" });
            }
        } catch (error) {
            console.log('error', error);
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

exports.getCourseCompletionStudent = async (req, res) => {
    const headers = req.headers["authorization"];
    const uservalid = await verifyUser(headers);
    if (uservalid === true) {
        try {
            const isAdmin = req.params.admin;
            const isBranch = req.params.branch;
            const findEnroll = await enrollService.getCourseCompletionStudent(isAdmin, isBranch);
            const response = {
                pageItems: findEnroll,
                message: `Total ${findEnroll.length || 0} available`,
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
exports.getFilterCourseCompletionStudent = async (req, res) => {
    const headers = req.headers["authorization"];
    const uservalid = await verifyUser(headers);
    if (uservalid === true) {
        try {
            const isAdmin = req.params.admin;
            const isBranch = req.params.branch;
            const findEnroll = await enrollService.getFilterCourseCompletionStudent(req.body, isAdmin, isBranch);
            const response = {
                pageItems: findEnroll,
                message: `Total ${findEnroll.length || 0} available`,
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
exports.settlePaymentData = async (req, res) => {
    const headers = req.headers["authorization"];
    const uservalid = await verifyUser(headers);
    if (uservalid === true) {
        try {
            const isAdmin = req.params.admin;
            const isBranch = req.params.branch;
            const findEnroll = await enrollService.settlePaymentData(req.body, isAdmin, isBranch);
            const response = {
                pageItems: findEnroll,
                message: `Total ${findEnroll.length || 0} available`,
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
exports.findCheckFilterEnroll = async (req, res) => {
    const headers = req.headers["authorization"];
    const uservalid = await verifyUser(headers);
    if (uservalid === true) {
        try {
            const isAdmin = req.params.admin;
            const isBranch = req.params.branch;
            const findEnroll = await enrollService.findCheckFilterEnroll(req.body, isAdmin, isBranch);
            const response = {
                pageItems: findEnroll?.manipulatedResult,
                totalPendingInstallmentAmount: findEnroll?.totalPendingInstallmentAmount,
                message: `Total ${findEnroll?.manipulatedResult?.length || 0} available`,
            };
            res.status(200).send(response);
        } catch (error) {
            if (error.name === "ValidationError") {
                const errorMessages = Object.values(error.errors).map(
                    (err) => err.message
                );
                res.status(400).json({ errorMessages });
            } else {
                console.log('====================================');
                console.log(error);
                console.log('====================================');
                res.status(500).json({ error: "Internal Server Error" });
            }
        }
    }
    else {
        res.status(401).json({ message: "User Not Valid" });
    }
};
exports.findFilterEnrollPayment = async (req, res) => {
    const headers = req.headers["authorization"];
    const uservalid = await verifyUser(headers);
    if (uservalid === true) {
        try {
            const isAdmin = req.params.admin;
            const isBranch = req.params.branch;
            const findEnroll = await enrollService.findFilterEnrollPayment(req.body, isAdmin, isBranch);
            const response = {
                pageItems: findEnroll,
                message: `Total ${findEnroll.pageItems?.length || 0} available`,
            };
            res.status(200).send(response);
        } catch (error) {
            console.log('error', error)
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
exports.getCheckEnroll = async (req, res) => {
    const headers = req.headers["authorization"];
    const uservalid = await verifyUser(headers);
    if (uservalid === true) {
        try {
            const isAdmin = req.params.admin;
            const isBranch = req.params.branch;
            const findEnroll = await enrollService.findCheckEnroll(req.body, isAdmin, isBranch);
            const response = {
                pageItems: findEnroll.pastInstallments,
                totalPendingInstallmentAmount: findEnroll.totalPendingInstallmentAmount,
                message: `Total ${findEnroll.pastInstallments?.length || 0} available`,
            };
            res.status(200).send(response);
        } catch (error) {
            console.log('====================================');
            console.log(error);
            console.log('====================================');
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
exports.getPartialPayment = async (req, res) => {
    const headers = req.headers["authorization"];
    const uservalid = await verifyUser(headers);
    if (uservalid === true) {
        try {
            const isAdmin = req.params.admin;
            const isBranch = req.params.branch;
            const findEnroll = await enrollService.getPartialPayment(req.body, isAdmin, isBranch);
            const response = {
                pageItems: findEnroll,
                message: `Total ${findEnroll?.length || 0} available`,
            };
            res.status(200).send(response);
        } catch (error) {
            console.log('====================================');
            console.log(error);
            console.log('====================================');
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

exports.editEnroll = async (req, res) => {
    const headers = req.headers["authorization"];
    const uservalid = await verifyUser(headers);
    if (uservalid === true) {
        try {
            const isAdmin = req.params.admin
            const isBranch = req.params.branch
            const token = req.params.tokenId;
            if (req.body.file && req.body.fileName) {
                const base64Data = req.body.file.split(';base64,').pop();
                const fileName = req.body.fileName;
                const directoryPath = path.join(__dirname, '..', '..', 'public');
                const filePath = path.join(directoryPath, fileName);

                // Check if directory exists, create if not
                if (!fs.existsSync(directoryPath)) {
                    fs.mkdirSync(directoryPath, { recursive: true });
                }

                // Decode and write file
                fs.writeFile(filePath, base64Data, { encoding: 'base64' }, async (err) => {
                    if (err) {
                        console.error("Error saving PDF file:", err);
                        return res.status(500).json({ error: "Failed to save PDF file" });
                    }
                    const editEnrollData = await enrollService.editEnrollDetail(
                        req.body,
                        token,
                        isAdmin,
                        isBranch
                    );
                    res.status(editEnrollData.status).send(editEnrollData);
                });
            } else {
                return res.status(400).json({ error: "Please provide file and file name" });
            }
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

exports.editEnrollPayment = async (req, res) => {
    const headers = req.headers["authorization"];
    const uservalid = await verifyUser(headers);
    if (uservalid === true) {
        try {
            const isAdmin = req.params.admin
            const isBranch = req.params.branch
            const token = req.params.tokenId;
            if (req.body.file && req.body.fileName) {
                const base64Data = req.body.file.split(';base64,').pop();
                const fileName = req.body.fileName;
                const directoryPath = path.join(__dirname, '..', '..', 'public');
                const filePath = path.join(directoryPath, fileName);

                // Check if directory exists, create if not
                if (!fs.existsSync(directoryPath)) {
                    fs.mkdirSync(directoryPath, { recursive: true });
                }

                // Decode and write file
                fs.writeFile(filePath, base64Data, { encoding: 'base64' }, async (err) => {
                    if (err) {
                        console.error("Error saving PDF file:", err);
                        return res.status(500).json({ error: "Failed to save PDF file" });
                    }
                    const editEnrollData = await enrollService.editEnrollDetailPayment(
                        req.body,
                        token,
                        isAdmin,
                        isBranch
                    );
                    res.status(editEnrollData.status).send(editEnrollData);
                }
                )
            } else {
                return res.status(400).json({ error: "Please provide file and file name" });
            }
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
exports.payPartialPayment = async (req, res) => {
    const headers = req.headers["authorization"];
    const uservalid = await verifyUser(headers);
    if (uservalid === true) {
        try {
            const isAdmin = req.params.admin
            const isBranch = req.params.branch
            const token = req.params.tokenId;
            if (req.body.file && req.body.fileName) {
                const base64Data = req.body.file.split(';base64,').pop();
                const fileName = req.body.fileName;
                const directoryPath = path.join(__dirname, '..', '..', 'public');
                const filePath = path.join(directoryPath, fileName);

                // Check if directory exists, create if not
                if (!fs.existsSync(directoryPath)) {
                    fs.mkdirSync(directoryPath, { recursive: true });
                }

                // Decode and write file
                fs.writeFile(filePath, base64Data, { encoding: 'base64' }, async (err) => {
                    if (err) {
                        console.error("Error saving PDF file:", err);
                        return res.status(500).json({ error: "Failed to save PDF file" });
                    }
                    const editEnrollData = await enrollService.payPartialPayment(
                        req.body,
                        token,
                        isAdmin,
                        isBranch
                    );

                    res.status(editEnrollData.status).send(editEnrollData);
                });
            } else {
                return res.status(400).json({ error: "Please provide file and file name" });
            }
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
exports.editStatusEnroll = async (req, res) => {
    const headers = req.headers["authorization"];
    const uservalid = await verifyUser(headers);
    if (uservalid === true) {
        try {
            const isAdmin = req.params.admin
            const isBranch = req.params.branch
            const token = req.params.tokenId;
            const editEnrollData = await enrollService.editStatusEnrollDetail(
                { status: req.body.status },
                token,
                isAdmin,
                isBranch
            );

            res.status(editEnrollData.status).send(editEnrollData);
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

exports.deleteEnroll = async (req, res) => {
    const headers = req.headers["authorization"];
    const uservalid = await verifyUser(headers);
    if (uservalid === true) {
        try {
            const isAdmin = req.params.admin
            const isBranch = req.params.branch
            const token = req.params.tokenId;
            const deleteEnrollData = await enrollService.deleteEnrollDetail(
                token,
                isAdmin,
                isBranch
            );

            res.status(deleteEnrollData.status).send(deleteEnrollData);
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
exports.deleteDemoEnroll = async (req, res) => {
    const headers = req.headers["authorization"];
    const uservalid = await verifyUser(headers);
    if (uservalid === true) {
        try {
            const isAdmin = req.params.admin
            const isBranch = req.params.branch
            const token = req.params.tokenId;
            const deleteEnrollData = await enrollService.deleteDemoEnroll(
                token,
                isAdmin,
                isBranch
            );

            res.status(deleteEnrollData.status).send(deleteEnrollData);
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
