//Version-4
//Version-3
const fs = require('fs');
const xlsx = require('xlsx');
const { spawnSync } = require('child_process');

// Bloom's taxonomy verbs by category
const bloomsTaxonomyVerbs = {
    "remember": ["recall", "give", "reproduce", "memorize", "define", "identify", "describe", "label", "list", "name", "state", "match", "recognize", "examine", "draw", "write", "locate", "quote", "read", "record", "repeat", "retell", "visualize", "copy", "duplicate", "enumerate", "listen", "observe", "omit", "tabulate", "tell", "what", "why", "when", "where", "which"],
    "understand": ["explain", "how", "interpret", "paraphrase", "summarize", "classify", "compare", "differentiate", "discuss", "distinguish", "extend", "predict", "associate", "contrast", "convert", "demonstrate", "estimate", "identify", "infer", "relate", "restate", "translate", "generalize", "group", "illustrate", "judge", "observe", "order", "report", "represent", "research", "review", "rewrite", "show", "trace"],
    "apply": ["solve", "apply", "modify", "use", "calculate", "change", "demonstrate", "experiment", "relate", "show", "complete", "manipulate", "practice", "simulate", "transfer"],
    "analyze": ["analyze", "analyse", "compare", "classify", "contrast", "distinguish", "infer", "separate", "categorize", "differentiate", "correlate", "deduce", "devise", "dissect", "estimate", "evaluate"],
    "evaluate": ["evaluate", "judge", "assess", "appraise", "critique", "criticize", "discern", "discriminate", "consider", "weigh", "measure", "estimate", "rate", "grade", "score", "rank", "test", "recommend", "decide", "conclude", "argue", "debate", "justify", "persuade", "defend", "support", "summarize", "editorialize", "predict", "distinguish"],
    "create": ["design", "compose", "synthesis", "plan", "combine", "formulate", "invent", "hypothesize", "substitute", "compile", "construct", "develop", "generalize", "integrate", "modify", "organize", "prepare", "produce", "rearrange", "rewrite", "adapt", "arrange", "assemble", "choose", "collaborate", "facilitate", "imagine", "intervene", "manage", "originate", "propose", "simulate", "solve", "support", "test", "validate", "create"]
};

// Helper: Extract verbs from text using Python spaCy
function extractVerbsPython(text) {
    const result = spawnSync('python', ['extraction_logic.py', text], { encoding: 'utf-8' });
    if (result.error) {
        console.error('Python error:', result.error);
        return [];
    }
    return result.stdout.trim().split(',').filter(Boolean);
}

// Function to structurize and process the Excel data
exports.Structurize = (data, inputFile, bloomLevelMap) => {
    return new Promise((resolve, reject) => {
        try {
            const workbook = xlsx.readFile(inputFile);
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];

            // Convert the sheet into a JSON array
            const tableData = xlsx.utils.sheet_to_json(sheet, { defval: '' });

            const StructurizedData = tableData.map(row => {
                const questionText = row.question || row.Question || row.QUESTION || '';
                
                if (!questionText) {
                    console.warn(`Missing question text for row: ${JSON.stringify(row)}`);
                    return null;
                }

                const bloom = exports.FindBloomLevelsInText(questionText, bloomLevelMap);

                const moduleNumber = row.Module !== undefined && row.Module !== null
                    ? String(row.Module).trim()
                    : 'N/A';

                // Extract verbs using Python spaCy
                const extractedVerbs = extractVerbsPython(questionText);

                // Return structured data for each row
                return questionText ? {
                    ...row,
                    "Bloom's Verbs": bloom.words,
                    "Bloom's Taxonomy Level": bloom.highestLevel,
                    "Bloom's Highest Verb": bloom.highestVerb,
                    "Module": moduleNumber,
                    "Extracted Verbs": extractedVerbs.join(', ')
                } : null;
            }).filter(row => row !== null); 

            resolve(StructurizedData);
        } catch (error) {
            reject(`Error processing the file: ${error.message}`);
        }
    });
};

// Helper to find level name from verb
function findBloomLevel(word, bloomLevelMap) {
    for (const level in bloomsTaxonomyVerbs) {
        if (bloomsTaxonomyVerbs[level].includes(word)) {
            return level;
        }
    }
    return "Not Found";
}

// Public method to analyze Bloom level in a sentence
exports.FindBloomLevelsInText = (text, bloomLevelMap) => {
    const words = text.split(/\W+/);
    const wordResult = [];
    const levelResult = [];
    let highestLevel = 7;
    let highestVerb = null;

    for (const word of words) {
        const lowerWord = word.toLowerCase();
        const level = findBloomLevel(lowerWord, bloomLevelMap);

        if (level !== "Not Found") {
            const levelIndex = getBloomLevelIndex(level, bloomLevelMap);
            wordResult.push(word);
            levelResult.push(levelIndex);
            
            if(levelIndex < highestLevel){
                highestLevel = levelIndex;
                highestVerb = word;
            }
        }
    }

    // If no Bloom verbs found, assign default level 6
    if (highestLevel === Infinity) {
        console.warn(`Warning: No Bloom verbs found in: "${text.substring(0, 50)}..."`);
        highestLevel = 6;
        highestVerb = "N/A";
    }

    return {
        words: wordResult.join(", ") || "None",
        levels: levelResult.join(", ") || "None",
        highestLevel,
        highestVerb: highestVerb || "N/A",
    };
};

// Helper to convert level to number using bloomLevelMap
function getBloomLevelIndex(level, bloomLevelMap) {
    const mappedLevel = bloomLevelMap[level];
    
    if (mappedLevel === undefined) {
        console.warn(`Warning: Bloom level "${level}" not found in bloomLevelMap, defaulting to 6`);
        return 6;
    }
    
    return mappedLevel;
}