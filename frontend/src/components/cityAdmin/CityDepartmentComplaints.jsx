import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { getAuth } from "firebase/auth";

const CityDepartmentComplaints = () => {
  const { dept_id } = useParams();
  const [zones, setZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState("all");
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchZonesAndComplaints = async () => {
      try {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        if (!currentUser) throw new Error("User not logged in");

        const idToken = await currentUser.getIdToken(true);

        // Fetch zones
        const zonesRes = await axios.get(
          `http://localhost:5000/api/v1/cityAdmin/${dept_id}/zones`,
          { headers: { Authorization: `Bearer ${idToken}` } }
        );

        const allZones = zonesRes.data.zones || [];
        setZones(allZones);

        // Initially load all complaints
        await fetchComplaints("all", allZones, idToken);
      } catch (error) {
        console.error("Error fetching zones/complaints:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchZonesAndComplaints();
  }, [dept_id]);

  const fetchComplaints = async (zoneId, allZones = zones, idToken = null) => {
    try {
      setLoading(true);
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("User not logged in");
      if (!idToken) idToken = await currentUser.getIdToken(true);

      if (zoneId === "all") {
        const res = await axios.get(
          `http://localhost:5000/api/v1/cityAdmin/${dept_id}/complaints`,
          { headers: { Authorization: `Bearer ${idToken}` } }
        );
        setComplaints(res.data.complaints || []);
      } else {
        const res = await axios.get(
          `http://localhost:5000/api/v1/cityAdmin/${dept_id}/complaints/${zoneId}`,
          { headers: { Authorization: `Bearer ${idToken}` } }
        );
        setComplaints(res.data.complaints || []);
      }
    } catch (error) {
      console.error("Error fetching complaints:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleZoneChange = (e) => {
    const zoneId = e.target.value;
    setSelectedZone(zoneId);
    fetchComplaints(zoneId);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Department Complaints
      </h1>

      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : (
        <>
          {/* Dropdown filter */}
          <div className="flex justify-center mb-6">
            <select
              value={selectedZone}
              onChange={handleZoneChange}
              className="border border-gray-300 rounded-md px-4 py-2 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="all">All Zones</option>
              {zones.map((zone) => (
                <option key={zone._id} value={zone._id}>
                  {zone.zone_name}
                </option>
              ))}
            </select>
          </div>

          {/* Complaints grid */}
          {complaints.length === 0 ? (
            <p className="text-center text-gray-500">
              No complaints found
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {complaints.map((c) => {
                const hasAttachment = c.attachments?.length > 0;
                return (
                  <div
                    key={c._id}
                    className="relative rounded-xl shadow-md transition-transform transform hover:scale-105 hover:shadow-xl overflow-hidden flex flex-col justify-between h-70"
                    style={{
                      backgroundImage: hasAttachment
                        ? `url(${c.attachments[0].url})`
                        : "none",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                      backgroundColor: hasAttachment ? "transparent" : "white",
                    }}
                  >
                    {/* Overlay for readability */}
                    {hasAttachment && (
                      <div className="absolute inset-0 bg-black/30 hover:bg-black/40 transition-colors"></div>
                    )}

                    {/* Card content */}
                    <div
                      className={`relative z-10 p-5 flex flex-col justify-between flex-1 ${
                        hasAttachment ? "text-white" : "text-black"
                      }`}
                    >
                      {/* Top Section: Title and Status */}
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg">
                          {c.title || "Complaint"}
                        </h3>
                        {c.status && (
                          <span
                            className={`${
                              c.status === "RESOLVED"
                                ? hasAttachment
                                  ? "text-green-200"
                                  : "text-green-600"
                                : c.status === "IN_PROGRESS"
                                ? hasAttachment
                                  ? "text-yellow-200"
                                  : "text-yellow-600"
                                : hasAttachment
                                ? "text-red-200"
                                : "text-red-600"
                            } font-medium text-sm transition-colors`}
                          >
                            {c.status}
                          </span>
                        )}
                      </div>

                      {/* Middle Section: Description and Location */}
                      <div className="flex flex-col justify-between flex-1">
                        <p className="text-sm mb-2 line-clamp-3">
                          {c.description || "No description provided"}
                        </p>

                        {c.location?.coordinates && (
                          <p className="text-xs mb-2">
                            <span className="font-semibold">Location:</span>{" "}
                            {c.location.address
                              ? `${c.location.address} | `
                              : ""}
                            {`[${c.location.coordinates[1].toFixed(
                              4
                            )}, ${c.location.coordinates[0].toFixed(4)}]`}
                          </p>
                        )}
                      </div>

                      {/* Bottom Section: CreatedBy, Votes, CreatedAt */}
                      <div className="flex flex-col text-xs mt-2 space-y-1">
                        {c.createdBy && (
                          <>
                            <p>
                              <span className="font-semibold">By:</span>{" "}
                              {c.createdBy.name || "Anonymous"}
                            </p>
                            <p>
                              <span className="font-semibold">Email:</span>{" "}
                              {c.createdBy.email || "N/A"}
                            </p>
                          </>
                        )}

                        {Array.isArray(c.votes) && (
                          <p>
                            <span className="font-semibold">Votes:</span>{" "}
                            {c.votesCount || 0}
                          </p>
                        )}

                        {c.createdAt && (
                          <p>
                            <span className="font-semibold">Created:</span>{" "}
                            {new Date(c.createdAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CityDepartmentComplaints;
