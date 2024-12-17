// 動態取得 orange-box 的寬高
const orangeBox = document.getElementById("orangeBox");
const width = orangeBox.clientWidth; // 容器的寬度
const height = orangeBox.clientHeight; // 容器的高度

// 定義節點的棋盤大小
const squareSize = 0.5; // 每個方格的邊長，縮小100倍
const my_board_size = 9;   // 棋盤的行數和列數
const goBoardWidth = squareSize * my_board_size;
const goBoardHeight = squareSize * my_board_size;

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



// Fetch and process the CSV file

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
            const tree = buildMCTSTree_diagram(data);
            // Display the tree
            // document.getElementById('output').textContent = JSON.stringify(tree, null, 2);
            console.log(tree[199][0]);
            //const updatedTree = removeEmptyChildren(tree[199][0]);
            //console.log(updatedTree);
            //return updatedTree;
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

// 使用 each 來根據是否有子節點添加不同的形狀
node.each(function(d) {
    const nodeSelection = d3.select(this);

    if (d.children && d.children.length > 0) {
        // 如果沒有子節點，畫矩形
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
            .attr("stroke-width", 0.05) // 可選：添加方格邊框
    
            nodeSelection.select(".goBoard")
    .on("mouseover", function(event, d) {
        // 顯示 tooltip 並填充內容
        tooltip.style("display", "block")
            .html(`
                <strong>Name:</strong> ${d.data.name}<br>
                <strong>X:</strong> ${d.x.toFixed(2)}<br>
                <strong>Y:</strong> ${d.y.toFixed(2)}
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
        // 如果有子節點，畫圓形
        nodeSelection.append("circle")
            .attr("r", 0.2) // 調整圓形大小
            .attr("fill", "#000000") // 可選：設置顏色
            .on("mouseover", function(event, d) {
                // 顯示 tooltip 並填充內容
                tooltip.style("display", "block")
                    .html(`
                        <strong>Name:</strong> ${d.data.name}<br>
                        <strong>X:</strong> ${d.x.toFixed(2)}<br>
                        <strong>Y:</strong> ${d.y.toFixed(2)}
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


        console.log(treeNode);
    })
    .catch(error => {
        console.error('Error:', error);
    });


