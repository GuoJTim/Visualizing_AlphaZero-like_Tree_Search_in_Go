// 動態取得 orange-box 的寬高
const orangeBox = document.getElementById("orangeBox");
const width = orangeBox.clientWidth; // 容器的寬度
const height = orangeBox.clientHeight; // 容器的高度

// 定義節點的棋盤大小
const squareSize = 0.5; // 每個方格的邊長，縮小100倍
const my_board_size = 9;   // 棋盤的行數和列數
const goBoardWidth = squareSize * my_board_size;
const goBoardHeight = squareSize * my_board_size;
const stoneRadius = squareSize * 0.4; // 棋子半徑

// 設定樹狀圖的佈局，大小為 orange-box 的寬高範圍
//const my_treeLayout = d3.tree().size([height - 50, width - 100]).nodeSize([10, 20]); // 留出邊距
const my_treeLayout = d3.tree().size([height - 50, width - 100]).separation((a, b) => {
    const aHasChildren = a.children && a.children.length > 0;
    const bHasChildren = b.children && b.children.length > 0;

    if (aHasChildren || bHasChildren) {
        return 30; // 如果至少有一個節點有子節點，間距較大
    }
    return 0.5; // 如果兩個節點都沒有子節點，間距較小
});

// 設定樹狀結構的數據
const my_treeData = {
    name: "my_root",
    children: [
        {
            name: "Child 1",
            children: [
                { name: "Grandchild 1" },
                { name: "Grandchild 2" }
            ]
        },
        {
            name: "Child 2",
            children: [
                { name: "Grandchild 3" },
                { name: "Grandchild 4" }
            ]
        }
    ]
};

function recordPaths(root) {
    const stack = [{ node: root, path: [root.action || "root"] }]; // 初始化堆疊

    while (stack.length > 0) {
        const { node, path } = stack.pop(); // 取出當前節點和路徑

        // 紀錄從 root 到目前節點的路徑
        node.path = path;

        // 如果有子節點，將子節點壓入堆疊，並傳遞更新後的路徑
        if (node.children) {
            node.children.forEach(child => {
                stack.push({ node: child, path: [...path, child.action || "unknown"] });
            });
        }
    }

    return root; // 返回更新後的樹
}
function removeEmptyChildren(root) {
    const stack = [root]; // 使用堆疊保存待處理的節點

    while (stack.length > 0) {
        const node = stack.pop(); // 從堆疊取出節點

        if (node.children) {
            // 過濾掉子節點為空的節點
            node.children = node.children.filter(child => child.children && child.children.length > 0);

            // 將所有子節點加入堆疊，繼續處理
            stack.push(...node.children);
        }
    }

    return root;
}
// Function to group data by `step`
function groupByStep_diagram(data) {
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
function buildTreeForStep_diagram(stepData) {
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
function buildMCTSTree_diagram(data) {
    // Group the data by `step`
    const groupedSteps = groupByStep_diagram(data);

    // Build trees for each step
    const treesByStep = {};
    for (const step in groupedSteps) {
        treesByStep[step] = buildTreeForStep_diagram(groupedSteps[step]);
    }

    return treesByStep;
}

function generateBoardsFromPath(path) {
    const initialBoard = Array(9)
                        .fill(0)
                        .map(() => Array(9).fill(0)); // Empty 9x9 board
    const boards = [JSON.parse(JSON.stringify(initialBoard))]; // Start with initial board state
    path.forEach((element, index) => {
        const newBoard = JSON.parse(JSON.stringify(boards[boards.length - 1])); // Clone last board
        applyAction(newBoard, element); // Apply action
        boards.push(newBoard); // Add updated board to the list
    });
    return boards[boards.length - 1];
}

// Fetch and process the CSV file
const eventTarget = new EventTarget();

let csv_file_path = './game0_move0_game.csv';

// 監聽事件
eventTarget.addEventListener('csvPathChange', (event) => {
    d3.select("#tree_diagram svg").remove();
    console.log(`Path changed to: ${event.detail.path}`);
    fetch_tree_nodes_from_json(csv_file_path)
    .then(treeNode => {
        // 將數據轉換為樹狀結構
const my_root = d3.hierarchy(treeNode);
// 應用樹狀佈局
my_treeLayout(my_root);

// 設定目標容器為 id="tree" 的 div
const svg = d3.select("#tree_diagram")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

// 添加一個可縮放、可拖曳的 group
const zoomGroup = svg.append("g")
    .attr("transform", "translate(50,50)");

// 畫連線
zoomGroup.selectAll(".link")
    .data(my_root.links())
    .enter()
    .append("path")
    .attr("class", "link")
    .attr("d", d => `M${d.source.y},${d.source.x} L${d.target.y},${d.target.x}`); // 手動生成路徑

// 添加 tooltip 到網頁
const tooltip = d3.select("body")
    .append("div")
    .style("position", "absolute")
    .style("background-color", "white")
    .style("border", "1px solid black")
    .style("border-radius", "5px")
    .style("padding", "5px")
    .style("display", "none")
    .style("pointer-events", "none"); // 避免干擾滑鼠事件

// 畫節點
const node = zoomGroup.selectAll(".node")
    .data(my_root.descendants())
    .enter()
    .append("g")
    .attr("class", "node")
    .attr("transform", d => `translate(${d.y},${d.x})`);

// 使用 each 來根據是否有子節點添加不同的形狀
node.each(function(d) {
    const nodeSelection = d3.select(this);

    if (d.children && d.children.length > 0) {
        // 如果有子節點，畫棋盤
        nodeSelection.append("g")
            .attr("class", "goBoard")
            .attr("transform", `translate(${-goBoardWidth / 2},${-goBoardHeight / 2})`) // 將棋盤中心對齊節點位置
            .selectAll("rect")
            .data(d3.range(my_board_size * my_board_size))
            .enter()
            .append("rect")
            .attr("x", d => (d % my_board_size) * squareSize)
            .attr("y", d => Math.floor(d / my_board_size) * squareSize)
            .attr("width", squareSize)
            .attr("height", squareSize)
            .attr("fill", "#ffffff")
            .attr("stroke", "#ccc")
            .attr("stroke-width", 0.05);
        
        
        const boards = generateBoardsFromPath(d.data.path);

        // 生成所有棋子位置
        const allPositions = [];
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (boards[i][j] == 1) { // 如果該位置有棋子
                    allPositions.push({
                        x: i, // 行數
                        y: j, // 列數
                        color: "black" // "black" 或 "white"
                    });
                }
                else if (boards[i][j] == -1) { // 如果該位置有棋子
                    allPositions.push({
                        x: i, // 行數
                        y: j, // 列數
                        color: "white" // "black" 或 "white"
                    });
                }
            }
        }

        // 添加棋子
        nodeSelection.append("g")
            .attr("class", "stones")
            .attr("transform", `translate(${-goBoardWidth / 2},${-goBoardHeight / 2})`) // 與棋盤對齊
            .selectAll("circle")
            .data(allPositions)
            .enter()
            .append("circle")
            .attr("cx", d => d.y * squareSize + squareSize / 2) // 棋盤格子的中心
            .attr("cy", d => d.x * squareSize + squareSize / 2)
            .attr("r", stoneRadius)
            .attr("fill", d => d.color === "black" ? "#000000" : "#ffffff")
            .attr("stroke", "#000000")
            .attr("stroke-width", 0.05)

            nodeSelection.select(".goBoard")
    .on("mouseover", function(event, d) {
        // 顯示 tooltip 並填充內容
        tooltip.style("display", "block")
            .html(`
                <strong>Name:</strong> ${d.data.color}<br>
            `);
    })
    .on("mousemove", function(event) {
        // 更新 tooltip 位置
        tooltip.style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY + 10) + "px");
    })
    .on("mouseout", function () {
        // 隱藏 tooltip
        tooltip.style("display", "none");
    })
    .on("click", function(event, d) {
        console.log(d.data);
        // 點擊事件，顯示 alert
        // alert(`You clicked on node: ${d.data.name}\nX: ${d.x.toFixed(2)}\nY: ${d.y.toFixed(2)}`);
    });
    } else {
        // 如果沒有子節點，畫圓形
        nodeSelection.append("circle")
            .attr("r", 0.2) // 調整圓形大小
            .attr("fill", "#000000") // 可選：設置顏色
            .on("mouseover", function(event, d) {
                // 顯示 tooltip 並填充內容
                tooltip.style("display", "block")
                    .html(`
                        <strong>Name:</strong> ${d.data.color}<br>
                    `);
            })
            .on("mousemove", function(event) {
                // 更新 tooltip 位置
                tooltip.style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY + 10) + "px");
            })
            .on("mouseout", function () {
                // 隱藏 tooltip
                tooltip.style("display", "none");
            })
            .on("click", function(event, d) {
                console.log(d.data);
                // 點擊事件，顯示 alert
                //alert(`You clicked on node: ${d.data.name}\nX: ${d.x.toFixed(2)}\nY: ${d.y.toFixed(2)}`);
            });
        
    }
});

node.append("text")
    .attr("dy", 3)
    .attr("x", d => d.children ? -10 : 10)
    .style("text-anchor", d => d.children ? "end" : "start")
    .text(d => d.data.name);

// 定義縮放與拖曳功能
const zoom = d3.zoom()
    .scaleExtent([0.1, 50]) // 定義縮放範圍
    .on("zoom", (event) => {
        // 獲取當前的變換
        const transform = event.transform;
        const scale = transform.k; // 當前縮放比例
        const translateX = transform.x; // 當前水平平移量
        const translateY = transform.y; // 當前垂直平移量

        // 更新圖形的位置與縮放
        zoomGroup.attr("transform", transform);

        // 在 Console 中顯示當前狀態
        //console.log(`Current Scale: ${scale}, TranslateX: ${translateX}, TranslateY: ${translateY}`);
    });

// 將縮放與拖曳行為綁定到 SVG
svg.call(zoom);
const k = 10;      // 縮放比例

const translateY = -(height * k / 1.3);

// 應用縮放與平移
svg.call(zoom.transform, d3.zoomIdentity.translate(50, translateY).scale(10));

    })
    .catch(error => {
        console.error('Error:', error);
    });
    //fetch_tree_nodes_from_csv(event.detail.path);
});

// 初次執行
//fetch_tree_nodes_from_csv(csv_file_path);

// 改變值並觸發事件
function updateCSVPath(newPath) {
    csv_file_path = newPath;
    eventTarget.dispatchEvent(new CustomEvent('csvPathChange', { detail: { path: csv_file_path } }));
}

// // 觸發變更
// setTimeout(() => {
//     updateCSVPath('./game0_move0_game.csv');
// }, 7000);

// // 觸發變更
// setTimeout(() => {
//     updateCSVPath('./game0_move10_game.csv');
// }, 14000);

//const csv_file_path = './game0_move10_game.csv';
function fetch_tree_nodes_from_json(csv_file_path)
{
    return fetch(csv_file_path)
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to load JSON file');
        }
        return response.json();  // 自動解析成物件
    })
    .then(data => {
        //console.log(data[0]);  // 輸出 JSON 檔案的內容
        const updatedTree = recordPaths(data[0]);
        //console.log(updatedTree);
        return updatedTree;
    })
    .catch(error => {
        console.error('Error:', error);
    });

}
function fetch_tree_nodes_from_csv(csv_file_path)
{
    return fetch(csv_file_path)
        .then(response => {
            if (!response.ok) throw new Error(`Failed to load CSV file: ${response.statusText}`);
            return response.text();
        })
        .then(content => {
            // Parse the CSV
            const header = [
                'game', 'move', 'step', 'step_id', 'prev', 'color', 
                'action', 'q', 'n', 'p', 'v', 'r', 'is_current'
            ];
            const rows = parseCSV(content);
            const data = rows.map(row => header.map((_, index) => row[index] || ''));
            // Build the tree
            const tree = buildMCTSTree_diagram(data);
            // Display the tree
            // document.getElementById('output').textContent = JSON.stringify(tree, null, 2);
            //console.log(tree[199][0]);
            //const updatedTree = removeEmptyChildren(tree[199][0]);
            //console.log(updatedTree);
            //return updatedTree;
            console.log(tree[199][0]);
            const updatedTree = recordPaths(tree[199][0]);
            //console.log(updatedTree);
            return updatedTree;
            //return tree[199][0];
            //const boards = generateBoardsFromTree(tree[199][0]);
            //drawBoards(boards);
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('orangeBox').textContent = `Error: ${error.message}`;
        });
}




