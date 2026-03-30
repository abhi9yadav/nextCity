//get my city complaints
const Complaint = require('../models/complaintModel');


exports.getCitizenCityComplaints = async (req, res) => {
  try {
    const { city, latitude, longitude } = req.query;

    let complaints;

    // If city name is available → get all complaints in same city
    if (city) {
      complaints = await Complaint.find({ city })
        .populate('citizen', 'name')
        .sort({ createdAt: -1 })
        .lean();

      return res.status(200).json({
        success: true,
        source: 'city',
        count: complaints.length,
        data: complaints,
      });
    }

    // Else use geolocation for radius-based search
    if (latitude && longitude) {
      const radiusInKm = 5;
      const radiusInRadians = radiusInKm / 6378.1;

      complaints = await Complaint.find({
        locationCoordinates: {
          $geoWithin: {
            $centerSphere: [[parseFloat(longitude), parseFloat(latitude)], radiusInRadians],
          },
        },
      })
        .populate('citizen', 'name')
        .sort({ createdAt: -1 })
        .lean();

      return res.status(200).json({
        success: true,
        source: 'geolocation',
        count: complaints.length,
        data: complaints,
      });
    }

    // If neither provided
    res.status(400).json({
      success: false,
      message: 'Please provide either city name or latitude & longitude',
    });
  } catch (error) {
    console.error('Error fetching citizen city complaints:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching city complaints',
    });
  }
};
