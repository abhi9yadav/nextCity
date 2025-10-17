exports.getActivities = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Activity.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const activities = await features.query
    .populate('user', 'name email role')
    .populate('complaint', 'title status')
    .exec();

  res.status(200).json({ status: 'success', results: activities.length, activities });
});
