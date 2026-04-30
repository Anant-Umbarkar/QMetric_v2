//version2
const path = require("path");
const fs = require("fs");
const { Structurize } = require("../core/Regex/Regex");
const PaperInfo = require("../Model/PaperInfo");
const { Evaluate } = require("../core/evaluate/evaluate");

exports.convertToText = async (req, res) => {
    if (!req.file) {
        return res.status(400).send({ error: "No file uploaded." });
    }

    const {userId} = req.user; 

    console.log("Received POST /upload/totext");
    console.log("req.body keys:", Object.keys(req.body));
    console.log("req.body.FormData (raw):", req.body.FormData);
    console.log("req.body.Sequence (raw):", req.body.Sequence);
    console.log("req.file:", req.file);
    console.log("userId:", userId);

    const inputFileName = req.file.originalname;
    const fileExtension = path.extname(inputFileName).toLowerCase();
    const supportedExtensions = ['.xlsx'];

    if (!supportedExtensions.includes(fileExtension)) {
        return res.status(400).send({
            error: "Invalid File Format",
            message: "Only Excel files (.xlsx) are supported."
        });
    }

    try {
        const outputDir = path.join(__dirname, '../Converted');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const result = await saveToDB(userId, req.body.Sequence, req.body.FormData, req.file.path);
        if (result.error) {
            return res.status(500).send(result);
        }

        return res.send(result);

    } catch (error) {
        console.error('Error during conversion or DB save:', error);
        return res.status(500).send({ error: "Server error while processing file" });
    }
};

const saveToDB = async (userId, Sequence, FormData, filePath) => {
    try {
        // Step 1: Safely Parse Input JSON
        let sequenceArray, formData;

        try {
            sequenceArray = JSON.parse(Sequence);
            formData = JSON.parse(FormData);
        } catch (parseErr) {
            console.error("Error parsing JSON:", parseErr);
            return { error: "Invalid JSON in Sequence or FormData" };
        }

        const coWeights = {};
        const moduleHours = {};
        const coDetails = {};
        const CO_PO_Map = {};  

        // Step 2: Process Sequence and FormData to Extract COs, Modules and CO-PO Mapping
        sequenceArray.forEach(item => {
            const match = item.name.match(/\d+/);
            if (!match) return;

            const number = match[0];

            if (item.type === 'CO') {
                const coKey = `CO${number}`;
                const weight = parseFloat(item.weight || 0);

                // Normalize Bloom levels to lowercase
                const blooms = Array.isArray(item.blooms)
                    ? item.blooms.filter(b => typeof b === 'string').map(b => b.toLowerCase())
                    : (typeof item.blooms === 'string' ? [item.blooms.toLowerCase()] : []);

                coWeights[coKey] = weight;
                coDetails[coKey] = { weight, blooms };

                // Extract and normalize PO mapping - parse string values to int
                if (item.poMapping && typeof item.poMapping === 'object') {
                    CO_PO_Map[coKey] = {};
                    Object.entries(item.poMapping).forEach(([po, val]) => {
                        const num = parseInt(val);
                        if (!isNaN(num) && num > 0) {
                            CO_PO_Map[coKey][po] = num;
                        }
                    });
                    // If all values were 0 or invalid, remove the entry
                    if (Object.keys(CO_PO_Map[coKey]).length === 0) {
                        delete CO_PO_Map[coKey];
                    }
                }

            } else if (item.type === 'Module') {
                moduleHours[`M${number}`] = parseFloat(item.hours || 0);
            }
        });

        console.log("coDetails:", JSON.stringify(coDetails));
        console.log("moduleHours:", JSON.stringify(moduleHours));
        console.log("CO_PO_Map after processing:", JSON.stringify(CO_PO_Map));

        // Step 3: Define all 6 Bloom levels in standard order
        const allBloomLevels = ['create', 'evaluate', 'analyze', 'apply', 'understand', 'remember'];
        const bloomLevelMap = {};

        // Step 4: Collect unique Bloom levels used in COs
        const usedBloomLevels = new Set();
        Object.values(coDetails).forEach(data => {
            const bloom = (data.blooms[0] || "").toLowerCase();
            if (bloom && allBloomLevels.includes(bloom)) {
                usedBloomLevels.add(bloom);
            }
        });

        // Step 5: Sort used Bloom levels by their standard order
        const sortedUsedBlooms = allBloomLevels.filter(level => usedBloomLevels.has(level));

        // Step 6: Assign levels dynamically (1, 2, 3, ... based on what's used)
        sortedUsedBlooms.forEach((bloom, index) => {
            bloomLevelMap[bloom] = index + 1;
        });

        // Step 7: Assign remaining unused Bloom levels to next available level
        let nextLevel = sortedUsedBlooms.length + 1;
        allBloomLevels.forEach(level => {
            if (!bloomLevelMap[level] && nextLevel <= 6) {
                bloomLevelMap[level] = nextLevel;
                nextLevel++;
            }
        });

        // Step 8: Any remaining levels get assigned to level 6
        allBloomLevels.forEach(level => {
            if (!bloomLevelMap[level]) {
                bloomLevelMap[level] = 6;
            }
        });

        console.log("Used Bloom Levels:", Array.from(usedBloomLevels));
        console.log("Bloom Level Map:", bloomLevelMap);
        console.log("CO_PO_Map before Evaluate:", JSON.stringify(CO_PO_Map));

        // Step 9: Process Question Data
        const questionData = await Structurize([], filePath, bloomLevelMap);

        // Step 10: Evaluate with CO_PO_Map for C4 penalty
        const evaluationResult = Evaluate(questionData, coDetails, moduleHours, bloomLevelMap, CO_PO_Map);

        // Step 11: Save Data to MongoDB — wrap Sequence in array to match frontend's sequence[0]
        const paper = new PaperInfo({
            "College Name": formData["College Name"],
            "Branch": formData.Branch,
            "Year Of Study": formData["Year Of Study"],
            "Semester": formData.Semester,
            "Course Name": formData["Course Name"],
            "Course Code": formData["Course Code"],
            "Course Teacher": formData["Course Teacher"],
            Sequence: [{
                COs: coDetails,
                ModuleHours: moduleHours,
                CO_PO_Map: CO_PO_Map
            }],
            blommLevelMap: bloomLevelMap,
            "Collected Data": [evaluationResult],
            "userId": userId
        });

        // Step 12: Save the paper document to MongoDB
        await paper.save();

        // Step 13: Return full saved document so frontend gets Sequence + CO_PO_Map
        const saved = await PaperInfo.findById(paper._id).lean();
        const { extractedText, ...responseData } = saved;
        return responseData;

    } catch (error) {
        console.error("Error saving to MongoDB:", error);
        return { error: "Failed to process and save data" };
    }
};

exports.getResults = async (req, res) => {
    try {
        const { userId } = req.user || { userId: 'anonymous' };

        const userResults = await PaperInfo.find({ userId })
                                      .sort({ createdAt: -1 })
                                      .lean();

        if (userResults.length === 0) {
            return res.status(404).json({ 
                error: 'No results found',
                message: 'No analysis results found for your account'
            });
        }

        const latestResult = userResults[0];
        const { extractedText, ...responseData } = latestResult;

        res.json({
            success: true,
            data: responseData
        });

    } catch (error) {
        console.error('Get results error:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: 'Failed to retrieve results'
        });
    }
};

exports.getResultsById = async (req, res) => {
    try {
        const { userId } = req.user || { userId: 'anonymous' };

        const userResults = await PaperInfo.find({ userId })
                                      .sort({ createdAt: -1 })
                                      .lean();

        if (userResults.length === 0) {
            return res.status(404).json({ 
                error: 'No results found',
                message: 'No analysis results found for your account'
            });
        }

        const results = userResults.map(({extractedText, ...rest}) => rest);

        res.json({
            success: true,
            data: results
        });

    } catch (error) {
        console.error('Get results error:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: 'Failed to retrieve results'
        });
    }
};

exports.searchPapers = async (req, res) => {
    try {
        const { userId } = req.user;
        const { query } = req.body;

        const searchRegex = new RegExp(query, 'i');

        const papers = await PaperInfo.find({
            userId: userId,
            $or: [
                { "College Name": searchRegex },
                { "Branch": searchRegex },
                { "Course Name": searchRegex },
                { "Course Code": searchRegex }
            ]
        });

        res.json(papers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
