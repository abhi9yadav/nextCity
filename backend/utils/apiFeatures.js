const mongoose = require("mongoose");
class APIFeatures {
  constructor(
    query,
    queryString,
    isAggregation = false,
    searchFields = ["name", "email"]
  ) {
    this.query = query; // aggregation pipeline or mongoose query
    this.queryString = queryString;
    this.isAggregation = Array.isArray(query);
    this.searchFields = searchFields;
  }

  //Filter
  filter() {
    const queryObj = { ...this.queryString };
    const excludeFields = [
      "page",
      "sort",
      "limit",
      "fields",
      "sortByVotes",
      "search",
    ];
    excludeFields.forEach((el) => delete queryObj[el]);

    if (queryObj.zoneId) {
      queryObj.zone_id = queryObj.zoneId;
      delete queryObj.zoneId;
    }
    if (queryObj.cityId) {
      queryObj.city_id = queryObj.cityId;
      delete queryObj.cityId;
    }
    if (queryObj.departmentId) {
      queryObj.department_id = queryObj.departmentId;
      delete queryObj.departmentId;
    }

    if (queryObj.status && queryObj.status === "PENDING_ASSIGN") {
      queryObj.status = { $in: ["OPEN", "REOPENED"] };
    } else if (queryObj.status) {
      queryObj.status = queryObj.status.toUpperCase();
    }

    // Advanced filtering for gte, gt, lte, lt
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    let filterObj = JSON.parse(queryStr);

    for (const key in filterObj) {
      if (
        key.endsWith("_id") &&
        mongoose.Types.ObjectId.isValid(filterObj[key])
      ) {
        filterObj[key] = new mongoose.Types.ObjectId(filterObj[key]);
      }
    }

    // Multi-Field Search (now context-aware)
    if (this.queryString.search && this.searchFields.length > 0) {
      const searchTerm = this.queryString.search.trim();
      const searchRegex = new RegExp(searchTerm, "i");

      const orConditions = this.searchFields.map((field) => {
        if (field === "_id") {
          if (mongoose.Types.ObjectId.isValid(searchTerm)) {
            return { [field]: new mongoose.Types.ObjectId(searchTerm) };
          }
          return { [field]: { $regex: searchRegex } };
        }
        return { [field]: { $regex: searchRegex } };
      });

      const multiFieldSearch = { $or: orConditions };

      // Merge the new multi-field search with existing filters
      filterObj = { ...filterObj, ...multiFieldSearch };
    }

    if (this.isAggregation) {
      // 🧠 Instead of unshift, push to the END so it runs after lookups
      this.query.push({ $match: filterObj });
    } else {
      this.query = this.query.find({ ...this.query._conditions, ...filterObj });
    }

    return this;
  }

  // 🔹 Multi-level dynamic sorting
  sort() {
    let sortObj = {};

    if (this.queryString.sort) {
      // Example: ?sort=-votesCount,createdAt
      const sortFields = this.queryString.sort.split(",").map((f) => f.trim());
      sortFields.forEach((field) => {
        if (field.startsWith("-")) sortObj[field.slice(1)] = -1;
        else sortObj[field] = 1;
      });
    } else {
      sortObj = { createdAt: -1 }; // default sort by latest
    }

    if (this.isAggregation) {
      this.query.push({ $sort: sortObj });
    } else {
      this.query = this.query.sort(sortObj);
    }

    return this;
  }

  // 🔹 Limit fields
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      if (this.isAggregation) {
        const projectObj = {};
        fields.split(" ").forEach((f) => (projectObj[f] = 1));
        this.query.push({ $project: projectObj });
      } else {
        this.query = this.query.select(fields);
      }
    } else if (this.isAggregation) {
      this.query.push({ $project: { __v: 0 } });
    } else {
      this.query = this.query.select("-__v");
    }
    return this;
  }

  // 🔹 Pagination
  paginate() {
    const page = parseInt(this.queryString.page, 10) || 1;
    const limit = parseInt(this.queryString.limit, 10) || 100;
    const skip = (page - 1) * limit;

    if (this.isAggregation) {
      this.query.push({ $skip: skip }, { $limit: limit });
    } else {
      this.query = this.query.skip(skip).limit(limit);
    }
    return this;
  }

  // 🔹 Sort by votes (optional)
  sortByVotes() {
    if (this.queryString.sortByVotes === "true") {
      if (this.isAggregation) {
        const alreadyHasVotesField = this.query.some(
          (stage) => stage.$addFields && stage.$addFields.votesCount
        );

        if (!alreadyHasVotesField) {
          this.query.push({
            $addFields: { votesCount: { $size: { $ifNull: ["$votes", []] } } },
          });
        }

        this.query.push({ $sort: { votesCount: -1 } });
      }
    }
    return this;
  }
}

module.exports = APIFeatures;
