const { verifyUser } = require("../../common/utils");
const enrollService = require("../../service/enroll/gallery.service");

exports.createGallery = async (req, res) => {
    try {
        const accessToken = req.headers["access_token"];
        if (!accessToken) {
            return res.status(401).json({ message: "Access token is missing" });
        }

        // Verify user validity
        const isUserValid = await verifyUser(accessToken);
        if (!isUserValid) {
            return res.status(401).json({ message: "Invalid user" });
        }

        const designData = await enrollService.createGalleryDetail(req?.body);

        if (!designData) {
            throw new Error("Please enter valid Gallery information!");
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
exports.getGallery = async (req, res) => {
    const headers = req.headers["access_token"];
    const uservalid = await verifyUser(headers);
    if (uservalid == true) {
        try {
            const isAdmin = req.params.admin;
            const isBranch = req.params.branch;
            const findGallery = await enrollService.getGallery(isAdmin, isBranch);
            const response = {
                pageItems: findGallery,
                message: `Total ${findGallery.length || 0} available`,
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
exports.getGalleryunvalid = async (req, res) => {
    try {
        const isAdmin = req.params.admin;
        const isBranch = req.params.branch;
        const findGallery = await enrollService.getGallery(isAdmin, isBranch);
        const response = {
            pageItems: findGallery,
            message: `Total ${findGallery.length || 0} available`,
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

exports.editGallery = async (req, res) => {
    const headers = req.headers["access_token"];
    const uservalid = await verifyUser(headers);
    if (uservalid == true) {
        try {
            const isAdmin = req.params.admin
            const isBranch = req.params.branch
            const token = req.params.tokenId;
            const editeditGallery = await enrollService.editGallery(
                req.body,
                token,
                isAdmin,
                isBranch
            );

            res.status(editeditGallery.status).send(editeditGallery);
        } catch (error) {
            console.log('err', error)
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

exports.deleteGallery = async (req, res) => {
    const headers = req.headers["access_token"];
    const uservalid = await verifyUser(headers);
    if (uservalid == true) {
        try {
            const isAdmin = req.params.admin
            const isBranch = req.params.branch
            const token = req.params.tokenId;
            const deleteGalleryDetails = await enrollService.deleteGallery(
                token,
                isAdmin,
                isBranch
            );

            res.status(deleteGalleryDetails.status).send(deleteGalleryDetails);
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