const message = require("../../common/error.message");
const enrollModel = require("../../model/enroll/enrollPayment.model");
const immigrationModel = require("../../model/Enquire/Immigration.model");
const itCoursesModel = require("../../model/Enquire/ItCourses.model");
const competitiveExamModel = require("../../model/Enquire/CompetitiveExam.model");
const courseModel = require("../../model/admin/Course.model");
const CompleteEnrollDetail = require("../../model/enroll/completeEnroll.model");
const { parse } = require('date-fns'); // Import the date-fns library for date parsing
const { default: mongoose } = require("mongoose");
const DemoEnrollDetail = require("../../model/enroll/demoEnroll.medel");
const SettleEnrollDetail = require("../../model/enroll/settleEnroll.model");
const counterNumbersDetail = require("../../model/counter/counter.model");
const paymentSlipDetail = require("../../model/enroll/paymentSlip.model");
const moment = require('moment-timezone');
// Load timezone data
require('moment-timezone');
const settlePaymentSlipDetail = require("../../model/enroll/settlePaymentSlip.model");
const { default: axios } = require("axios");
function formatDate(timestamp) {
    const date = new Date(timestamp);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
}
function convertDateFormat(inputDate) {
    // Split the input date into year, month, and day
    var dateParts = inputDate.split('-');

    // Create a new Date object with the extracted parts
    var convertedDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);

    // Extract day, month, and year from the Date object
    var day = convertedDate.getDate();
    var month = convertedDate.getMonth() + 1; // Month is zero-based, so we add 1
    var year = convertedDate.getFullYear();

    // Format the date in DD/MM/YYYY
    var formattedDate = (day < 10 ? '0' : '') + day + '/' + (month < 10 ? '0' : '') + month + '/' + year;
    return formattedDate;
}
function convertDate(dateString) {
    var parts = dateString.split('/');
    // Note: Months in JavaScript are zero-based, so we subtract 1 from the month
    var dateObject = new Date(parts[2], parts[1] - 1, parts[0]);
    return dateObject.toISOString();
}
function convertDate1(dateString) {
    var parts = dateString.split('/');
    // Note: Months in JavaScript are zero-based, so we subtract 1 from the month
    var dateObject = new Date(parts[2], parts[1] - 1, parts[0]);
    dateObject.setDate(dateObject.getDate() + 1); // Adding one day
    return dateObject.toISOString();
}

exports.createEnrollDetail = async (enroll, isAdmin, isBranch) => {
    try {
        // Include isBranch in the enroll object
        const copyEnroll = { ...enroll };
        if (copyEnroll.paymentMethod == 'UPI' || copyEnroll.paymentMethod == 'Bank Transfer') {
            if (copyEnroll.paymentDetails == '') {
                return {
                    status: 500,
                    message: "Payment method is invalid or payment details are missing.",
                };
            }
        }
        enroll.branch = isBranch;

        // Await the result of courseModel.find()
        const fees = await courseModel.find({ courseName: enroll.course });

        // Assuming that fees is an array of results, you may need to pick the right one
        const selectedCourse = fees[0];

        // Convert totalFees and pendingFees to numbers, handling NaN
        const totalFeeswithoutd = (isNaN(parseFloat(selectedCourse.fees)) ? 0 : parseFloat(selectedCourse.fees))
        const totalFees = (isNaN(parseFloat(selectedCourse.fees)) ? 0 : parseFloat(selectedCourse.fees)) - (isNaN(parseFloat(enroll.discount)) ? 0 : parseFloat(enroll.discount)) || 0;
        const payFees = isNaN(parseFloat(enroll.payFees)) ? 0 : parseFloat(enroll.payFees);
        enroll.totalFees = isNaN(totalFeeswithoutd) ? 0 : totalFeeswithoutd;
        // Handle NaN in installmentAmount
        const installmentAmount = ((totalFees / (parseFloat(enroll.installment) || 0)));


        // Convert enroll.installmentDate to Date object
        // Assuming date is in the format dd/mm/yyyy
        const inputDateParts = enroll?.installmentDate.split('-');
        const inputYear = parseInt(inputDateParts[0], 10);
        const inputMonth = parseInt(inputDateParts[1], 10) - 1; // Months are zero-based in JavaScript
        const inputDay = parseInt(inputDateParts[2], 10);
        // Create a Date object using the given date
        const currentDate = new Date(Date.UTC(inputYear, inputMonth, inputDay, 0, 0, 0));

        // Get the next month
        currentDate.setMonth(currentDate.getMonth() + 1);

        // Calculate AllInstallmentDate, TotalPendingInstallment, NextInstallmentDate, and PendingInstallmentDate
        const allInstallmentDate = [];
        const userInstallmentDate = [];
        const userPaymentMethod = [];
        const arrayPaymentReceiver = [];
        const arrayPaymentDetails = [];
        const userPayment = enroll.paymentMethod;
        const paymentReceiver = enroll.paymentReceiver;
        const paymentDetails = (enroll.paymentMethod == 'UPI' || enroll.paymentMethod == 'Bank Transfer') ? enroll.paymentDetails : 'Cash';
        const totalPendingInstallment = enroll.installment - enroll.payInstallment;
        let nextInstallmentDate = null;
        const pendingInstallmentDate = [];

        if (totalPendingInstallment >= 1) {
            // Set NextInstallmentDate to the same date in the next month
            nextInstallmentDate = new Date(Date.UTC(inputYear, inputMonth + 1, inputDay, 0, 0, 0));

            for (let i = 0; i < totalPendingInstallment; i++) {
                allInstallmentDate.push(new Date(nextInstallmentDate).toISOString());
                nextInstallmentDate.setMonth(nextInstallmentDate.getMonth() + 1);
            }
        }
        if (enroll.payInstallment >= 1) {
            // Set NextInstallmentDate to the same date in the next month

            for (let i = 0; i < enroll.payInstallment; i++) {
                userInstallmentDate.push(new Date(Date.UTC(inputYear, inputMonth, inputDay, 0, 0, 0)).toISOString());
                userPaymentMethod.push(enroll.paymentMethod);
                arrayPaymentDetails.push((enroll.paymentMethod == 'UPI' || enroll.paymentMethod == 'Bank Transfer') ? enroll.paymentDetails : 'Cash');
                arrayPaymentReceiver.push(enroll.paymentReceiver);
            }
        }
        // Store nextInstallmentDate in the specified format
        const courseDurationDate = new Date(enroll?.enrollDate);
        courseDurationDate.setUTCMonth(courseDurationDate.getUTCMonth() + selectedCourse.courseDuration);
        // Store nextInstallmentDate in the specified format
        if (enroll.paymentType === "installment") {
            enroll.nextInstallmentDate = totalPendingInstallment >= 1 ? new Date(Date.UTC(inputYear, inputMonth + 1, inputDay, 0, 0, 0)).toISOString() : null;
            enroll.courseDuration = courseDurationDate.toISOString();
            enroll.allInstallmentDate = allInstallmentDate;
            enroll.userInstallmentDate = [...userInstallmentDate, ...allInstallmentDate];
            enroll.payInstallmentDate = [...userInstallmentDate];
            enroll.paymentMethod = [...userPaymentMethod];
            enroll.paymentReceiver = [...arrayPaymentReceiver];
            enroll.paymentDetails = [...arrayPaymentDetails];
            enroll.totalPendingInstallment = totalPendingInstallment;
            enroll.pendingInstallmentDate = pendingInstallmentDate;
            enroll.duePendingInstallment = 0;
            enroll.installmentAmount = (isNaN(installmentAmount) ? 0 : installmentAmount).toFixed(2);
        } else {
            enroll.nextInstallmentDate = null;
            enroll.courseDuration = courseDurationDate.toISOString();
            enroll.allInstallmentDate = [new Date(Date.UTC(inputYear, inputMonth, inputDay, 0, 0, 0)).toISOString()];
            enroll.userInstallmentDate = [new Date(Date.UTC(inputYear, inputMonth, inputDay, 0, 0, 0)).toISOString()];
            enroll.payInstallmentDate = [new Date(Date.UTC(inputYear, inputMonth, inputDay, 0, 0, 0)).toISOString()];
            enroll.paymentMethod = [userPayment];
            enroll.paymentReceiver = [paymentReceiver];
            enroll.paymentDetails = [paymentDetails];
            enroll.totalPendingInstallment = 0;
            enroll.pendingInstallmentDate = null;
            enroll.duePendingInstallment = 0;
            enroll.installmentAmount = totalFees.toFixed(2);
            enroll.installment = 1;
            enroll.payInstallment = 1;
        }
        enroll.installmentDate = convertDateFormat(enroll.installmentDate);
        enroll.enrollDate = formatDate(enroll?.enrollDate);

        // Calculate pendingFees based on totalFees and payFees
        const pendingFees = (totalFees - payFees).toFixed(2);
        if (Number(pendingFees) <= 0 && Number(pendingFees) !== 0) {
            return {
                status: 400,
                message: "Pending fees cannot be negative. Please check the payment amount.",
            };
        }

        enroll.pendingFees = pendingFees;

        const counterNumberArrays = await counterNumbersDetail.find();
        const counterNumbers = counterNumberArrays[0];

        counterNumbers.enrollNumber += 1;
        counterNumbers.paymentNumber += 1;
        enroll.enrollNumber = counterNumbers.enrollNumber;
        enroll.paymentSlipNumber = [counterNumbers.paymentNumber];
        // Save the updated document

        const newPaymentSlip = {}
        newPaymentSlip.name = copyEnroll.name;
        newPaymentSlip.course = copyEnroll.course;
        newPaymentSlip.payInstallmentFees = enroll.payFees;
        newPaymentSlip.payFeesDate = enroll.installmentDate;
        newPaymentSlip.payFeesFormatFeesDate = new Date(Date.UTC(inputYear, inputMonth, inputDay, 0, 0, 0)).toISOString();
        newPaymentSlip.paymentDetails = (copyEnroll.paymentMethod == 'UPI' || copyEnroll.paymentMethod == 'Bank Transfer') ? copyEnroll.paymentDetails : 'Cash';
        newPaymentSlip.payInstallment = copyEnroll.payInstallment;
        newPaymentSlip.paymentReceiver = copyEnroll.paymentReceiver;
        newPaymentSlip.paymentSlipNumber = counterNumbers.paymentNumber;
        newPaymentSlip.payInstallmentNumbers = Array.from({ length: copyEnroll.payInstallment }, (_, index) => index + 1);
        newPaymentSlip.payInstallmentDate = [...userInstallmentDate];
        newPaymentSlip.installmentAmount = enroll.installmentAmount;
        newPaymentSlip.paymentMethod = copyEnroll.paymentMethod;
        newPaymentSlip.tokenId = copyEnroll.tokenId;
        newPaymentSlip.enquireBranch = isBranch;
        newPaymentSlip.gstBranch = copyEnroll.gstBranch;
        newPaymentSlip.enquireType = copyEnroll.enquireType;
        if (copyEnroll.paymentType == 'fullFees') {
            newPaymentSlip.payInstallment = 1;
        }
        const slipExist = await paymentSlipDetail.find({
            tokenId: newPaymentSlip.tokenId, // replace 'abc' with newPaymentSlip.tokenId
            payInstallmentNumbers: { $in: newPaymentSlip.payInstallmentNumbers }
        });
        if (slipExist.length > 0) {
            return {
                status: 409,
                message: 'Record Already Exists',
            };
        }
        try {
            const enrollMsg = `Dear *${enroll?.name}*,
Congratulations on joining Sunrise Institute! We're thrilled to have you on board. Get ready for an enriching journey for your *${enroll?.course}*. Our team is here to support you every step of the way.
Let's embark on this adventure together!
Best regards,
*Sunrise Institute*
`;
            const encodedMsg = encodeURIComponent(enrollMsg);
            const url = `${process.env.WHATSAPP_URL}?number=91${enroll.mobileNumber}&type=media&message=${encodedMsg}&media_url=${process.env.MEDIA_URL}/${enroll?.fileName}&instance_id=${enroll.enquireBranch == 'Abrama, Mota Varachha' ? process.env.INSTANCE_ID_ABRAMA : enroll.enquireBranch == 'Sita Nagar' ? process.env.INSTANCE_ID_SITANAGER : process.env.INSTANCE_ID_ABC}&authorization=${process.env.ACCESS_TOKEN}`;
            // Make the HTTP POST request to send the birthday message
            await axios.post(url);
        } catch (error) {
            console.log('====================================');
            console.log(error);
            console.log('====================================');
            return {
                status: 500,
                message: "Internal Server Error",
            };
        }


        const paymentSlip = new paymentSlipDetail({
            ...newPaymentSlip,
        });
        await paymentSlip.save();
        await counterNumbers.save();
        const createEnrollDetail = new enrollModel(enroll);
        const detail = await createEnrollDetail.save();
        await DemoEnrollDetail.deleteOne({ token: copyEnroll.token });
        return {
            status: 200,
            message: message.ENQUIRE_IMMIGRATION_CREATED,
        };
    } catch (error) {
        console.log('====================================');
        console.log(error);
        console.log('====================================');
        return {
            status: 500,
            message: "Internal Server Error",
        };
    }
};

exports.editBookNumber = async (type) => {
    try {
        // Find the counter numbers detail
        const findSettleEnroll = await counterNumbersDetail.find();
        const counterNumbers = findSettleEnroll[0];

        // Increase the corresponding number based on the type
        if (type === 'paymentNumber') {
            counterNumbers.paymentNumber += 1;
        } else if (type === 'enrollNumber') {
            counterNumbers.enrollNumber += 1;
        } else if (type === 'enquireNumber') {
            counterNumbers.enquireNumber += 1;
        }

        // Save the updated document
        await counterNumbers.save();

        return {
            status: 200,
            message: message.IMMIGRATION_DATA_UPDATED,
        };
    } catch (error) {
        console.log('====================================');
        console.log(error);
        console.log('====================================');
        return {
            status: 500,
            message: "Internal Server Error",
        };
    }
};

exports.settleEnroll = async (enroll, isAdmin, isBranch) => {
    try {
        const findSettleEnrollStudent = await enrollModel.findOne({ tokenId: enroll?.token });
        if (!findSettleEnrollStudent) {
            return {
                status: 404,
                message: "Enrollment not found",
            };
        }

        const settleEnrollDetail = new SettleEnrollDetail({
            ...findSettleEnrollStudent.toObject(),
            refundAmount: enroll?.refundAmount,
            refundMethod: ['Bank Transfer'],
            settlementDate: new Date(),
        });

        // await paymentSlipDetail.deleteMany({ "paymentSlipNumber": { $in: findSettleEnrollStudent.paymentSlipNumber } });
        findSettleEnrollStudent.totalFees = (isNaN(parseFloat(enroll.payFees)) ? 0 : parseFloat(enroll.payFees));
        findSettleEnrollStudent.installment = 1;
        findSettleEnrollStudent.allInstallmentDate = [];
        findSettleEnrollStudent.userInstallmentDate = [convertDate(findSettleEnrollStudent.enrollDate)];
        findSettleEnrollStudent.payInstallmentDate = [convertDate(findSettleEnrollStudent.enrollDate)];
        findSettleEnrollStudent.courseDuration = new Date(new Date().setDate(new Date().getDate() - 1));
        findSettleEnrollStudent.nextInstallmentDate = null;
        findSettleEnrollStudent.pendingInstallmentDate = [];
        findSettleEnrollStudent.duePendingInstallment = 0;
        findSettleEnrollStudent.totalPendingInstallment = 0;
        findSettleEnrollStudent.pendingFees = 0;
        findSettleEnrollStudent.payInstallment = 1;
        findSettleEnrollStudent.refundMethod = ['Bank Transfer'];
        findSettleEnrollStudent.paymentMethod = ['Settlement'];
        findSettleEnrollStudent.paymentReceiver = [enroll?.paymentReceiver];
        findSettleEnrollStudent.paymentDetails = ['Cash'];
        findSettleEnrollStudent.discount = (isNaN(parseFloat(enroll.refundAmount)) ? 0 : parseFloat(enroll.refundAmount));
        findSettleEnrollStudent.payFees = (isNaN(parseFloat(enroll.payFees)) ? 0 : parseFloat(enroll.payFees)) - (isNaN(parseFloat(enroll.refundAmount)) ? 0 : parseFloat(enroll.refundAmount));
        findSettleEnrollStudent.installmentAmount = ((isNaN(parseFloat(enroll.payFees)) ? 0 : parseFloat(enroll.payFees)) - (isNaN(parseFloat(enroll.refundAmount)) ? 0 : parseFloat(enroll.refundAmount))).toFixed(2);
        const counterNumberArrays = await counterNumbersDetail.find();
        const counterNumbers = counterNumberArrays[0];

        counterNumbers.paymentNumber += 1;
        findSettleEnrollStudent.paymentSlipNumber = [counterNumbers.paymentNumber];
        await paymentSlipDetail.updateMany(
            { tokenId: findSettleEnrollStudent.tokenId },
            { $set: { filterNone: true } }
        );

        // Push deleted documents into CompleteEnrollDetail
        const newPaymentSlip = {};
        newPaymentSlip.name = findSettleEnrollStudent.name;
        newPaymentSlip.course = findSettleEnrollStudent.course;
        newPaymentSlip.payInstallmentFees = findSettleEnrollStudent.payFees;
        newPaymentSlip.payFeesDate = findSettleEnrollStudent.installmentDate;
        newPaymentSlip.payFeesFormatFeesDate = convertDate1(findSettleEnrollStudent.installmentDate);
        newPaymentSlip.paymentDetails = 'Cash';
        newPaymentSlip.payInstallment = findSettleEnrollStudent.payInstallment;
        newPaymentSlip.paymentReceiver = enroll?.paymentReceiver;
        newPaymentSlip.paymentSlipNumber = counterNumbers.paymentNumber;
        newPaymentSlip.payInstallmentNumbers = [1];
        newPaymentSlip.payInstallmentDate = findSettleEnrollStudent.userInstallmentDate;
        newPaymentSlip.installmentAmount = findSettleEnrollStudent.installmentAmount.toFixed(2);
        newPaymentSlip.paymentMethod = 'Settlement';
        newPaymentSlip.enquireBranch = isBranch;
        newPaymentSlip.gstBranch = findSettleEnrollStudent?.gstBranch;
        newPaymentSlip.enquireType = findSettleEnrollStudent?.enquireType;
        newPaymentSlip.tokenId = findSettleEnrollStudent?.tokenId;
        const paymentSlip = new paymentSlipDetail({
            ...newPaymentSlip,
        });
        await settleEnrollDetail.save();
        await paymentSlip.save();
        await counterNumbers.save();
        await enrollModel.deleteOne({ tokenId: enroll?.token });
        // Save the updated document

        // Create CompleteEnrollDetail document
        const completeEnrollDetail = new CompleteEnrollDetail({
            ...findSettleEnrollStudent.toObject(),
        });
        await completeEnrollDetail.save();

        return {
            status: 200,
            message: message.IMMIGRATION_DATA_UPDATED,
        };
    } catch (error) {
        console.log('====================================');
        console.log(error);
        console.log('====================================');
        return {
            status: 500,
            message: "Internal Server Error",
        };
    }
};
exports.createDemoEnroll = async (enroll, isAdmin, isBranch) => {
    try {
        const createDemoDetail = new DemoEnrollDetail(enroll);
        const detail = await createDemoDetail.save();

        return {
            status: 200,
            message: message.ENQUIRE_IMMIGRATION_CREATED,
        };
    } catch (error) {
        console.log('====================================');
        console.log(error);
        console.log('====================================');
        return {
            status: 500,
            message: "Internal Server Error",
        };
    }
};

exports.getDemoEnroll = async (isAdmin, isBranch) => {
    try {
        let query = {};

        // If the user is not an admin, retrieve data based on the specified branch
        if (isAdmin !== 'master') {
            query.branch = isBranch;
        }

        const currentDate = new Date();
        const twoDaysAgo = new Date(currentDate);
        twoDaysAgo.setDate(currentDate.getDate() - 2);
        // Fetch demo enrollments that occurred exactly two days ago
        const demoEnrollments = await DemoEnrollDetail.find({
            demoDate: {
                $lt: twoDaysAgo,  // Greater than or equal to two days ago
            },
        });

        const matchedCourses = [];

        for (const enrollment of demoEnrollments) {
            const tokenId = enrollment.tokenId;
            const [competitiveExamCourse, itCourse, immigrationCourse] = await Promise.all([
                competitiveExamModel.findOne({ tokenId, ...query }),
                itCoursesModel.findOne({ tokenId, ...query }),
                immigrationModel.findOne({ tokenId, ...query })
            ]);

            const courses = [];

            if (competitiveExamCourse) {
                courses.push({ ...competitiveExamCourse._doc, demoDate: formatDates(enrollment.demoDate) });
            }
            if (itCourse) {
                courses.push({ ...itCourse._doc, demoDate: formatDates(enrollment.demoDate) });
            }
            if (immigrationCourse) {
                courses.push({ ...immigrationCourse._doc, demoDate: formatDates(enrollment.demoDate) });
            }

            matchedCourses.push(...courses);
        }

        if (matchedCourses.length > 0) {
            return matchedCourses;
        } else {
            return {
                status: 404,
                message: "No matching demo student found or demo dates are not two days ago",
            };
        }

    } catch (error) {
        console.error(error);
        return {
            status: 500,
            message: "Internal Server Error",
        };
    }
};

function formatDates(date) {
    const formattedDate = new Date(date);
    const day = formattedDate.getDate().toString().padStart(2, '0');
    const month = (formattedDate.getMonth() + 1).toString().padStart(2, '0');
    const year = formattedDate.getFullYear();
    return `${day}/${month}/${year}`;
}


exports.findCheckEnroll = async (body, isAdmin, isBranch) => {
    try {
        // Construct the query to find past installments
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0); // Set the time to midnight

        // Adjust the query to compare only the date part
        let query = {
            paymentType: "installment",
            $or: [
                { nextInstallmentDate: { $lte: currentDate.toISOString() } },
                { pendingInstallmentDate: { $exists: true, $ne: [], $lte: currentDate.toISOString() } }
            ]
        };

        let courseDurationQuery = {
            $and: [
                { courseDuration: { $lte: currentDate.toISOString() } },
                { totalPendingInstallment: 0 },
                { pendingFees: 0 },
                {
                    $or: [
                        { partialPayment: 0 },
                        { partialPayment: '' },
                        { partialPayment: null }
                    ]
                }
            ]
        };
        // Find documents that match the courseDurationQuery
        const courseDurationData = await enrollModel.find(courseDurationQuery);
        if (courseDurationData.length > 0) {
            const tokenIdsToDelete = courseDurationData.map(data => data.tokenId);

            // Loop through each tokenId and delete documents from all models
            for (const tokenIdToDelete of tokenIdsToDelete) {
                await Promise.all([
                    immigrationModel.deleteMany({ tokenId: tokenIdToDelete }),
                    itCoursesModel.deleteMany({ tokenId: tokenIdToDelete }),
                    competitiveExamModel.deleteMany({ tokenId: tokenIdToDelete }),
                ]);
            }
            // Delete documents from enrollModel
            await enrollModel.deleteMany(courseDurationQuery);

            // Push deleted documents into CompleteEnrollDetail
            await CompleteEnrollDetail.insertMany(courseDurationData);
        }

        // If the user is not an admin, include branch in the query
        if (isAdmin !== 'master') {
            query.enquireBranch = isBranch;
        }

        // Find installments based on the constructed query
        const pastInstallments = await enrollModel.find(query);
        // Check if nextInstallmentDate does not exist in pendingInstallmentDate and push it
        for (const installment of pastInstallments) {
            if (!installment.pendingInstallmentDate) {
                installment.pendingInstallmentDate = [];
            }
            if (!installment.pendingInstallmentDate.includes(installment.nextInstallmentDate)) {
                installment.pendingInstallmentDate.push(installment.nextInstallmentDate);

                // Assuming allInstallmentDate is an array of all installment dates
                const currentDate = new Date(); // Get the current date

                // Filter the installments that are pending (on or after the current date)
                const pendingInstallments = installment.allInstallmentDate.filter(installmentDate => new Date(installmentDate).getTime() <= currentDate.getTime());

                // Update the nextInstallmentDate with the pending installments
                installment.pendingInstallmentDate = pendingInstallments;
                installment.nextInstallmentDate = installment.allInstallmentDate?.[pendingInstallments.length] || null;

                installment.duePendingInstallment = installment.pendingInstallmentDate.length;

                // Save the updated data back to the database
                await installment.save();
            }
        }

        // Return the result with the updated pendingInstallmentDate
        // Sort based on the last index value of pendingInstallmentDate
        pastInstallments.sort(function (a, b) {
            // Get the last index value of pendingInstallmentDate for comparison
            var lastDateA = new Date(a?.pendingInstallmentDate[a.pendingInstallmentDate.length - 1] || 0).getTime();
            var lastDateB = new Date(b?.pendingInstallmentDate[b.pendingInstallmentDate.length - 1] || 0).getTime();

            // Compare dates
            return lastDateB - lastDateA;
        });
        let totalPendingInstallmentAmount = 0;
        pastInstallments.forEach(function (item) {
            // Check if the item has the necessary properties
            if (item && item.pendingInstallmentDate && item.installmentAmount !== undefined) {
                // Convert pendingInstallmentDate to the desired format
                item.pendingInstallmentDate = item.pendingInstallmentDate.map(function (dateString) {
                    var date = new Date(dateString);
                    var day = date.getDate().toString().padStart(2, '0');
                    var month = (date.getMonth() + 1).toString().padStart(2, '0');
                    var year = date.getFullYear();
                    return `${day}/${month}/${year}`;
                });

                // Calculate totalPendingInstallmentAmount
                totalPendingInstallmentAmount += (item.pendingInstallmentDate.length * item.installmentAmount);
                if (!isNaN(parseFloat(item.partialPayment))) {
                    if (parseFloat(item.partialPayment) >= 0) {
                        totalPendingInstallmentAmount += parseFloat(item.partialPayment);
                    } else {
                        totalPendingInstallmentAmount -= parseFloat(item.partialPayment);
                    }
                }
            }
        });
        return { totalPendingInstallmentAmount, pastInstallments };

    } catch (error) {
        console.error(error);
        return {
            status: 500,
            message: "Internal Server Error",
        };
    }
};
exports.getPartialPayment = async (body, isAdmin, isBranch) => {
    try {
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0); // Set the time to midnight

        let courseDurationQuery = {
            totalPendingInstallment: 0,
            pendingFees: { $ne: 0 },
            partialPayment: { $ne: 0 },
        };

        // If the user is not an admin, retrieve data based on the specified branch
        if (isAdmin !== 'master') {
            courseDurationQuery.enquireBranch = isBranch;
        }

        // Ensure query is properly formatted
        if (body && typeof body === 'object') {
            for (const key in body) {
                // Only include valid keys from the body
                if (body.hasOwnProperty(key)) {
                    if (key === 'name' && body.name) {
                        // Slice the name into space-separated parts
                        const names = body.name.split(' ');
                        // Create a regex to match each part of the sliced name
                        courseDurationQuery[key] = { $all: names.map(name => new RegExp(name, 'i')) };
                    } else if (Array.isArray(body[key])) {
                        // Use $all operator to find documents where the specified array is a subset
                        courseDurationQuery[key] = { $all: body[key].map(val => new RegExp(val, 'i')) };
                    } else {
                        // Use regex for case-insensitive matching
                        courseDurationQuery[key] = new RegExp(body[key], 'i');
                    }
                }
            }
        }
        // Execute the query
        let courseDurationData = await enrollModel.find(courseDurationQuery);
        // Reverse the results if needed
        courseDurationData = courseDurationData.reverse();

        return courseDurationData;

    } catch (error) {
        console.error(error);
        return {
            status: 500,
            message: "Internal Server Error",
        };
    }
};


exports.findCheckFilterEnroll = async (body, isAdmin, isBranch) => {
    try {
        let query = {};

        // If the user is not an admin, retrieve data based on the specified branch
        if (isAdmin !== 'master') {
            query.enquireBranch = isBranch;
        }

        // Extracting startDate and endDate from the request body
        const startDate = (body.startDate ? new Date(body.startDate) : new Date());

        // Use current date as endDate if not provided
        const endDate = body.endDate ? new Date(body.endDate) : new Date();
        if (body?.enquireBranch) {
            query.enquireBranch = body?.enquireBranch;
        }
        // Adding conditions for date range in the query for enrollModel
        query.pendingInstallmentDate = {
            $elemMatch: {
                $gte: startDate?.toISOString(),
                $lte: endDate?.toISOString()
            }
        };
        const getEnroll = await enrollModel.find(query);
        let totalPendingInstallmentAmount = 0;

        const manipulatedResult = getEnroll.map(enroll => {
            const installmentAmount = enroll.installmentAmount;

            // Format userInstallmentDate to have the key name 'InstallmentDate' and use the desired date format
            const installmentDate = enroll.pendingInstallmentDate
                .filter(date => date >= startDate.toISOString() && date <= endDate.toISOString())
                .map(dateString => {
                    const date = new Date(dateString);
                    const day = date.getDate().toString().padStart(2, '0');
                    const month = (date.getMonth() + 1).toString().padStart(2, '0');
                    const year = date.getFullYear();
                    return `${day}/${month}/${year}`;
                });

            enroll.pendingInstallmentDate = installmentDate

            const payAmount = installmentDate.length * installmentAmount;
            totalPendingInstallmentAmount += installmentDate.length * installmentAmount;
            return { ...enroll.toObject(), payAmount, installmentDate };
        });

        return { totalPendingInstallmentAmount, manipulatedResult };

    } catch (error) {
        console.log('====================================');
        console.log(error, error instanceof mongoose.Error.ValidationError);
        console.log('====================================');

        if (error instanceof mongoose.Error.ValidationError) {
            const errorMessages = [];

            // Loop through the validation errors and push corresponding messages
            for (const key in error.errors) {
                if (error.errors.hasOwnProperty(key)) {
                    errorMessages.push({
                        field: key,
                        message: error.errors[key].message,
                    });
                }
            }

            return {
                status: 400,
                message: "Validation Error",
                errors: errorMessages,
            };
        } else {
            console.error(error);  // Log the unexpected error for further investigation
            return {
                status: 500,
                message: "Internal Server Error",
            };
        }
    }
};

exports.editEnrollDetail = async (data, token, isAdmin, isBranch) => {
    try {
        const copyData = { ...data };
        if (copyData.paymentMethod == 'UPI' || copyData.paymentMethod == 'Bank Transfer') {
            if (copyData.paymentDetails == '') {
                return {
                    status: 500,
                    message: "Payment method is invalid or payment details are missing.",
                };
            }
        }

        const enrollStudentCourse = await enrollModel.findOne({ tokenId: token });
        const fees = await courseModel.find({ courseName: data.course });
        if (!fees || fees.length === 0) {
            return {
                status: 404,
                message: "Course not found.",
            };
        }

        const selectedCourse = fees[0];
        if (data.course == enrollStudentCourse.course) {
            selectedCourse.fees = enrollStudentCourse.totalFees;
        }

        const totalFeesWithoutDiscount = parseFloat(selectedCourse.fees) || 0;
        const discount = parseFloat(data.discount) || 0;
        const totalFees = totalFeesWithoutDiscount - discount;
        const payFees = parseFloat(data.payFees) || 0;

        data.totalFees = totalFeesWithoutDiscount;

        const installmentCount = parseFloat(data.installment) || 1;
        const installmentAmount = (totalFees / installmentCount).toFixed(2);
        data.installmentAmount = isNaN(installmentAmount) ? 0 : installmentAmount;

        const pendingFees = (totalFees - payFees).toFixed(2);
        if (Number(pendingFees) < 0) {
            return {
                status: 400,
                message: "Pending fees cannot be negative. Please check the payment amount.",
            };
        }

        data.pendingFees = pendingFees;
        const counterNumberArrays = await counterNumbersDetail.find();
        const counterNumbers = counterNumberArrays[0];

        counterNumbers.paymentNumber += 1;
        data.paymentSlipNumber = [counterNumbers.paymentNumber];
        // Save the updated document
        // await counterNumbers.save();
        // Calculate nextInstallmentDate, allInstallmentDate, totalPendingInstallment, pendingInstallmentDate, and duePendingInstallment
        const inputDateParts = data?.installmentDate.split('-');
        const inputYear = parseInt(inputDateParts[0], 10);
        const inputMonth = parseInt(inputDateParts[1], 10) - 1; // Months are zero-based in JavaScript
        const inputDay = parseInt(inputDateParts[2], 10);

        const allInstallmentDate = [];
        const userInstallmentDate = [];
        const userPaymentMethod = [];
        const arrayPaymentReceiver = [];
        const arrayPaymentDetails = [];
        const userPayment = data.paymentMethod;
        const paymentReceiver = data.paymentReceiver;
        const paymentDetails = (data.paymentMethod == 'UPI' || data.paymentMethod == 'Bank Transfer') ? data.paymentDetails : 'Cash';
        const totalPendingInstallment = data.installment - data.payInstallment;
        let nextInstallmentDate = null;
        const pendingInstallmentDate = [];

        if (totalPendingInstallment >= 1) {
            // Set NextInstallmentDate to the same date in the next month
            nextInstallmentDate = new Date(Date.UTC(inputYear, inputMonth + 1, inputDay, 0, 0, 0));

            for (let i = 0; i < totalPendingInstallment; i++) {
                allInstallmentDate.push(new Date(nextInstallmentDate).toISOString());
                nextInstallmentDate.setMonth(nextInstallmentDate.getMonth() + 1);
            }
        }

        if (data.payInstallment >= 1) {
            // Set NextInstallmentDate to the same date in the next month

            for (let i = 0; i < data.payInstallment; i++) {
                userInstallmentDate.push(new Date(Date.UTC(inputYear, inputMonth, inputDay, 0, 0, 0)).toISOString());
                userPaymentMethod.push(data.paymentMethod);
                arrayPaymentDetails.push((data.paymentMethod == 'UPI' || data.paymentMethod == 'Bank Transfer') ? data.paymentDetails : 'Cash');
                arrayPaymentReceiver.push(data.paymentReceiver);
            }
        }
        const enrollStudent = await enrollModel.findOne({ tokenId: token });
        await paymentSlipDetail.deleteMany({ "paymentSlipNumber": { $in: enrollStudent.paymentSlipNumber } });
        // Store nextInstallmentDate in the specified format
        const parts = enrollStudent?.enrollDate?.split('/'); // Split the string into day, month, and year parts
        const day = parseInt(parts[0], 10); // Convert day part to integer
        const month = parseInt(parts[1], 10) - 1; // Convert month part to integer (subtract 1 because JavaScript months are 0-indexed)
        const year = parseInt(parts[2], 10); // Convert year part to integer
        const courseDurationDate = new Date(year, month, day);
        courseDurationDate.setUTCMonth(courseDurationDate.getUTCMonth() + selectedCourse.courseDuration);
        if (data.paymentType === "installment") {
            data.nextInstallmentDate = totalPendingInstallment >= 1 ? new Date(Date.UTC(inputYear, inputMonth + 1, inputDay, 0, 0, 0)).toISOString() : null;

            data.allInstallmentDate = allInstallmentDate;
            data.userInstallmentDate = [...userInstallmentDate, ...allInstallmentDate];
            data.courseDuration = courseDurationDate.toISOString();
            data.payInstallmentDate = [...userInstallmentDate];
            data.paymentMethod = [...userPaymentMethod];
            data.paymentReceiver = [...arrayPaymentReceiver];
            data.paymentDetails = [...arrayPaymentDetails];
            data.totalPendingInstallment = totalPendingInstallment;
            data.pendingInstallmentDate = pendingInstallmentDate;
            data.duePendingInstallment = 0;
        } else {
            data.nextInstallmentDate = null;
            data.courseDuration = courseDurationDate.toISOString();
            data.allInstallmentDate = [new Date(Date.UTC(inputYear, inputMonth, inputDay, 0, 0, 0)).toISOString()];
            data.userInstallmentDate = [new Date(Date.UTC(inputYear, inputMonth, inputDay, 0, 0, 0)).toISOString()];
            data.payInstallmentDate = [new Date(Date.UTC(inputYear, inputMonth, inputDay, 0, 0, 0)).toISOString()];
            data.paymentMethod = [userPayment];
            data.paymentReceiver = [paymentReceiver];
            data.paymentDetails = [paymentDetails];
            data.totalPendingInstallment = 0;
            data.pendingInstallmentDate = null;
            data.duePendingInstallment = 0;
            data.installmentAmount = totalFees.toFixed(2);
            data.installment = 1;
            data.payInstallment = 1;
        }
        data.installmentDate = convertDateFormat(data.installmentDate);
        // Save the updated document
        const newPaymentSlip = {}
        newPaymentSlip.name = copyData.name;
        newPaymentSlip.course = copyData.course;
        newPaymentSlip.payInstallmentFees = copyData.payFees;
        newPaymentSlip.payFeesDate = data.installmentDate;
        newPaymentSlip.payFeesFormatFeesDate = new Date(Date.UTC(inputYear, inputMonth, inputDay, 0, 0, 0)).toISOString();
        newPaymentSlip.paymentDetails = (copyData.paymentMethod == 'UPI' || copyData.paymentMethod == 'Bank Transfer') ? copyData.paymentDetails : 'Cash';
        newPaymentSlip.payInstallment = copyData.payInstallment;
        newPaymentSlip.paymentReceiver = copyData.paymentReceiver;
        newPaymentSlip.paymentSlipNumber = counterNumbers.paymentNumber;
        newPaymentSlip.payInstallmentNumbers = Array.from({ length: copyData.payInstallment }, (_, index) => index + 1);
        newPaymentSlip.payInstallmentDate = [...userInstallmentDate];
        newPaymentSlip.installmentAmount = data.installmentAmount;
        newPaymentSlip.paymentMethod = copyData.paymentMethod;
        newPaymentSlip.enquireBranch = isBranch;
        newPaymentSlip.gstBranch = data.gstBranch;
        newPaymentSlip.enquireType = data.enquireType;
        newPaymentSlip.tokenId = token;
        if (copyData.paymentType == 'fullFees') {
            newPaymentSlip.payInstallment = 1;
        }
        const paymentSlip = new paymentSlipDetail({
            ...newPaymentSlip,
        });
        const msgData = await enrollModel.findOne({ tokenId: token });
        try {
            const enrollMsg = `Dear *${msgData?.name}*,
Congratulations on joining Sunrise Institute! We're thrilled to have you on board. Get ready for an enriching journey for your *${data?.course}*. Our team is here to support you every step of the way.
Let's embark on this adventure together!
Best regards,
*Sunrise Institute*
`;
            const encodedMsg = encodeURIComponent(enrollMsg);
            const url = `${process.env.WHATSAPP_URL}?number=91${msgData.mobileNumber}&type=media&message=${encodedMsg}&message=${encodedMsg}&media_url=${process.env.MEDIA_URL}/${data?.fileName}&instance_id=${msgData.enquireBranch == 'Abrama, Mota Varachha' ? process.env.INSTANCE_ID_ABRAMA : msgData.enquireBranch == 'Sita Nagar' ? process.env.INSTANCE_ID_SITANAGER : process.env.INSTANCE_ID_ABC}&authorization=${process.env.ACCESS_TOKEN}`;
            // Make the HTTP POST request to send the birthday message
            await axios.post(url);
        } catch (error) {
            console.log('====================================');
            console.log(error);
            console.log('====================================');
            return {
                status: 500,
                message: "Internal Server Error",
            };
        }
        await paymentSlip.save();

        await counterNumbers.save();
        const editEnroll = await enrollModel.findOneAndUpdate(
            { tokenId: token },
            data,
            { new: true }
        );

        if (!editEnroll) {
            return {
                status: 404,
                message: message.IMMIGRATION_NOT_FOUND,
            };
        }

        return {
            status: 200,
            message: message.IMMIGRATION_DATA_UPDATED,
        };
    } catch (error) {
        console.log('====================================');
        console.log(error);
        console.log('====================================');
        return {
            status: 500,
            message: "Internal Server Error",
        };
    }
};

exports.editEnrollDetailPayment = async (data, token, isAdmin, isBranch) => {
    const copyEnroll = { ...data };
    try {
        if (copyEnroll.paymentMethod == 'UPI' || copyEnroll.paymentMethod == 'Bank Transfer') {
            if (copyEnroll.paymentDetails == '') {
                return {
                    status: 500,
                    message: "Payment method is invalid or payment details are missing.",
                };
            }
        }
    } catch (error) {
        console.log('====================================');
        console.log(error);
        console.log('====================================');
        return {
            status: 500,
            message: "Internal Server Error",
        };
    }
    try {
        const enrollDataBase = await enrollModel.find({ tokenId: token });
        const enrollUser = enrollDataBase[0];

        const payPendingInstallment = isNaN(parseFloat(data.duePendingInstallment)) ? 0 : parseFloat(data.duePendingInstallment);
        const payInstallment = isNaN(parseFloat(enrollUser.payInstallment)) ? 0 : parseFloat(enrollUser.payInstallment);
        const userPayment = data.paymentMethod;
        const paymentReceiver = data.paymentReceiver;
        const paymentDetails = (data.paymentMethod == 'UPI' || data.paymentMethod == 'Bank Transfer') ? data.paymentDetails : 'Cash';
        const counterNumberArrays = await counterNumbersDetail.find();
        const counterNumbers = counterNumberArrays[0];

        counterNumbers.paymentNumber += 1;
        if (enrollUser.paymentSlipNumber?.includes(counterNumbers.paymentNumber)) {
            // If not included, return 404 status with a message
            return {
                status: 404,
                message: "Counter payment number not found in payment slip numbers.",
            };
        } else {
            data.paymentSlipNumber = [...enrollUser.paymentSlipNumber, counterNumbers.paymentNumber];
        }
        // Save the updated document
        // await counterNumbers.save();
        if (data?.duePendingInstallment && isNaN(parseFloat(data.duePendingInstallment)) ? 0 : parseFloat(data.duePendingInstallment) && isNaN(parseFloat(data.duePendingInstallment)) ? 0 : parseFloat(data.duePendingInstallment) > 0) {
            // Initialize payInstallmentDate as an array if not already defined
            data.payInstallmentDate = enrollUser.payInstallmentDate || [];
            data.paymentMethod = enrollUser.paymentMethod || [];
            data.paymentDetails = enrollUser.paymentDetails || [];
            data.paymentReceiver = enrollUser.paymentReceiver || [];
            data.userInstallmentDate = enrollUser?.userInstallmentDate;

            // Loop based on the value of duePendingInstallment and push payFeesDate into payInstallmentDate
            const isoFormattedDate = new Date(data.payFeesDate).toISOString();
            for (let i = 0; i < data.duePendingInstallment || 0; i++) {
                data.payInstallmentDate.push(isoFormattedDate);
                data.paymentMethod.push(userPayment);
                data.paymentDetails.push(paymentDetails);
                data.paymentReceiver.push(paymentReceiver);
                data.userInstallmentDate[enrollUser?.payInstallment + i] = isoFormattedDate;
            }
        }

        // Calculate total paid installment
        data.payInstallment = payInstallment + payPendingInstallment;
        // Assign pending installment date
        data.pendingInstallmentDate = enrollUser.pendingInstallmentDate;

        // Calculate pending fees
        const installmentAmount = parseFloat(enrollUser.installmentAmount) || 0;
        const installment = parseFloat(data?.installment) || 0;
        const partialPayment = parseFloat(data?.partialPayment) || 0;
        data.pendingFees = ((installmentAmount * (installment - (payInstallment + payPendingInstallment))) + partialPayment).toFixed(2);
        if (data.pendingFees < 0) {
            return {
                status: 409,
                message: 'Something is wrong: pending fees cannot be negative',
            };
        }
        data.payFees = ((installmentAmount * (payInstallment + payPendingInstallment)) - partialPayment).toFixed(2);

        // Calculate total pending installment
        data.totalPendingInstallment = data.installment - data.payInstallment;

        data.installmentDate = enrollUser?.installmentDate;


        // Update installment payment logic
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        const newPaymentSlip = {}
        const inputDateParts = copyEnroll?.payFeesDate.split('-');
        const inputDay = parseInt(inputDateParts[0], 10);
        const inputMonth = parseInt(inputDateParts[1], 10) - 1; // Months are zero-based in JavaScript
        const inputYear = parseInt(inputDateParts[2], 10);
        // Remove the first N dates from allInstallmentDate and pendingInstallmentDate
        const numberOfInstallmentsToRemove = data.duePendingInstallment || 0;

        newPaymentSlip.name = copyEnroll.name;
        newPaymentSlip.course = copyEnroll.course;
        newPaymentSlip.payInstallmentFees = copyEnroll.payInstallmentFees;
        newPaymentSlip.payFeesDate = convertDateFormat(copyEnroll.payFeesDate);
        newPaymentSlip.payFeesFormatFeesDate = new Date(data.payFeesDate).toISOString();
        // newPaymentSlip.payInstallmentDate = copyEnroll.installmentDate;
        newPaymentSlip.paymentDetails = (copyEnroll.paymentMethod == 'UPI' || copyEnroll.paymentMethod == 'Bank Transfer') ? copyEnroll.paymentDetails : 'Cash';
        newPaymentSlip.payInstallment = copyEnroll.duePendingInstallment || (copyEnroll.duePendingInstallment == '' || copyEnroll.duePendingInstallment == 0 || copyEnroll.duePendingInstallment == '0') ? 'Partial Payment' : 0;
        newPaymentSlip.paymentReceiver = copyEnroll.paymentReceiver;
        newPaymentSlip.paymentSlipNumber = counterNumbers.paymentNumber;
        newPaymentSlip.payInstallmentNumbers = Array.from(
            { length: copyEnroll.duePendingInstallment },
            (_, index) => index + payInstallment + 1
        );
        newPaymentSlip.installmentAmount = data.installmentAmount;
        newPaymentSlip.paymentMethod = copyEnroll.paymentMethod;
        newPaymentSlip.tokenId = token;
        newPaymentSlip.enquireBranch = isBranch;
        newPaymentSlip.gstBranch = enrollUser?.gstBranch;
        newPaymentSlip.enquireType = enrollUser?.enquireType;

        const findUser = await enrollModel.findOne(
            { tokenId: token }
        );
        newPaymentSlip.payInstallmentDate = findUser.allInstallmentDate.slice(0, numberOfInstallmentsToRemove);
        data.allInstallmentDate = findUser.allInstallmentDate.slice(numberOfInstallmentsToRemove);
        data.pendingInstallmentDate = findUser.pendingInstallmentDate.slice(numberOfInstallmentsToRemove);
        data.nextInstallmentDate = findUser?.allInstallmentDate?.[0] || null;
        data.duePendingInstallment = findUser.pendingInstallmentDate.length || 0;

        const paymentSlip = new paymentSlipDetail({
            ...newPaymentSlip,
        });
        const slipExist = await paymentSlipDetail.find({
            tokenId: newPaymentSlip.tokenId, // replace 'abc' with newPaymentSlip.tokenId
            payInstallmentNumbers: { $in: newPaymentSlip.payInstallmentNumbers }
        });
        if (slipExist.length > 0) {
            return {
                status: 409,
                message: 'Record Already Exists',
            };
        }
        const msgData = await enrollModel.findOne({ tokenId: token });
        try {
            const url = `${process.env.WHATSAPP_URL}?number=91${msgData.mobileNumber}&type=media&message=${''}&media_url=${process.env.MEDIA_URL}/${data?.fileName}&instance_id=${msgData.enquireBranch == 'Abrama, Mota Varachha' ? process.env.INSTANCE_ID_ABRAMA : msgData.enquireBranch == 'Sita Nagar' ? process.env.INSTANCE_ID_SITANAGER : process.env.INSTANCE_ID_ABC}&authorization=${process.env.ACCESS_TOKEN}`;
            // Make the HTTP POST request to send the birthday message
            await axios.post(url);
        } catch (error) {
            console.log('====================================');
            console.log(error);
            console.log('====================================');
            return {
                status: 500,
                message: "Internal Server Error",
            };
        }

        await paymentSlip.save();

        await counterNumbers.save();
        // Save the updated data back to the database
        await enrollModel.findOneAndUpdate(
            { tokenId: token },
            data,
            { new: true }
        );

        return {
            status: 200,
            message: "Enroll data updated successfully.",
        };
    } catch (error) {
        console.log('====================================');
        console.log(error);
        console.log('====================================');
        return {
            status: 500,
            message: "Internal Server Error",
        };
    }
};

exports.payPartialPayment = async (data, token, isAdmin, isBranch) => {
    const copyEnroll = { ...data };
    try {
        if (copyEnroll.paymentMethod == 'UPI' || copyEnroll.paymentMethod == 'Bank Transfer') {
            if (copyEnroll.paymentDetails == '') {
                return {
                    status: 500,
                    message: "Payment method is invalid or payment details are missing.",
                };
            }
        }
    } catch (error) {
        console.log('====================================');
        console.log(error);
        console.log('====================================');
        return {
            status: 500,
            message: "Internal Server Error",
        };
    }
    try {
        const enrollDataBase = await enrollModel.find({ tokenId: data.tokenId });
        const enrollUser = enrollDataBase[0];
        const counterNumberArrays = await counterNumbersDetail.find();
        const counterNumbers = counterNumberArrays[0];
        counterNumbers.paymentNumber += 1;
        enrollUser.pendingFees = (enrollUser.pendingFees - data.partialPayment).toFixed(2);
        if (enrollUser.pendingFees < 0) {
            return {
                status: 409,
                message: 'Something is wrong: pending fees cannot be negative',
            };
        }
        enrollUser.partialPayment = (enrollUser.partialPayment - data.partialPayment).toFixed(2);
        enrollUser.payFees = enrollUser.payFees + data.partialPayment;
        enrollUser.payInstallmentDate.push('Partial Payment');
        enrollUser.paymentReceiver.push(data.paymentReceiver);
        enrollUser.paymentDetails.push((data.paymentMethod == 'UPI' || data.paymentMethod == 'Bank Transfer') ? data.paymentDetails : 'Cash');
        if (enrollUser.paymentSlipNumber.includes(counterNumbers.paymentNumber)) {
            // If not included, return 404 status with a message
            return {
                status: 404,
                message: "Counter payment number not found in payment slip numbers.",
            };
        } else {
            enrollUser.paymentSlipNumber.push(counterNumbers.paymentNumber);
        }
        enrollUser.paymentMethod.push(data.paymentMethod);
        const currentDate = new Date();
        const day = currentDate.getDate().toString().padStart(2, '0');
        const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
        const year = currentDate.getFullYear();
        const formattedDate = `${day}/${month}/${year}`;
        const newPaymentSlip = {}
        newPaymentSlip.payInstallmentDate = 'Partial Payment';
        // Save the updated document
        newPaymentSlip.name = data.name;
        newPaymentSlip.course = data.course;
        newPaymentSlip.payInstallmentFees = data.partialPayment.toFixed(2);
        newPaymentSlip.payFeesDate = formattedDate;
        newPaymentSlip.payFeesFormatFeesDate = new Date().toISOString();
        // newPaymentSlip.payInstallmentDate = data.installmentDate;
        newPaymentSlip.paymentDetails = (data.paymentMethod == 'UPI' || data.paymentMethod == 'Bank Transfer') ? data.paymentDetails : 'Cash';
        newPaymentSlip.payInstallment = 'Partial Payment';
        newPaymentSlip.paymentReceiver = data.paymentReceiver;
        newPaymentSlip.paymentSlipNumber = counterNumbers.paymentNumber;
        newPaymentSlip.payInstallmentNumbers = ['Partial Payment'];
        newPaymentSlip.installmentAmount = data.installmentAmount.toFixed(2);
        newPaymentSlip.paymentMethod = data.paymentMethod;
        newPaymentSlip.tokenId = data.tokenId;
        newPaymentSlip.enquireBranch = isBranch;
        newPaymentSlip.gstBranch = enrollUser?.gstBranch;
        newPaymentSlip.enquireType = enrollUser?.enquireType;
        const paymentSlip = new paymentSlipDetail({
            ...newPaymentSlip,
        });
        const msgData = await enrollModel.findOne({ tokenId: data?.tokenId });
        try {
            const url = `${process.env.WHATSAPP_URL}?number=91${msgData.mobileNumber}&type=media&message=${''}&media_url=${process.env.MEDIA_URL}/${data?.fileName}&instance_id=${msgData.enquireBranch == 'Abrama, Mota Varachha' ? process.env.INSTANCE_ID_ABRAMA : msgData.enquireBranch == 'Sita Nagar' ? process.env.INSTANCE_ID_SITANAGER : process.env.INSTANCE_ID_ABC}&authorization=${process.env.ACCESS_TOKEN}`;
            // Make the HTTP POST request to send the birthday message
            await axios.post(url);
        } catch (error) {
            console.log('====================================');
            console.log(error);
            console.log('====================================');
            return {
                status: 500,
                message: "Internal Server Error",
            };
        }
        await paymentSlip.save();

        await counterNumbers.save();
        // Save the updated data back to the database
        await enrollUser.save();
        return {
            status: 200,
            message: "Enroll data updated successfully.",
        };
    } catch (error) {
        console.log('====================================');
        console.log(error);
        console.log('====================================');
        return {
            status: 500,
            message: "Internal Server Error",
        };
    }
};

exports.findEnroll = async (isAdmin, isBranch) => {
    try {
        let query = {};
        if (isAdmin !== 'master') {
            // If the user is not an admin, retrieve data based on the specified branch
            query = { enquireBranch: isBranch };
        }
        const getEnroll = await enrollModel.find(query);
        if (!getEnroll || getEnroll.length === 0) {
            return {
                status: 404,
                message: message.IMMIGRATION_NOT_FOUND,
            };
        }
        const reversedEnroll = getEnroll.reverse();

        return reversedEnroll;
    } catch (error) {
        console.log('====================================');
        console.log(error, error instanceof mongoose.Error.ValidationError);
        console.log('====================================');

        if (error instanceof mongoose.Error.ValidationError) {
            const errorMessages = [];

            // Loop through the validation errors and push corresponding messages
            for (const key in error.errors) {
                if (error.errors.hasOwnProperty(key)) {
                    errorMessages.push({
                        field: key,
                        message: error.errors[key].message,
                    });
                }
            }

            return {
                status: 400,
                message: "Validation Error",
                errors: errorMessages,
            };
        } else {
            console.error(error);  // Log the unexpected error for further investigation
            return {
                status: 500,
                message: "Internal Server Error",
            };
        }
    }
};
exports.findBookNumber = async (isAdmin, isBranch) => {
    try {
        let query = {};

        const counterNumbers = await counterNumbersDetail.find();
        if (!counterNumbers || counterNumbers.length === 0) {
            return {
                status: 404,
                message: message.IMMIGRATION_NOT_FOUND,
            };
        }
        const reversedEnroll = counterNumbers[0];

        // Increment each key value by 1
        // Convert reversedEnroll to a plain JavaScript object
        const reversedEnrollPlain = reversedEnroll.toObject();

        // Increment each key value by 1
        for (let key in reversedEnrollPlain) {
            if (reversedEnrollPlain.hasOwnProperty(key)) {
                reversedEnrollPlain[key]++;
            }
        }

        // Convert reversedEnrollPlain back to a mongoose document
        const reversedEnrollModified = new counterNumbersDetail(reversedEnrollPlain);
        reversedEnrollModified._id = reversedEnroll?._id;
        return reversedEnrollModified;

    } catch (error) {
        console.log('====================================');
        console.log(error, error instanceof mongoose.Error.ValidationError);
        console.log('====================================');

        if (error instanceof mongoose.Error.ValidationError) {
            const errorMessages = [];

            // Loop through the validation errors and push corresponding messages
            for (const key in error.errors) {
                if (error.errors.hasOwnProperty(key)) {
                    errorMessages.push({
                        field: key,
                        message: error.errors[key].message,
                    });
                }
            }

            return {
                status: 400,
                message: "Validation Error",
                errors: errorMessages,
            };
        } else {
            console.error(error);  // Log the unexpected error for further investigation
            return {
                status: 500,
                message: "Internal Server Error",
            };
        }
    }
};
exports.getPaymentSlip = async (body, isAdmin, isBranch) => {
    try {
        let courseDurationQuery = {};
        if (isAdmin !== 'master') {
            courseDurationQuery.enquireBranch = isBranch;
        }

        // Ensure query is properly formatted
        if (body && typeof body === 'object') {
            for (const key in body) {
                // Only include valid keys from the body
                if (body.hasOwnProperty(key) && key != 'startDate' && key != 'endDate') {
                    // Check if the value is an array
                    if (Array.isArray(body[key])) {
                        // Use $all operator to find documents where the specified array is a subset
                        courseDurationQuery[key] = { $all: body[key] };
                    } else {
                        courseDurationQuery[key] = body[key];
                    }
                }
            }
        }
        if (body.startDate) {

            const startDate = body.startDate ? new Date(body.startDate) : new Date();
            const endDate = body.endDate ? new Date(body.endDate) : new Date();

            // Adjusting the endDate to include the entire day
            endDate.setHours(23, 59, 59, 999);

            // Query to find documents with settlementDate within the specified range
            courseDurationQuery.payFeesFormatFeesDate = {
                $gte: startDate?.toISOString(),
                $lte: endDate?.toISOString()
            };
        }
        const paymentSlipDetails = await paymentSlipDetail.find(courseDurationQuery);
        if (!paymentSlipDetails || paymentSlipDetails.length === 0) {
            return {
                status: 404,
                message: message.IMMIGRATION_NOT_FOUND,
            };
        }

        // Manipulate the payInstallmentDate format for each element in the array
        const manipulatedPaymentSlipDetails = paymentSlipDetails.map(detail => {
            const manipulatedDates = detail.payInstallmentDate.map(date => moment(date).format('DD/MM/YYYY'));
            return {
                ...detail._doc,
                payInstallmentDate: manipulatedDates
            };
        });

        return manipulatedPaymentSlipDetails;
    } catch (error) {
        console.log('====================================');
        console.log(error, error instanceof mongoose.Error.ValidationError);
        console.log('====================================');

        if (error instanceof mongoose.Error.ValidationError) {
            const errorMessages = [];

            // Loop through the validation errors and push corresponding messages
            for (const key in error.errors) {
                if (error.errors.hasOwnProperty(key)) {
                    errorMessages.push({
                        field: key,
                        message: error.errors[key].message,
                    });
                }
            }

            return {
                status: 400,
                message: "Validation Error",
                errors: errorMessages,
            };
        } else {
            console.error(error);  // Log the unexpected error for further investigation
            return {
                status: 500,
                message: "Internal Server Error",
            };
        }
    }
};
exports.findSettleEnroll = async (body, isAdmin, isBranch) => {
    try {
        let query = {};
        // If the user is not an admin, retrieve data based on the specified branch
        if (isAdmin !== 'master') {
            query.enquireBranch = isBranch;
        }

        if (body.enquireBranch) {
            query.enquireBranch = body.enquireBranch;
        }
        if (body.gstBranch) {
            query.gstBranch = body.gstBranch;
        }

        // Extracting startDate and endDate from the request body
        const startDate = body.startDate ? new Date(body.startDate) : new Date();
        const endDate = body.endDate ? new Date(body.endDate) : new Date();

        // Adjusting the endDate to include the entire day
        endDate.setHours(23, 59, 59, 999);

        // Query to find documents with settlementDate within the specified range
        query.settlementDate = {
            $gte: startDate,
            $lte: endDate
        };


        // Fetching settleEnrollData from the database
        const settleEnrollData = await SettleEnrollDetail.find(query);

        // Calculating totalPayAmount
        const totalPayAmount = settleEnrollData.reduce((total, item) => {
            // Check if item is defined before accessing its properties
            if (item && item.refundAmount) {
                return total + (isNaN(parseFloat(item.refundAmount)) ? 0 : parseFloat(item.refundAmount));
            }
            return total;
        }, 0);
        const settleEnrollDataWithFormattedDates = settleEnrollData.map(item => {
            item.settlementDate = new Date(item.settlementDate).toLocaleDateString('en-GB');
            // Format each payInstallmentDate in "dd/mm/yyyy" format
            const formattedDates = item.payInstallmentDate.map(date => {
                const formattedDate = new Date(date).toLocaleDateString('en-GB');
                return formattedDate; // Assuming "en-GB" locale will give you "dd/mm/yyyy" format
            });

            // Return the item with payInstallmentDate replaced with formattedDates
            return { ...item, payInstallmentDate: formattedDates };
        });

        // Reversing settleEnrollData array
        const reversedEnroll = settleEnrollDataWithFormattedDates.reverse();

        // Returning response
        return {
            totalPayAmount,
            pageItems: reversedEnroll
        };
    } catch (error) {
        console.error('Error in findSettleEnroll:', error);

        // Handling different types of errors
        if (error.name === 'ValidationError') {
            const errorMessages = Object.values(error.errors).map(err => ({
                field: err.path,
                message: err.message
            }));

            return {
                status: 400,
                message: "Validation Error",
                errors: errorMessages,
            };
        } else {
            console.error(error);  // Log the unexpected error for further investigation
            return {
                status: 500,
                message: "Internal Server Error",
            };
        }
    }
};

exports.findFilterEnroll = async (body, isAdmin, isBranch) => {
    try {
        let query = {};

        // If the user is not an admin, retrieve data based on the specified branch
        if (isAdmin !== 'master') {
            query.enquireBranch = isBranch;
        }

        // Incorporate the values from the body into the query
        if (body && typeof body === 'object') {
            for (const key in body) {
                // Only include valid keys from the body
                if (body.hasOwnProperty(key)) {
                    if (key === 'name' && body.name) {
                        // Slice the name into space-separated parts
                        const names = body.name.split(' ');
                        // Create a regex to match each part of the sliced name
                        query[key] = { $all: names.map(name => new RegExp(name, 'i')) };
                    } else if (Array.isArray(body[key])) {
                        // Use $all operator to find documents where the specified array is a subset
                        query[key] = { $all: body[key].map(val => new RegExp(val, 'i')) };
                    } else {
                        // Use regex for case-insensitive matching
                        query[key] = new RegExp(body[key], 'i');
                    }
                }
            }
        }

        const getEnroll = await enrollModel.find(query);

        if (!getEnroll || getEnroll.length === 0) {
            return {
                status: 404,
                message: message.ENROLLMENT_NOT_FOUND,
            };
        }

        const reversedEnroll = getEnroll.reverse();

        return reversedEnroll;
    } catch (error) {
        console.log('====================================');
        console.log(error, error instanceof mongoose.Error.ValidationError);
        console.log('====================================');

        if (error instanceof mongoose.Error.ValidationError) {
            const errorMessages = [];

            // Loop through the validation errors and push corresponding messages
            for (const key in error.errors) {
                if (error.errors.hasOwnProperty(key)) {
                    errorMessages.push({
                        field: key,
                        message: error.errors[key].message,
                    });
                }
            }

            return {
                status: 400,
                message: "Validation Error",
                errors: errorMessages,
            };
        } else {
            console.error(error);  // Log the unexpected error for further investigation
            return {
                status: 500,
                message: "Internal Server Error",
            };
        }
    }
};


exports.downloadEnrollData = async (body, isAdmin, isBranch) => {
    try {
        // Initialize startDate and endDate with default values
        let startDate = new Date();
        let endDate = new Date();

        // Extracting startDate and endDate from the request body if provided
        if (body.startDate) {
            // Parse the date from yyyy-mm-dd format
            const [year, month, day] = body.startDate.split('-').map(Number);
            startDate = new Date(year, month - 1, day); // Month is 0-based index
        }
        if (body.endDate) {
            // Parse the date from yyyy-mm-dd format
            const [year, month, day] = body.endDate.split('-').map(Number);
            endDate = new Date(year, month - 1, day); // Month is 0-based index
        }

        // Use current date as endDate if not provided
        if (!body.endDate) {
            endDate = new Date();
        }

        let matchQuery = {};
        if (body.enquireType !== '') {
            matchQuery.enquireType = body.enquireType;
        }
        if (body.course !== '') {
            matchQuery.course = body.course;
        }
        if (body.paymentType !== '') {
            matchQuery.paymentType = body.paymentType;
        }
        // If the user is not an admin, retrieve data based on the specified branch
        if (isAdmin !== 'master') {
            matchQuery.enquireBranch = isBranch;
        }
        const getEnroll = await enrollModel.aggregate([
            {
                $match: matchQuery
            },
            {
                $addFields: {
                    convertedDate: {
                        $dateFromString: {
                            dateString: "$enrollDate",
                            format: "%d/%m/%Y" // Adjusted format specifier
                        }
                    }
                }
            },
            {
                $match: {
                    convertedDate: {
                        $gte: startDate,
                        $lte: endDate
                    }
                }
            }
        ]);

        if (!getEnroll || getEnroll.length === 0) {
            return {
                status: 404,
                message: "Data Not Found", // Updated message
            };
        }

        const reversedEnroll = getEnroll.reverse();

        return reversedEnroll;
    } catch (error) {
        console.log('====================================');
        console.log(error, error instanceof mongoose.Error.ValidationError);
        console.log('====================================');

        if (error instanceof mongoose.Error.ValidationError) {
            const errorMessages = [];

            // Loop through the validation errors and push corresponding messages
            for (const key in error.errors) {
                if (error.errors.hasOwnProperty(key)) {
                    errorMessages.push({
                        field: key,
                        message: error.errors[key].message,
                    });
                }
            }

            return {
                status: 400,
                message: "Validation Error",
                errors: errorMessages,
            };
        } else {
            console.error(error);  // Log the unexpected error for further investigation
            return {
                status: 500,
                message: "Internal Server Error",
            };
        }
    }
};


// match dob date
// exports.downloadEnrollData = async (body, isAdmin, isBranch) => {
//     try {
//         const currentDate = moment().tz('Asia/Kolkata').format('MM-DD');
//         const currentMonthDay = currentDate.split('-').slice(0).join('-'); // extracting month-day format
//         const result = await enrollModel.aggregate([
//             {
//                 $addFields: {
//                     monthDay: { $substr: ['$dob', 5, 5] }, // extract month-day part of dob field
//                 },
//             },
//             {
//                 $match: {
//                     monthDay: currentMonthDay,
//                 },
//             },
//         ]);
//         console.log('result', result);
//         // res.json(result);
//     } catch (error) {
//         console.log('====================================');
//         console.log(error, error instanceof mongoose.Error.ValidationError);
//         console.log('====================================');

//         if (error instanceof mongoose.Error.ValidationError) {
//             const errorMessages = [];

//             // Loop through the validation errors and push corresponding messages
//             for (const key in error.errors) {
//                 if (error.errors.hasOwnProperty(key)) {
//                     errorMessages.push({
//                         field: key,
//                         message: error.errors[key].message,
//                     });
//                 }
//             }

//             return {
//                 status: 400,
//                 message: "Validation Error",
//                 errors: errorMessages,
//             };
//         } else {
//             console.error(error);  // Log the unexpected error for further investigation
//             return {
//                 status: 500,
//                 message: "Internal Server Error",
//             };
//         }
//     }
// };
exports.getCourseCompletionStudent = async (isAdmin, isBranch) => {
    try {
        let query = {};
        if (isAdmin !== 'master') {
            // If the user is not an admin, retrieve data based on the specified branch
            query = { enquireBranch: isBranch };
        }
        const getEnroll = await CompleteEnrollDetail.find(query);
        if (!getEnroll || getEnroll.length === 0) {
            return {
                status: 404,
                message: message.IMMIGRATION_NOT_FOUND,
            };
        }

        const reversedEnroll = getEnroll.reverse();

        return reversedEnroll;
    } catch (error) {
        console.log('====================================');
        console.log(error, error instanceof mongoose.Error.ValidationError);
        console.log('====================================');

        if (error instanceof mongoose.Error.ValidationError) {
            const errorMessages = [];

            // Loop through the validation errors and push corresponding messages
            for (const key in error.errors) {
                if (error.errors.hasOwnProperty(key)) {
                    errorMessages.push({
                        field: key,
                        message: error.errors[key].message,
                    });
                }
            }

            return {
                status: 400,
                message: "Validation Error",
                errors: errorMessages,
            };
        } else {
            console.error(error);  // Log the unexpected error for further investigation
            return {
                status: 500,
                message: "Internal Server Error",
            };
        }
    }
};

exports.getFilterCourseCompletionStudent = async (body, isAdmin, isBranch) => {
    try {
        let query = {};

        // If the user is not an admin, retrieve data based on the specified branch
        if (isAdmin !== 'master') {
            query.enquireBranch = isBranch;
        }

        // Incorporate the values from the body into the query
        if (body && typeof body === 'object') {
            for (const key in body) {
                // Only include valid keys from the body
                if (body.hasOwnProperty(key)) {
                    if (key === 'name' && body.name) {
                        // Slice the name into space-separated parts
                        const names = body.name.split(' ');
                        // Create a regex to match each part of the sliced name
                        query[key] = { $all: names.map(name => new RegExp(name, 'i')) };
                    } else if (Array.isArray(body[key])) {
                        // Use $all operator to find documents where the specified array is a subset
                        query[key] = { $all: body[key].map(val => new RegExp(val, 'i')) };
                    } else {
                        // Use regex for case-insensitive matching
                        query[key] = new RegExp(body[key], 'i');
                    }
                }
            }
        }
        const getEnroll = await CompleteEnrollDetail.find(query);
        if (!getEnroll || getEnroll.length === 0) {
            return {
                status: 404,
                message: message.IMMIGRATION_NOT_FOUND, // This message should be for course completion student, not immigration
            };
        }

        const reversedEnroll = getEnroll.reverse();

        return reversedEnroll;
    } catch (error) {
        console.log('====================================');
        console.log(error, error instanceof mongoose.Error.ValidationError);
        console.log('====================================');

        if (error instanceof mongoose.Error.ValidationError) {
            const errorMessages = [];

            // Loop through the validation errors and push corresponding messages
            for (const key in error.errors) {
                if (error.errors.hasOwnProperty(key)) {
                    errorMessages.push({
                        field: key,
                        message: error.errors[key].message,
                    });
                }
            }

            return {
                status: 400,
                message: "Validation Error",
                errors: errorMessages,
            };
        } else {
            console.error(error);  // Log the unexpected error for further investigation
            return {
                status: 500,
                message: "Internal Server Error",
            };
        }
    }
};
exports.settlePaymentData = async (body, isAdmin, isBranch) => {
    try {
        const getEnroll = await paymentSlipDetail.find({ tokenId: body.tokenId });
        if (!getEnroll || getEnroll.length === 0) {
            return {
                status: 404,
                message: message.IMMIGRATION_NOT_FOUND, // This message should be for course completion student, not immigration
            };
        }

        return getEnroll;
    } catch (error) {
        console.log('====================================');
        console.log(error, error instanceof mongoose.Error.ValidationError);
        console.log('====================================');

        if (error instanceof mongoose.Error.ValidationError) {
            const errorMessages = [];

            // Loop through the validation errors and push corresponding messages
            for (const key in error.errors) {
                if (error.errors.hasOwnProperty(key)) {
                    errorMessages.push({
                        field: key,
                        message: error.errors[key].message,
                    });
                }
            }

            return {
                status: 400,
                message: "Validation Error",
                errors: errorMessages,
            };
        } else {
            console.error(error);  // Log the unexpected error for further investigation
            return {
                status: 500,
                message: "Internal Server Error",
            };
        }
    }
};

exports.findFilterEnrollPayment = async (body, isAdmin, isBranch) => {
    try {
        let query = {};

        // If the user is not an admin, retrieve data based on the specified branch
        if (isAdmin !== 'master') {
            query.enquireBranch = isBranch;
        }

        if (body.enquireBranch) {
            query.enquireBranch = body.enquireBranch;
        }
        if (body.gstBranch) {
            query.gstBranch = body.gstBranch;
        }

        // Extracting startDate and endDate from the request body
        const startDate = (body.startDate ? new Date(body.startDate) : new Date());

        // Use current date as endDate if not provided
        const endDate = body.endDate ? new Date(body.endDate) : new Date();

        // Adding conditions for date range in the query for enrollModel
        if (body?.payAmount == true || body?.payAmount == 'true') {
            query.payFeesFormatFeesDate = {
                $gte: startDate?.toISOString(),
                $lte: endDate?.toISOString()
            };
            query.filterNone = false;

            if (body.paymentMethod) {
                query.paymentMethod = body.paymentMethod;
            };
            const payments = await paymentSlipDetail.find(query);
            let totalPayAmount = 0;

            const modifiedPayments = payments.map(item => {
                if (item && item.payInstallmentFees) {
                    totalPayAmount += item.payInstallmentFees; // Increment totalPayAmount
                    return {
                        ...item._doc,
                        payAmount: item.payInstallmentFees, // Add new key payAmount with value from payInstallmentFees
                        installmentDate: item.payFeesDate
                    };
                }
                return item;
            });

            const reversedEnroll = modifiedPayments.reverse();

            return {
                totalPayAmount,
                pageItems: reversedEnroll
            };

        } else {
            query.userInstallmentDate = {
                $elemMatch: {
                    $gte: startDate?.toISOString(),
                    $lte: endDate?.toISOString()
                }
            };
            const getEnroll = await enrollModel.find(query);

            // Assuming you have a CompleteEnrollDetail model
            const getCompleteEnrollDetails = await CompleteEnrollDetail.find(query);
            // Combine results into a single array
            const combinedResult = getEnroll.concat(getCompleteEnrollDetails);
            const bodyPaymentMethod = body?.paymentMethod;
            // Calculate payAmount based on the number of dates in the date range
            const manipulatedResult = combinedResult.map(enroll => {
                const installmentAmount = enroll.installmentAmount;

                // Format userInstallmentDate to have the key name 'InstallmentDate' and use the desired date format
                const installmentDate = enroll.userInstallmentDate
                    .filter(date => date >= startDate.toISOString() && date <= endDate.toISOString())
                    .map(dateString => {
                        const date = new Date(dateString);
                        const day = date.getDate().toString().padStart(2, '0');
                        const month = (date.getMonth() + 1).toString().padStart(2, '0');
                        const year = date.getFullYear();
                        return `${day}/${month}/${year}`;
                    });
                const payAmount = (installmentDate.length * installmentAmount) + (isNaN(parseFloat(enroll?.partialPayment)) ? 0 : parseFloat(enroll?.partialPayment));
                if (installmentDate?.length >= 1) {
                    const result = {
                        ...enroll.toObject(), // Assuming enroll has a toObject() method or you can spread the properties individually
                        payAmount,
                        installmentDate
                    };

                    return result;
                }
            });
            const validResults = manipulatedResult.filter(item => item !== null && item !== undefined);
            // Calculate totalPayAmount by summing up all payAmount values
            const totalPayAmount = validResults.reduce((total, item) => {
                // Check if item is defined before accessing its properties
                if (item && item.payAmount) {
                    return total + item.payAmount;
                }
                return total;
            }, 0);
            const reversedEnroll = validResults.reverse();

            return {
                totalPayAmount,
                pageItems: reversedEnroll
            };
        }

    } catch (error) {
        console.log('====================================');
        console.log(error);
        console.log('====================================');
        throw error;
    }
};

exports.editStatusEnrollDetail = async (data, token) => {
    try {
        const editEnroll = await enrollModel.findOneAndUpdate(
            { tokenId: token },
            { $set: data },
            { new: true }
        );

        if (!editEnroll) {
            return {
                status: 404,
                message: message.IMMIGRATION_NOT_FOUND,
            };
        }

        return {
            status: 200,
            message: message.IMMIGRATION_DATA_UPDATED,
        };
    } catch (error) {
        console.log('====================================');
        console.log(error, error instanceof mongoose.Error.ValidationError);
        console.log('====================================');

        if (error instanceof mongoose.Error.ValidationError) {
            const errorMessages = [];

            // Loop through the validation errors and push corresponding messages
            for (const key in error.errors) {
                if (error.errors.hasOwnProperty(key)) {
                    errorMessages.push({
                        field: key,
                        message: error.errors[key].message,
                    });
                }
            }

            return {
                status: 400,
                message: "Validation Error",
                errors: errorMessages,
            };
        } else {
            console.error(error);  // Log the unexpected error for further investigation
            return {
                status: 500,
                message: "Internal Server Error",
            };
        }
    }
};

exports.deleteEnrollDetail = async (whereCondition) => {
    try {
        const deleteEnroll = await enrollModel.deleteOne({
            tokenId: whereCondition,
        });

        await CompleteEnrollDetail.deleteOne({
            tokenId: whereCondition,
        });

        await immigrationModel.updateOne(
            { tokenId: whereCondition },
            { $set: { status: 'pending' } }
        );
        await itCoursesModel.updateOne(
            { tokenId: whereCondition },
            { $set: { status: 'pending' } }
        );
        await competitiveExamModel.updateOne(
            { tokenId: whereCondition },
            { $set: { status: 'pending' } }
        );
        if (!deleteEnroll) {
            return {
                status: 404,
                message: "Unable to delete enroll",
            };
        }
        return {
            status: 200,
            message: message.IMMIGRATION_DELETE,
        };
    } catch (error) {
        console.log('====================================');
        console.log(error, error instanceof mongoose.Error.ValidationError);
        console.log('====================================');

        if (error instanceof mongoose.Error.ValidationError) {
            const errorMessages = [];

            // Loop through the validation errors and push corresponding messages
            for (const key in error.errors) {
                if (error.errors.hasOwnProperty(key)) {
                    errorMessages.push({
                        field: key,
                        message: error.errors[key].message,
                    });
                }
            }

            return {
                status: 400,
                message: "Validation Error",
                errors: errorMessages,
            };
        } else {
            console.error(error);  // Log the unexpected error for further investigation
            return {
                status: 500,
                message: "Internal Server Error",
            };
        }
    }
};
exports.deleteDemoEnroll = async (whereCondition) => {
    try {
        const deleteEnroll = await DemoEnrollDetail.deleteOne({
            tokenId: whereCondition,
        });

        if (!deleteEnroll) {
            return {
                status: 404,
                message: "Unable to delete enroll",
            };
        }
        return {
            status: 200,
            message: message.IMMIGRATION_DELETE,
        };
    } catch (error) {
        console.log('====================================');
        console.log(error, error instanceof mongoose.Error.ValidationError);
        console.log('====================================');

        if (error instanceof mongoose.Error.ValidationError) {
            const errorMessages = [];

            // Loop through the validation errors and push corresponding messages
            for (const key in error.errors) {
                if (error.errors.hasOwnProperty(key)) {
                    errorMessages.push({
                        field: key,
                        message: error.errors[key].message,
                    });
                }
            }

            return {
                status: 400,
                message: "Validation Error",
                errors: errorMessages,
            };
        } else {
            console.error(error);  // Log the unexpected error for further investigation
            return {
                status: 500,
                message: "Internal Server Error",
            };
        }
    }
};