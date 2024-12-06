const csvFilePath = './game0_move0_game.csv';

// Function to parse CSV content into an array of rows
function parseCSV(content) {
    const rows = content.split('\n').filter(row => row.trim() !== ''); // Remove empty lines
    return rows.map(row => row.split(',').map(cell => cell.trim())); // Split by commas and trim whitespace
}
// Function to group data by `step`
function groupByStep(data) {
    const steps = {};
    data.forEach(row => {
        const step = row[2]; // `step` is at index 2
        if (!steps[step]) {
            steps[step] = [];
        }
        steps[step].push(row);
    });
    return steps;
}

// Function to build a tree for a single step
function buildTreeForStep(stepData) {
    const tree = {};
    const nodes = {};

    stepData.forEach(row => {
        const [
            game, move, step, step_id, prev, color, action, q, n, p, v, r, is_current
        ] = row;

        // Ensure the current node exists
        if (!nodes[step_id]) {
            nodes[step_id] = {
                step_id,
                step,
                prev,
                is_current: is_current === 'true',
                game,
                move,
                color,
                action,
                q: parseFloat(q),
                n: parseInt(n, 10),
                p: parseFloat(p),
                v: parseFloat(v),
                r: parseFloat(r),
                children: []
            };
        }

        // Ensure the parent node exists and attach the current node as a child
        if (prev !== '-1') { // -1 means root node
            if (!nodes[prev]) {
                nodes[prev] = { step_id: prev, children: [] }; // Create a placeholder for parent
            }
            nodes[prev].children.push(nodes[step_id]);
        } else {
            // If root node, attach to the tree
            tree[step_id] = nodes[step_id];
        }
    });

    return tree;
}

// Main function to process the data and split by step
function buildMCTSTree(data) {
    // Group the data by `step`
    const groupedSteps = groupByStep(data);

    // Build trees for each step
    const treesByStep = {};
    for (const step in groupedSteps) {
        treesByStep[step] = buildTreeForStep(groupedSteps[step]);
    }

    return treesByStep;
}



var tmp;
// Fetch and process the CSV file
fetch(csvFilePath)
    .then(response => {
        console.log("A??")
        if (!response.ok) throw new Error(`Failed to load CSV file: ${response.statusText}`);
        return response.text();
    })
    .then(content => {
        console.log("W??")
        // Parse the CSV
        const header = [
            'game', 'move', 'step', 'step_id', 'prev', 'color', 
            'action', 'q', 'n', 'p', 'v', 'r', 'is_current'
        ];
        console.log("W??")
        const rows = parseCSV(content);
        console.log("W??")
        const data = rows.map(row => header.map((_, index) => row[index] || ''));
        console.log("W??")

        // Build the tree
        const tree = buildMCTSTree(data);
        console.log("W??")
        tmp = tree
        // Display the tree
        // document.getElementById('output').textContent = JSON.stringify(tree, null, 2);
        console.log(tree)
    })
    .catch(error => {
        console.log("O??")
        console.error('Error:', error);
        document.getElementById('output').textContent = `Error: ${error.message}`;
});