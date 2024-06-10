const { verifyUser } = require("../../common/utils");
const enrollService = require("../../service/enroll/gallery.service");

exports.createContact = async (req, res) => {
    try {

        const designData = await enrollService.createContactDetail(req?.body);

        if (!designData) {
            throw new Error("Please enter valid Contact information!");
        }

        res.status(designData.status).send(designData);
    } catch (error) {
        console.log("==error==", error);
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
exports.getContact = async (req, res) => {
    const headers = req.headers["authorization"];
    const uservalid = await verifyUser(headers);
    if (uservalid === true) {
        try {
            const isAdmin = req.params.admin;
            const isBranch = req.params.branch;
            const findContact = await enrollService.getContact(isAdmin, isBranch);
            const response = {
                pageItems: findContact,
                message: `Total ${findContact.length || 0} available`,
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

exports.deleteContact = async (req, res) => {
    const headers = req.headers["authorization"];
    const uservalid = await verifyUser(headers);
    if (uservalid === true) {
        try {
            const isAdmin = req.params.admin
            const isBranch = req.params.branch
            const token = req.params.tokenId;
            const deleteContactDetails = await enrollService.deleteContact(
                token,
                isAdmin,
                isBranch
            );

            res.status(deleteContactDetails.status).send(deleteContactDetails);
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