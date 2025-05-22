const db = require('../config/database');
const CustomError = require('../utils/CustomError'); // Import CustomError

// Get Janaza members by location for public view
const getPublicJanazaMembersByLocation = async (req, res, next) => {
    const { location } = req.params;

    if (!location) {
        // Use next(CustomError) for consistent error handling
        return next(new CustomError('Location parameter is required for Janaza members.', 400));
    }

    try {
        // Select only publicly appropriate fields
        // Excluding 'telephone', 'janaza2024'
        const query = `
            SELECT 
                id, 
                name, 
                address, 
                location
            FROM members 
            WHERE lower(location) = lower($1)
            ORDER BY name ASC;
        `;
        const { rows } = await db.query(query, [location]);
        
        // Return empty array if no members found, not an error
        return res.status(200).json(rows);
    } catch (error) {
        console.error(`Error fetching public Janaza members for location ${location}:`, error);
        next(error); // Pass to global error handler
    }
};

// Get Mahallah members by zone for public view
const getPublicMahallahMembersByZone = async (req, res, next) => {
    // The 'location' path parameter is treated as zone for the route /mahallah/:location
    // The 'zone' path parameter is used for the route /mahallah/:location/:zone (location ignored)
    const zoneName = req.params.zone || req.params.location;

    if (!zoneName) {
        // Use next(CustomError) for consistent error handling
        return next(new CustomError('Zone parameter is required for Mahallah members.', 400));
    }

    try {
        // Select only publicly appropriate fields
        // Excluding 'address', 'telephone'
        const query = `
            SELECT 
                id, 
                name, 
                zone 
            FROM mahallah_members 
            WHERE lower(zone) = lower($1)
            ORDER BY name ASC;
        `;
        const { rows } = await db.query(query, [zoneName]);

        // Return empty array if no members found, not an error
        return res.status(200).json(rows);
    } catch (error) {
        console.error(`Error fetching public Mahallah members for zone ${zoneName}:`, error);
        next(error); // Pass to global error handler
    }
};

module.exports = {
    getPublicJanazaMembersByLocation,
    getPublicMahallahMembersByZone,
};
