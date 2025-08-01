import {Router} from "express"
import { 
    registerUser, 
    loginUser, 
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword, 
    getCurrentUser, 
    updateUserDetails, 
    updateUserAvatar, 
    getUserProfile, 
    getUserOrders ,
    getUserListings
} from "../controllers/user.controller.js"
import {upload} from "../middlewares/multer.middleware.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"
const router = Router()

router.route("/register").post(
    upload.fields([{
        name:"avatar",
        maxCount:1
    }]),
    registerUser)

router.route("/login").post(
    loginUser
)

// login krne se pehle hame check krna padega ki app login ho ki nhi 
// Secured routes
router.route("/logout").post(verifyJWT,logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT,changeCurrentPassword)

router.route("/current-user").get(verifyJWT,getCurrentUser)
router.route("/update-account").patch(verifyJWT,updateUserDetails) // !isko patch isliye kiya h kyuki kuch fields update krni h nhi toh post me sb update ho jayeg

router.route("/avatar").patch(verifyJWT,upload.single("avatar"),updateUserAvatar)
router.route("/c/:username").get(verifyJWT,getUserProfile) // isme username ham param se le rhe h toh //!    : likha imp h
router.route("/listings").get(verifyJWT,getUserListings)
router.route("/orders").get(verifyJWT,getUserOrders)
export default router