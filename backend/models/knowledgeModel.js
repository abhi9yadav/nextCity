const mongoose = require("mongoose");

const knowledgeSchema = new mongoose.Schema(
  {
    documentId: {
      type: String,
      required: true,
      index: true,
    },

    chunkId: {
      type: String,
      required: true,
      unique: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    content: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
      index: true,
    },

    department: {
      type: String,
      default: "global",
      index: true,
    },

    allowedRoles: {
      type: [String],
      default: [
        "super_admin",
        "city_admin",
        "dept_admin",
        "worker",
        "citizen",
      ],
    },

    source: {
      type: String,
      default: "NextCity",
    },

    embedding: {
      type: [Number],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Knowledge", knowledgeSchema);