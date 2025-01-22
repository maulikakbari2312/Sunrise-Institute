require("dotenv").config();
const express = require("express");
const socketIo = require('socket.io');
const http = require("http");
const app = express();
const logInSchema = require('./model/admin/login.model');
const enrollModel = require("./model/enroll/enrollPayment.model");
const cron = require('node-cron');
var cors = require('cors');
require("./server")
const moment = require('moment-timezone');
const { default: axios } = require("axios");
const CompleteEnrollDetail = require("./model/enroll/completeEnroll.model");
// Load timezone data
require('moment-timezone');
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: false }));
app.use(express.static('public'));
app.use("/Images", express.static("./Images"))
const branchModel = require("./model/admin/Branch.modal");

const corsOptions = {
    // origin: process.env.FRONTEND_PORT,
    origin: ['https://master.sunriseinstitute.net', 'https://www.sunriseinstitute.net'],
    // origin: ['https://www.admin.sunriseinstitute.net', 'https://www.sunriseinstitute.net'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));


const server = http.createServer(app);  // Use the same HTTP server instance
const io = socketIo(server, {
    pingTimeout: 60000,
    cors: {
        origin: "https://master.sunriseinstitute.net",
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

function routeSetup() {
    const routes = require("./Route/route");
    routes.setUp(app);
}
routeSetup();

const PORT = process.env.PORT;

server.listen(PORT, (err) => {
    if (err) console.log(err);
    console.log(`Server is running on port ${PORT}`);
});

const getCurrentDate = () => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0'); // Get the day with leading zero if needed
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
    const yyyy = today.getFullYear();

    return `${dd}/${mm}/${yyyy}`;
};

const sendMessage = async (enroll, message) => {
    const currentDateDDMMYYYY = getCurrentDate();
    const getBranch = await branchModel.find();

    // Find the branch object that matches the enrolled branch
    const matchedBranch = getBranch.find(branch => branch.branchName === enroll.enquireBranch);

    // If a match is found, use the whatsappKEY (instance_id) from the matched branch
    const instanceId = matchedBranch ? matchedBranch.whatsappKEY : process.env.INSTANCE_ID_DEFAULT;  // Default if no match

    try {
        let birthdayMsg = '';
        if (message?.msgType == 'birthdayMsg') {
            birthdayMsg = `Hi *${enroll?.name}*,

Wishing you a fantastic birthday filled with joy, laughter, and memorable moments! On behalf of the entire team at Sunrise Institute, we hope this special day brings you happiness and success in all your endeavors.
Have a wonderful celebration!

Best regards,
*Sunrise Institute*`;
        } else if (message?.msgType == 'nextEnrollMsg') {
            birthdayMsg = `Dear *${enroll?.name}*,

This is a gentle reminder regarding your upcoming installment payment for your course at Sunrise Institute. The installment of *${(((isNaN(parseFloat(enroll?.installmentAmount)) ? 1 : parseFloat(enroll?.installmentAmount)) * (isNaN(parseFloat(enroll?.duePendingInstallment)) ? 0 : parseFloat(enroll?.duePendingInstallment) + 1 || 1)) + (isNaN(parseFloat(enroll?.partialPayment)) ? 0 : parseFloat(enroll?.partialPayment)))}* is due on *${currentDateDDMMYYYY}*. Please ensure the payment is made on time to avoid any inconvenience. Should you require any assistance or have queries, feel free to reach out to us.

Best regards,
*Sunrise Institute*`;
        }
        const encodedMsg = encodeURIComponent(birthdayMsg);
        const url = `${process.env.WHATSAPP_URL}?number=91${enroll.mobileNumber}&type=text&message=${encodedMsg}&instance_id=${instanceId}&authorization=${process.env.ACCESS_TOKEN}`;
        // Make the HTTP POST request to send the birthday message
        console.log("url", url);
        
        const response = await axios.post(url);

        // Check if the request was successful
        if (response.status === 200) {
            console.log('Birthday message sent successfully');
        } else {
            console.error('Failed to send birthday message. Status:', response.status);
        }
    } catch (error) {
        console.error('Error sending birthday message:', error.message);
    }
};

cron.schedule('0 0 * * *', async () => {
    try {
        const currentDate = moment().tz('Asia/Kolkata').format('MM-DD');
        const currentMonthDay = currentDate.split('-').slice(0).join('-'); // extracting month-day format

        // Assuming enrollModel is your MongoDB model
        const usersWithBirthday = await enrollModel.aggregate([
            {
                $addFields: {
                    monthDay: { $substr: ['$dob', 5, 5] }, // Extract month-day part of dob field
                },
            },
            {
                $match: {
                    monthDay: currentMonthDay,
                },
            },
        ]);

        // Send birthday messages
        for (const enroll of usersWithBirthday) {

            await sendMessage(enroll, { msgType: 'birthdayMsg' });
        }
        const currentDateIos = new Date();
        // currentDateIos.setDate(currentDateIos.getDate() + 1); // Add 1 day

        // Extract year, month, and day
        const year = currentDateIos.getFullYear();
        const month = String(currentDateIos.getMonth() + 1).padStart(2, '0'); // Month is zero-indexed
        const day = String(currentDateIos.getDate()).padStart(2, '0');

        // Assemble the date string with desired time
        const isoDate = `${year}-${month}-${day}T00:00:00.000Z`;
        const enrollNextInstallmentDateEnrolls = await enrollModel.find({ nextInstallmentDate: isoDate });
        const completeNextInstallmentDateEnrolls = await CompleteEnrollDetail.find({ nextInstallmentDate: isoDate });

        // Loop through enrollments in enrollNextInstallmentDateEnrolls
        for (const enroll of enrollNextInstallmentDateEnrolls) {
            await sendMessage(enroll, { msgType: 'nextEnrollMsg' });
        }

        // Loop through enrollments in completeNextInstallmentDateEnrolls
        for (const enroll of completeNextInstallmentDateEnrolls) {
            await sendMessage(enroll, { msgType: 'nextEnrollMsg' });
        }

    } catch (error) {
        console.error('Error checking for birthdays:', error.message);
    }
}, {
    timezone: 'Asia/Kolkata', // Set your desired timezone
});

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join', (email) => {
        socket.join(email);
    });

    socket.on('sendMessage', async ({ to, message }) => {
        try {
            const user = await logInSchema.findOne({ email: to }).exec();
            if (user) {
                io.to(to).emit('message', { from: socket.id, message });
            }
        } catch (err) {
            console.error(err);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});
