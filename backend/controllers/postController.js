const Post = require("../models/complaintModal");

exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    res.json({ fromCache: false, data: post });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
