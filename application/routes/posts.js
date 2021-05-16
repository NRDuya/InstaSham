var express = require('express');
var router = express.Router();
var db = require('../config/database');
var sharp = require('sharp');
var multer = require('multer');
var crypto = require('crypto');
var PostModel = require('../models/Posts');
const { successPrint, errorPrint } = require('../helpers/debug/debugprinters');
const PostError = require('../helpers/error/PostError');

var storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, 'public/images/uploads')
    },
    filename: function(req, file, cb){
        let fileExt = file.mimetype.split('/')[1];
        let randomName = crypto.randomBytes(22).toString('hex');
        cb(null, `${randomName}.${fileExt}`);
    }
});

var uploader = multer({storage: storage});

router.post('/createPost', uploader.single('uploadImage'), (req, res, next) => {
    let fileUploaded = req.file.path;
    let fileAsThumbnail = `thumbnail-${req.file.filename}`;
    let destinationOfThumbnail = req.file.destination + "/" + fileAsThumbnail;
    let title = req.body.title;
    let description = req.body.description;
    let fk_userId = req.session.userId;

    if(title !== "" && description !== "" && fk_userId !== ""){
        sharp(fileUploaded)
        .resize(200)
        .toFile(destinationOfThumbnail)
        .then(() => {
            return PostModel.create(
                title,
                description,
                fileUploaded,
                destinationOfThumbnail,
                fk_userId,
            );
        })
        .then((postWasCreated) => {
            if(postWasCreated){
                req.flash('success', "Post was created successfully!");
                res.redirect('/');
            }
            else{
                throw new PostError("Post could not be created!", '/postImage', 200);
            }
        })
        .catch((err) => {
            if(err instanceof PostError){
                errorPrint(err.getMessage);
                req.flash('error', err.getMessage());
                res.status(err.getStatus());
                res.redirect(err.getRedirectURL());
            }
            else{
                next(err);
            }
        })
    }
    else{
        errorPrint("Invalid parameters");
        req.flash('error', "Invalid Inputs");
        res.redirect("/postimage");
      }
});

//localhost:3000/posts/search?search=value
router.get('/search', (req, res, next) => {
    let searchTerm = req.query.search;
    if(!searchTerm){
        res.send({
            resultsStatus: "info",
            message:"No search term given",
            results: []
        });
    }
    else{
        PostModel.search(searchTerm)
            .then((results) => {
                if(results.length){
                    res.send({
                        resultsStatus: "info",
                        message: `${results.length} results found`,
                        results: results
                    })
                }
                else{
                    PostModel.getNRecentPosts('8')
                        .then((results) => {
                            res.send({
                                resultsStatus: "info",
                                message: "No results found. Showing 8 most recent posts.",
                                results: results
                            });
                        })
                }
            })
            .catch((err) => next(err))
    }
})

module.exports = router;