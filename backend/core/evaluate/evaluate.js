//Version 2
const { generateCORecommendations } = require("../recommendation/coWeightageRecommendation");
const { generateModuleRecommendations } = require("../recommendation/moduleWeightageRecommendation");


// Normalize sequence data to ensure the sum of all weights is 100
function Normalize(seqData) {
    let sum = seqData.reduce((acc, item) => acc + (+item.M), 0);
    if (sum === 100) return seqData;
    if (!sum || isNaN(sum)) return seqData;

    return seqData.map(item => {
        item.M = !isNaN(item.M) ? (item.M / sum) * 100 : 0;
        return item;
    });
}

// Function to handle Module Hours Penalty
function calculateModulePenalty(ModuleWeights) {
    let C2 = 0;
    let n = ModuleWeights.length;
    ModuleWeights.forEach(item => {
        const diff = (item.expected - item.actual) / item.expected;
        if (diff >= 0) {
            C2 += diff;
        }
    });
    return C2 / n;
}

// Function to handle CO Penalty
function calculateCOPenalty(dataArray, CO_Map) {
    let C3 = 0;    

    dataArray.forEach(item => {
        const coKey = item[0]; 
        const coNumber = coKey.replace('CO', '');
        const actualScore = CO_Map[coNumber] || 0; 
        const expectedWeight = item[1].weight;  
        const diff = (expectedWeight - actualScore) / expectedWeight || 0;
        
        if (diff > 0) {
            C3 += diff;
        }
    });

    const COCount = Object.keys(CO_Map).length;  
    return COCount > 0 ? C3 / COCount : 0;  
}    

function obtainD(QHBTL, COBTL, returnRemark = false) {
    const D = QHBTL - COBTL;
    let qScore = 0;
    let remark = "";

    if (D === 0 || D === -1) {
        remark = "Matches Expected Blooms Level";
        qScore = 1;
    } else if (D < -1) {
        remark = "Higher than Expected Blooms Level";
        qScore = 2;
    } else if (D >= 1) {
        remark = "Lower than Expected Blooms Level";
        qScore = -1;
    }

    return returnRemark ? { qScore, remark } : qScore;
}

// Function to handle PO Weightage Penalty (C4)
function calculatePOPenalty(CO_PO_Map, CO_NA_Map) {
    console.log("calculatePOPenalty called");
    console.log("CO_PO_Map inside penalty fn:", JSON.stringify(CO_PO_Map));
    console.log("CO_NA_Map inside penalty fn:", JSON.stringify(CO_NA_Map));

    // Collect all unique POs across all COs
    const allPOs = new Set();
    Object.values(CO_PO_Map).forEach(poMap => {
        Object.keys(poMap).forEach(po => allPOs.add(po));
    });

    const n = allPOs.size;
    console.log("Total unique POs:", n);

    if (n === 0) return 0;

    let C4 = 0;

    allPOs.forEach(po => {
        let weightedSum = 0;
        let S = 0;

        Object.entries(CO_PO_Map).forEach(([coKey, poMap]) => {
            const strength = poMap[po] || 0;
            if (strength > 0) {
                const co_na = CO_NA_Map[coKey] ?? 0;
                weightedSum += co_na * strength;
                S += strength;
            }
        });

        const PO_NA = S > 0 ? weightedSum / S : 0;
        console.log(`PO: ${po}, weightedSum: ${weightedSum}, S: ${S}, PO_NA: ${PO_NA}`);
        C4 += PO_NA;
    });

    const result = C4 / n;
    console.log("C4 result:", result);
    return result;
}

/**
 * Calculate PO Coverage and CO-PO Mapping Coverage
 *
 * PO_Coverage: For each PO, what % is actually achieved based on linked COs.
 *   Formula: weighted average of CO actual coverage % for COs mapped to that PO
 *   (only COs with mapping strength > 0 are included)
 *
 * CO_PO_Coverage: For each CO-PO pair, what % of that specific mapping is achieved.
 *   Formula: (CO_actual_coverage% / 100) * (mapping_strength / 3) * 100
 *   i.e. how much of the maximum possible contribution is actually covered
 *
 * @param {Object} CO_PO_Map   - { CO1: { PO1: 3, PO2: 1 }, CO2: { PO1: 2 } }
 * @param {Object} CO_Map      - { "1": 45, "2": 0 }  (actual marks per CO number)
 * @param {Object} pre_data    - { CO1: { weight: 40, blooms: [...] }, ... }
 * @returns {{ PO_Coverage: Object, CO_PO_Coverage: Object }}
 */
function calculatePOCoverage(CO_PO_Map, CO_Map, pre_data) {
    // Build CO actual coverage % per CO key (e.g. "CO1")
    // Coverage = min(actual_marks / expected_weight, 1) * 100  — capped at 100%
    const CO_Coverage = {};
    Object.entries(pre_data).forEach(([coKey, data]) => {
        const coNumber = coKey.replace('CO', '');
        const expected = data.weight || 0;
        const actual   = CO_Map[coNumber] || 0;
        CO_Coverage[coKey] = expected > 0
            ? Math.min((actual / expected) * 100, 100)
            : 0;
    });

    console.log("CO_Coverage (expected vs actual %):", JSON.stringify(CO_Coverage));

    // ── PO Coverage ──────────────────────────────────────────────────────────
    // For each PO: weighted average of CO_Coverage for COs that map to it (strength > 0)
    const PO_Coverage = {};

    // Collect all unique POs
    const allPOs = new Set();
    Object.values(CO_PO_Map).forEach(poMap =>
        Object.keys(poMap).forEach(po => allPOs.add(po))
    );

    allPOs.forEach(po => {
        let weightedSum = 0;
        let totalStrength = 0;

        Object.entries(CO_PO_Map).forEach(([coKey, poMap]) => {
            const strength = poMap[po] || 0;
            // Exclude COs with no mapping to this PO
            if (strength > 0) {
                const coverage = CO_Coverage[coKey] ?? 0;
                weightedSum   += coverage * strength;
                totalStrength += strength;
            }
        });

        PO_Coverage[po] = totalStrength > 0
            ? parseFloat((weightedSum / totalStrength).toFixed(2))
            : 0;

        console.log(`PO_Coverage[${po}]: weightedSum=${weightedSum}, totalStrength=${totalStrength}, coverage=${PO_Coverage[po]}%`);
    });

    // ── CO-PO Mapping Coverage ────────────────────────────────────────────────
    // For each CO-PO pair: how much of the maximum possible contribution is covered
    // Max strength = 3, so contribution = (CO_coverage% / 100) * (strength / 3) * 100
    const CO_PO_Coverage = {};

    Object.entries(CO_PO_Map).forEach(([coKey, poMap]) => {
        CO_PO_Coverage[coKey] = {};
        const coCoverage = CO_Coverage[coKey] ?? 0;

        Object.entries(poMap).forEach(([po, strength]) => {
            if (strength > 0) {
                // % of maximum possible contribution this CO-PO pair achieves
                const pairCoverage = (coCoverage / 100) * (strength / 3) * 100;
                CO_PO_Coverage[coKey][po] = parseFloat(pairCoverage.toFixed(2));
            } else {
                // Excluded — no mapping
                CO_PO_Coverage[coKey][po] = null;
            }
        });
    });

    console.log("PO_Coverage:", JSON.stringify(PO_Coverage));
    console.log("CO_PO_Coverage:", JSON.stringify(CO_PO_Coverage));

    return { PO_Coverage, CO_PO_Coverage };
}

// Main Evaluation function
exports.Evaluate = (SequenceData, pre_data, Module_Hrs, bloomLevelMap, CO_PO_Map) => {
    console.log("=== Evaluate called ===");
    console.log("CO_PO_Map received in Evaluate:", JSON.stringify(CO_PO_Map));
    console.log("pre_data:", JSON.stringify(pre_data));

    let ModuleWeights = [];
    let checkModule = true;

    const BT_Weights = {
        1: { level: 1, name: "", weights: 0, marks: 0, BT_penalty: 0, No_Of_Questions: 0 },
        2: { level: 2, name: "", weights: 0, marks: 0, BT_penalty: 0, No_Of_Questions: 0 },
        3: { level: 3, name: "", weights: 0, marks: 0, BT_penalty: 0, No_Of_Questions: 0 },
        4: { level: 4, name: "", weights: 0, marks: 0, BT_penalty: 0, No_Of_Questions: 0 },
        5: { level: 5, name: "", weights: 0, marks: 0, BT_penalty: 0, No_Of_Questions: 0 },
        6: { level: 6, name: "", weights: 0, marks: 0, BT_penalty: 0, No_Of_Questions: 0 }
    };

    // Create reverse map to get Bloom name from level number
    const levelToNameMap = {};
    Object.entries(bloomLevelMap).forEach(([name, level]) => {
        if (!levelToNameMap[level]) {
            levelToNameMap[level] = [];
        }
        levelToNameMap[level].push(name);
    });

    // Set names for each BT_Weight level
    Object.keys(BT_Weights).forEach(level => {
        const levelNum = parseInt(level);
        if (levelToNameMap[levelNum]) {
            BT_Weights[levelNum].name = levelToNameMap[levelNum].join(', ');
        }
    });

    // Sort pre_data by weight (descending)
    const dataArray = Object.entries(pre_data).sort((a, b) => {
        return b[1].weight - a[1].weight;
    });

    // Fill BT_Weights based on the bloomLevelMap
    dataArray.forEach(([co, data]) => {
        const bloomKey = data.blooms[0]?.toLowerCase();
        const bloomLevel = bloomLevelMap[bloomKey];
        if (bloomLevel && bloomLevel >= 1 && bloomLevel <= 6) {
            BT_Weights[bloomLevel].weights += data.weight;
        }
    });

    // Handle module hours
    if (Module_Hrs && typeof Module_Hrs === 'object' && !Array.isArray(Module_Hrs)) {
        let totalHrs = Object.values(Module_Hrs).reduce((sum, hrs) => sum + (+hrs || 0), 0);

        if (totalHrs > 0) {
            Object.keys(Module_Hrs).forEach(module => {
                let moduleHours = +Module_Hrs[module];
                ModuleWeights.push({
                    expected: (moduleHours / totalHrs) * 100,
                    actual: 0
                });
            });
        } else {
            checkModule = false;
        }
    } else {
        checkModule = false;
    }

    SequenceData = Normalize(SequenceData);

    let QT_Map = {}, CO_Map = {};
    let QP = 0, QPMin = 0, QPMax = 0;
    let questionRecommendations = [];

    SequenceData.forEach(i => {
        QT_Map[i["Question Type"]] = (QT_Map[i["Question Type"]] || 0) + 1;

        const co = parseInt(i.CO.match(/\d+/)[0]);
        const coKey = `CO${co}`;
        const coBloom = (pre_data[coKey]?.blooms?.[0] || "").toLowerCase();
        const COBTL = bloomLevelMap[coBloom] || 6;

        // Ensure QHBTL is valid (1-6)
        let QHBTL = parseInt(i["Bloom's Taxonomy Level"]);
        
        if (isNaN(QHBTL) || QHBTL < 1 || QHBTL > 6) {
            console.warn(`Warning: Invalid Bloom level ${i["Bloom's Taxonomy Level"]} for question ${i["Question No"]}, defaulting to 6`);
            QHBTL = 6;
            i["Bloom's Taxonomy Level"] = 6;
        }

        const { qScore, remark } = obtainD(QHBTL, COBTL, true);
        i["Remark"] = remark;
        QP += qScore;
        QPMax += obtainD(1, COBTL);
        QPMin += obtainD(6, COBTL);

        const extractedVerb = i["Bloom's Verbs"] || "";
        const highestVerb = i["Bloom's Highest Verb"] || "N/A";
        const bloomLevelName = BT_Weights[QHBTL].name || "Unknown";

        questionRecommendations.push({
            QuestionData: i["Question No"] || i["Question"],
            marks: +i.Marks,
            co: coKey,
            qScore: qScore,
            extractedVerb: extractedVerb,
            highestVerb: highestVerb,
            bloomLevel: QHBTL,
            bloomLevelName: bloomLevelName,
            remark: remark
        });
              
        BT_Weights[QHBTL].marks += (+i.Marks);
        BT_Weights[QHBTL].No_Of_Questions++;
        CO_Map[co] = (CO_Map[co] || 0) + (+i.Marks);

        if (checkModule && i.Module) {
            const match = i.Module.match(/\d+\.\d+|\d+/);
            if (match) {
                const moduleNumber = parseFloat(match[0]);
                const moduleIndex = moduleNumber - 1;
                if (ModuleWeights[moduleIndex]) {
                    ModuleWeights[moduleIndex].actual += (+i.Marks);
                }
            }
        }
    });

    // Normalize QP score
    const QP_Final = ((QP - QPMin) / ((QPMax - QPMin) || 1)) * 100;
    console.log("QP_Final:", QP_Final);

    // Build CO_NA_Map: % unachieved per CO
    const CO_NA_Map = {};
    dataArray.forEach(([coKey, data]) => {
        const coNumber = coKey.replace('CO', '');
        const expected = data.weight;
        const actual = CO_Map[coNumber] || 0;
        const diff = expected > 0 ? Math.max(0, (expected - actual) / expected) * 100 : 0;
        CO_NA_Map[coKey] = diff;
    });

    console.log("CO_NA_Map:", JSON.stringify(CO_NA_Map));
    console.log("CO_Map:", JSON.stringify(CO_Map));

    // Penalty Calculations
    const C2 = checkModule ? calculateModulePenalty(ModuleWeights) : 0;
    const C3 = calculateCOPenalty(dataArray, CO_Map);
    const hasPO = CO_PO_Map && typeof CO_PO_Map === 'object' && Object.keys(CO_PO_Map).length > 0;

    console.log("hasPO:", hasPO);
    console.log("C2:", C2, "C3:", C3);

    const C4 = hasPO ? calculatePOPenalty(CO_PO_Map, CO_NA_Map) : 0;

    console.log("C4:", C4);

    // Include all active penalties in P_Final
        const P_Final = checkModule ? (C2 + C3) / 2 : C3;


    console.log("P_Final:", P_Final);

    const PF_Percentage = P_Final * 100;
    const FinalScore = parseFloat(((QP_Final + (100 - PF_Percentage)) / 2).toFixed(2));

    console.log("Final Score:", FinalScore);
    console.log("BT_Weights:", BT_Weights);

    const coRecommendations = generateCORecommendations(pre_data, CO_Map);
    console.log("CO Recommendations:", coRecommendations); 

    const moduleRecommendations = generateModuleRecommendations(ModuleWeights);
    console.log("Module Recommendations:", moduleRecommendations); 

    console.log("Question Recommendations:", questionRecommendations);

    console.log("C4: ", C4);

    // ── PO Coverage & CO-PO Mapping Coverage ─────────────────────────────────
    // Only calculate if CO_PO_Map has data
    const { PO_Coverage, CO_PO_Coverage } = hasPO
        ? calculatePOCoverage(CO_PO_Map, CO_Map, pre_data)
        : { PO_Coverage: {}, CO_PO_Coverage: {} };

    console.log("PO_Coverage:", JSON.stringify(PO_Coverage));
    console.log("CO_PO_Coverage:", JSON.stringify(CO_PO_Coverage));

    // CO_PO_Penalty: C4 expressed as a percentage (how much PO achievement is missed)
    // C4 is a 0–1 penalty value; * 100 gives the % of PO coverage that is NOT achieved
    const CO_PO_Penalty = (parseFloat((C4).toFixed(2)));
    console.log("CO_PO_Penalty (%):", CO_PO_Penalty);

    return {
        QuestionData: SequenceData,
        ModuleData: ModuleWeights,
        BloomsData: BT_Weights,
        COData: CO_Map,
        CO_NA_Map,           
        C4Penalty: C4,
        CO_PO_Penalty,    // C4 * 100 — % of PO coverage not achieved (penalty in %)
        FinalScore,
        CORecommendations: coRecommendations,
        ModuleRecommendations: moduleRecommendations,
        QuestionRecommendations: questionRecommendations,
        // PO-level coverage data for frontend display
        PO_Coverage,      // { PO1: 85.5, PO2: 40.0, ... }
        CO_PO_Coverage,   // { CO1: { PO1: 100.0, PO2: 66.7 }, CO2: { PO1: 0.0 } }
    };
};