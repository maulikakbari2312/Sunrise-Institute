const router = require("express").Router();
const enrollController = require("../../controllers/enroll/Enroll.controller");
const galleryController = require("../../controllers/enroll/gallery.controller");
const contactController = require("../../controllers/enroll/Contact.controller");
const webCourseController = require("../../controllers/enroll/webCourse.controller");
const commonUpload = require("../../common/utils")

router.post("/createEnroll/:admin/:branch", enrollController.createEnroll);
router.post("/settle-enroll/:isCN/:admin/:branch", enrollController.settleEnroll);
router.post("/find-settle-enroll/:admin/:branch", enrollController.findSettleEnroll);
router.get("/findEnroll/:admin/:branch", enrollController.getEnroll);
router.get("/find-book-numbers/:isCN/:admin/:branch", enrollController.getBookNumber);
router.post("/find-payment-slip/:admin/:branch", enrollController.getPaymentSlip);
router.post("/edit-book-numbers/:type/:isCN/:admin/:branch", enrollController.editBookNumber);
router.get("/findCourseCompletionStudent/:admin/:branch", enrollController.getCourseCompletionStudent);
router.put("/editEnroll/:tokenId/:admin/:branch", enrollController.editEnroll);
router.delete("/deleteEnroll/:tokenId/:admin/:branch", enrollController.deleteEnroll);
router.post("/findFilterEnroll/:admin/:branch", enrollController.getFilterEnroll);
router.post("/findFilterCourseCompletionStudent/:admin/:branch", enrollController.getFilterCourseCompletionStudent);
router.post("/findCheckFilterEnroll/:admin/:branch", enrollController.findCheckFilterEnroll);
router.get("/check-installments/:admin/:branch", enrollController.getCheckEnroll);
router.get("/find-partial-payment/:admin/:branch", enrollController.getPartialPayment);
router.post("/find-partial-payment/:admin/:branch", enrollController.getPartialPayment);
router.post("/partial-payment/:admin/:branch", enrollController.payPartialPayment);
router.put("/pay-installments/:tokenId/:admin/:branch", enrollController.editEnrollPayment);
router.post("/findFilterEnrollPayment/:admin/:branch", enrollController.findFilterEnrollPayment);
router.post("/demoEnrollDetail/:admin/:branch", enrollController.createDemoEnroll);
router.get("/findDemoEnroll/:admin/:branch", enrollController.getDemoEnroll);
router.delete("/deleteDemoEnroll/:tokenId/:admin/:branch", enrollController.deleteDemoEnroll);
router.post("/download-enroll-data/:admin/:branch", enrollController.downloadEnrollData);
router.post("/download-slip-data/:admin/:branch", enrollController.downloadSlipData);
router.post("/settle-payment-data/:admin/:branch", enrollController.settlePaymentData);

router.post("/create-gallery/:admin/:branch", galleryController.createGallery);
router.get("/find-gallery/:admin/:branch", galleryController.getGallery);
router.get("/find-gallery", galleryController.getGalleryunvalid);
router.put("/edit-gallery/:tokenId/:admin/:branch", galleryController.editGallery);
router.delete("/delete-gallery/:tokenId/:admin/:branch", galleryController.deleteGallery);

router.post("/create-contact", contactController.createContact);
router.get("/find-contact/:admin/:branch", contactController.getContact);
router.delete("/delete-contact/:tokenId/:admin/:branch", contactController.deleteContact);

router.post("/create-web-course/:admin/:branch", webCourseController.createWebCourse);
router.get("/find-web-course/:admin/:branch", webCourseController.getWebCourse);
router.get("/find-web-course", webCourseController.getWebCourseunvalid);
router.put("/edit-web-course/:tokenId/:admin/:branch", webCourseController.ediWebCourse);
router.delete("/delete-web-course/:tokenId/:admin/:branch", webCourseController.deleteWebCourse);

module.exports = router;