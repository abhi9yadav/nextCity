const Knowledge = require("../../models/knowledgeModel");
const { generateQueryEmbedding } = require("./embeddingService");

function buildRagFilter(user) {
  const { role, department } = user;

  const filter = {
    allowedRoles: { $in: [role] },
  };

  if (role === "super_admin") {
    return filter;
  }

  
  if (department) {
    filter.department = {
      $in: ["global", department],
    };
  } else {
    filter.department = "global";
  }

  return filter;
}

const searchKnowledge = async ({
  query,
  user,
  limit = 5,
  threshold = 0.65,
}) => {
  const queryEmbedding = await generateQueryEmbedding(query);

  const ragFilter = buildRagFilter(user);

  const results = await Knowledge.aggregate([
    {
      $vectorSearch: {
        index: "knowledge_vector_index",
        path: "embedding",
        queryVector: queryEmbedding,
        filter: ragFilter,
        numCandidates: Math.max(50, limit * 10),
        limit,
      },
    },
    {
      $project: {
        _id: 0,
        documentId: 1,
        chunkId: 1,
        title: 1,
        content: 1,
        category: 1,
        department: 1,
        source: 1,
        score: {
          $meta: "vectorSearchScore",
        },
      },
    },
    {
      $match: {
        score: {
          $gte: threshold,
        },
      },
    },
  ]);

  return results;
};

module.exports = {
  searchKnowledge,
};
