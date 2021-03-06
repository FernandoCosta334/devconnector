const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

// Post Model
const Post = require("../../models/Post");
// Post Model
const Profile = require("../../models/Profile");

// Validation
const validatePostInput = require("../../validation/post");

// @Route   GET api/posts/test
// @Desc    Test post route
// @Access  Public
router.get("/test", (req, res) => res.json({ msg: "Posts Works" }));

// @Route   GET api/posts/
// @Desc    Get Post
// @Access  Public
router.get("/", (req, res) => {
  Post.find()
    .sort({ date: -1 })
    .then(posts => res.json(posts))
    .catch(err => res.status(404).json({ nopostsfound: "No posts found" }));
});

// @Route   GET api/posts/:id
// @Desc    Get Post by id
// @Access  Public
router.get("/:id", (req, res) => {
  Post.findById(req.params.id)
    .then(post => res.json(post))
    .catch(err => res.status(404).json({ nopostfound: "No post found with that ID" }));
});

// @Route   POST api/posts/
// @Desc    Create Post
// @Access  Private
router.post("/", passport.authenticate("jwt", { session: false }), (req, res) => {
  const { errors, isValid } = validatePostInput(req.body);

  //Check Validation
  if (!isValid) {
    //if any errors, send 400 with errors object
    return res.status(400).json(errors);
  }

  const newPost = new Post({
    text: req.body.text,
    name: req.body.name,
    avatar: req.body.avatar,
    user: req.body.id
  });

  newPost.save().then(post => res.json(post));
});

// @Route   DELETE api/posts/:id
// @Desc    Delete Post
// @Access  Private
router.delete("/:id", passport.authenticate("jwt", { session: false }), (que, res) => {
  Profile.findOne({ user: req.user.id }).then(profile => {
    Post.findById(req.params.id)
      .then(post => {
        //Check for post owner
        if (post.user.toString() !== req.user.id) {
          return res.status(401).json({ notauthorized: "User not authorized" });
        }

        //Delete
        post.remove().then(() => res.json({ success: true }));
      })

      .catch(err => res.status(404).json({ postnotfound: " No post found" }));
  });
});

// @Route   POST api/posts/like/:id
// @Desc    add like to a Post
// @Access  Private
router.post("/like/:id", passport.authenticate("jwt", { session: false }), (req, res) => {
  Profile.findOne({ user: req.user.id }).then(profile => {
    Post.findById(req.params.id)
      .then(post => {
        if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
          return res.status(400).json({ alreadyliked: "User Already liked this post" });
        }

        // Add user id to likes away
        post.likes.unshift({ user: req.user.id });
        post.save().then(post => res.json(post));
      })
      .catch(err => res.status(404).json({ postnofound: "No post found" }));
  });
});

module.exports = router;
