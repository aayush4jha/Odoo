import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
const getProductComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a product
    const {productId} = req.params
    const {page = 1, limit = 10} = req.query
    const skip = (page - 1) * limit
    if(!productId?.trim() || !mongoose.Types.ObjectId.isValid(productId)){
        throw new ApiError(400,"Invalid Product Id")
    }
    if(!mongoose.Types.ObjectId.isValid(productId)){
        throw new ApiError(400,"Invalid product Id")
    }
    const totalComments = await Comment.countDocuments({product: new mongoose.Types.ObjectId(productId)})
    const totalPages = Math.ceil(totalComments / limit);
    const comments = await Comment.aggregate([
        {
            $match: { product: new mongoose.Types.ObjectId(productId) } // Match comments for the given video
        },
        {
            $lookup: {
                from: "users", // Collection name for users
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails"
            }
        },
        {
            $unwind: "$ownerDetails" // Convert ownerDetails array into an object
        },
        {
            $sort: { createdAt: -1 } // Sort comments by latest first
        },
        {
            $skip: skip // Skip previous pages
        },
        {
            $limit: parseInt(limit) // Limit number of results per page
        },
        {
            $project: {
                content: 1,
                createdAt: 1,
                owner: {
                    fullname: "$ownerDetails.fullName",
                    username: "$ownerDetails.username",
                    avatar: "$ownerDetails.avatar"
                }
            }
        }
    ]);
    if(comments.length === 0){
        throw new ApiError(404,"No comments found")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,{comments,totalComments, totalPages},"Comments fetched successfully"))

})

const addComment = asyncHandler(async (req, res) => {
    const {productId} = req.params
    const {text} = req.body
    if(!text?.trim()){
        throw new ApiError(400,"Comment text is required")
    }
    const comment = await Comment.create({
        content: text,
        owner: req.user?._id,
        product: new mongoose.Types.ObjectId(productId)
    })
    const foundComment = await Comment.findById(comment._id);
    if(!foundComment){
        throw new ApiError(500,"Failed to add comment")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,comment,"Comment added successfully"))
})

const updateComment = asyncHandler(async (req, res) => {

    const {commentId} = req.params
    const {text} = req.body
    if(!text?.trim()){
        throw new ApiError(400,"Comment text is required")
    }
    if(!commentId?.trim() || !mongoose.Types.ObjectId.isValid(commentId)){
        throw new ApiError(400,"Invalid Comment Id") 
    }
    const comment = await Comment.findById(commentId).select("-video")
    if(!comment){
        throw new ApiError(404,"Comment Not Found")
    }
    if(req.user?._id.toString() !== comment.owner?.toString()){
        throw new ApiError(403,"You are not allowed to update this comment")
    }
    comment.content = text
    await comment.save()
    return res
    .status(200)
    .json(new ApiResponse(200,comment,"Comment updated successfully"))

})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} = req.params
    if(!commentId?.trim() || !mongoose.Types.ObjectId.isValid(commentId)){
        throw new ApiError(400,"Invalid Comment Id") 
    }
    const comment = await Comment.findById(commentId).select("-product")
    if(!comment){
        throw new ApiError(404,"Comment Not Found")
    }
    
    if(req.user._id.toString() !== comment.owner.toString()){
        throw new ApiError(403,"You are not allowed to delete this comment")
    }
    try {
        const deletedComment = await Comment.findByIdAndDelete(comment._id);
        if (!deletedComment) {
            throw new ApiError(404, "Comment not found");
        }
        return res
            .status(200)
            .json(new ApiResponse(200, {}, "Comment deleted successfully"));
    } catch (error) {
        throw new ApiError(500, "Internal Server Error");
    }
})

export {
    getProductComments, 
    addComment, 
    updateComment,
    deleteComment
    }