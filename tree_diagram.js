// 動態取得 orange-box 的寬高
const orangeBox = document.getElementById("orangeBox");
const width = orangeBox.clientWidth; // 容器的寬度
const height = orangeBox.clientHeight; // 容器的高度

// 設定樹狀圖的佈局，大小為 orange-box 的寬高範圍
const my_treeLayout = d3.tree().size([height - 50, width - 100]); // 留出邊距

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
const board_size = 9;
function generateBoardsFromTree(tree) {
                        
    const initialBoard = Array(board_size)
        .fill(0)
        .map(() => Array(board_size).fill(0)); // Empty 9x9 board
    // console.log(initialBoard)
    const boards = [JSON.parse(JSON.stringify(initialBoard))]; // Start with initial board state
    let currentNode = tree;
    // console.log(currentNode)
    while (currentNode && currentNode.children && currentNode.n > 0) {
        // console.log(currentNode.n)
        
        const action = currentNode.action; // Get SGF action
        if (action) {
            const newBoard = JSON.parse(JSON.stringify(boards[boards.length - 1])); // Clone last board
            applyAction(newBoard, action); // Apply action
            boards.push(newBoard); // Add updated board to the list
        }
        // Find the next child node with the highest `n`
        currentNode = currentNode.children.reduce((best, child) => {
            if (child.n > 0 && (!best || child.n > best.n)) return child;
            return best;
        }, null);
    }

    return boards;
}

const csv_file_path = './game0_move10_game.csv';
function fetch_tree_nodes()
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
            const tree = buildMCTSTree(data);
            // Display the tree
            // document.getElementById('output').textContent = JSON.stringify(tree, null, 2);
            //console.log(tree[199][0]);
            return tree[199][0];
            //const boards = generateBoardsFromTree(tree[199][0]);
            //drawBoards(boards);
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('orangeBox').textContent = `Error: ${error.message}`;
        });
}

fetch_tree_nodes()
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

// 添加圓形節點
node.append("circle")
    .attr("r", 0.2) // 節點大小
    .on("mouseover", function (event, d) {
        // 顯示 tooltip 並填充內容
        tooltip.style("display", "block")
            .html(`
                <strong>Name:</strong> ${d.data.name}<br>
                <strong>X:</strong> ${d.x.toFixed(2)}<br>
                <strong>Y:</strong> ${d.y.toFixed(2)}
            `);
    })
    .on("mousemove", function (event) {
        // 更新 tooltip 位置
        tooltip.style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY + 10) + "px");
    })
    .on("mouseout", function () {
        // 隱藏 tooltip
        tooltip.style("display", "none");
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


        console.log(treeNode);
    })
    .catch(error => {
        console.error('Error:', error);
    });


