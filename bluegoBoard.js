// bluegoBoard.js

// policy's domain and range setting
const boardSize = 9;
const colorScale_p = d3.scaleLinear()
    .domain([0, 0.5, 1])
    .range(['red', 'yellow', 'blue']);

const colorScale_v = d3.scaleLinear()
.domain([-1, -0.5, 0])
.range(['purple', 'green', 'orange']);

// value's domain and range setting
// const colorScale = d3.scaleLinear()
//     .domain([-1, 0, 1])
//     .range(['red', 'white', 'blue']);

function drawBlueGoBoard_p(container, boardData, heatmapData, policycolorData, size = 250) {
    const gridSize = size / 9; 
    const padding = gridSize; 
    const totalSize = size + padding; 

    // create svg container
    let svg = container.select('svg');
    if (svg.empty()) {
        svg = container.append('svg')
            .attr('width', size + padding) 
            .attr('height', size + padding) 
            .attr('viewBox', `0 0 ${size + padding} ${size + padding}`)
            .style('max-width', size + padding)
            .style('max-height', size + padding)
            .style('border', '0px solid black')
            .style('display', 'block')
            .style('position', 'relative')
            .style('left', '1%')
            .style('top', '35%');
    } else {
        svg.selectAll('*').remove(); 
    }

    // Draw the heatmap board
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            if (heatmapData[i][j] !== 0) {
                const colorpolicy = policycolorData[i][j];
                const fillcolor = colorScale_p(colorpolicy);
                
                svg.append('rect')
                    .attr('x', (j + 1) * gridSize) 
                    .attr('y', i * gridSize) 
                    .attr('width', gridSize)
                    .attr('height', gridSize)
                    .attr('fill', fillcolor);
            }
        }
    }

    // Draw the board grid
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            svg.append('rect')
                .attr('x', (j + 1) * gridSize) 
                .attr('y', i * gridSize) 
                .attr('width', gridSize)
                .attr('height', gridSize)
                .attr('fill', 'none')
                .attr('stroke', 'black')
                .attr('stroke-width', 1);
        }
    }

    // Draw the stones based on the boardData
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            if (boardData[i][j] === 1) {
                // black
                svg.append('circle')
                    .attr('cx', (j + 1) * gridSize + gridSize / 2)
                    .attr('cy', i * gridSize + gridSize / 2)
                    .attr('r', gridSize / 3)
                    .attr('fill', 'black');
            } else if (boardData[i][j] === -1) {
                // white 
                svg.append('circle')
                    .attr('cx', (j + 1) * gridSize + gridSize / 2)
                    .attr('cy', i * gridSize + gridSize / 2)
                    .attr('r', gridSize / 3)
                    .attr('fill', 'white')
                    .attr('stroke', 'black')
                    .attr('stroke-width', 1);
            }
        }
    }

    // Draw the labels
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
    const numbers = ['9', '8', '7', '6', '5', '4', '3', '2', '1'];

    // Left label(numbers)
    for (let i = 0; i < boardSize; i++) {
        svg.append('text')
            .attr('x', padding / 2) 
            .attr('y', i * gridSize + gridSize / 2) 
            .attr('font-size', '16px')
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .text(numbers[i]);
    }

    // Bottom label(letters)
    for (let j = 0; j < boardSize; j++) {
        svg.append('text')
            .attr('x', (j + 1) * gridSize + gridSize / 2) 
            .attr('y', size + padding / 2) 
            .attr('font-size', '16px')
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .style('front-family', 'Times New Romans, serif')
            .text(letters[j]);
    }
    svg.append('text')
    .text('*Click blue board to change policy to value.')
    .attr('x', 10) // 设置文字的 x 坐标
    .attr('y', 280) // 设置文字的 y 坐标
    .attr('font-size', '14px') // 设置字体大小
    .attr('fill', 'black') // 设置文字颜色
    .attr('text-anchor', 'start') // 确保文字从左开始对齐
    .style('font-family', 'Times New Roman, serif'); // 设置字体样式

}

function drawBlueGoBoard_v(container, boardData, heatmapData, policycolorData, size = 250) {
    const gridSize = size / 9; 
    const padding = gridSize; 
    const totalSize = size + padding; 

    // create svg container
    let svg = container.select('svg');
    if (svg.empty()) {
        svg = container.append('svg')
            .attr('width', size + padding) 
            .attr('height', size + padding) 
            .attr('viewBox', `0 0 ${size + padding} ${size + padding}`)
            .style('max-width', size + padding)
            .style('max-height', size + padding)
            .style('border', '0px solid black')
            .style('display', 'block')
            .style('position', 'relative')
            .style('left', '1%')
            .style('top', '35%');
    } else {
        svg.selectAll('*').remove(); 
    }

    // Draw the heatmap board
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            if (heatmapData[i][j] !== 0) {
                const colorpolicy = policycolorData[i][j];
                const fillcolor = colorScale_v(colorpolicy);
                
                svg.append('rect')
                    .attr('x', (j + 1) * gridSize) 
                    .attr('y', i * gridSize) 
                    .attr('width', gridSize)
                    .attr('height', gridSize)
                    .attr('fill', fillcolor);
            }
        }
    }

    // Draw the board grid
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            svg.append('rect')
                .attr('x', (j + 1) * gridSize) 
                .attr('y', i * gridSize) 
                .attr('width', gridSize)
                .attr('height', gridSize)
                .attr('fill', 'none')
                .attr('stroke', 'black')
                .attr('stroke-width', 1);
        }
    }

    // Draw the stones based on the boardData
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            if (boardData[i][j] === 1) {
                // black
                svg.append('circle')
                    .attr('cx', (j + 1) * gridSize + gridSize / 2)
                    .attr('cy', i * gridSize + gridSize / 2)
                    .attr('r', gridSize / 3)
                    .attr('fill', 'black');
            } else if (boardData[i][j] === -1) {
                // white 
                svg.append('circle')
                    .attr('cx', (j + 1) * gridSize + gridSize / 2)
                    .attr('cy', i * gridSize + gridSize / 2)
                    .attr('r', gridSize / 3)
                    .attr('fill', 'white')
                    .attr('stroke', 'black')
                    .attr('stroke-width', 1);
            }
        }
    }

    // Draw the labels
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
    const numbers = ['9', '8', '7', '6', '5', '4', '3', '2', '1'];

    // Left label(numbers)
    for (let i = 0; i < boardSize; i++) {
        svg.append('text')
            .attr('x', padding / 2) 
            .attr('y', i * gridSize + gridSize / 2) 
            .attr('font-size', '16px')
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .text(numbers[i]);
    }

    // Bottom label(letters)
    for (let j = 0; j < boardSize; j++) {
        svg.append('text')
            .attr('x', (j + 1) * gridSize + gridSize / 2) 
            .attr('y', size + padding / 2) 
            .attr('font-size', '16px')
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .style('front-family', 'Times New Romans, serif')
            .text(letters[j]);
    }
}

function generateHeatmapBoards(actions) {
    const initialBoard = Array(boardSize)
        .fill(0)
        .map(() => Array(boardSize).fill(0)); // Empty 9x9 board
    // console.log(initialBoard)
    const boards = [JSON.parse(JSON.stringify(initialBoard))];
    actions.forEach(action => {
        if (action === "W[PASS]" || action === "B[PASS]") return; // 跳过 Pass 动作

        // 从上一个棋盘状态复制
        const heatmapBoard = JSON.parse(JSON.stringify(boards[boards.length - 1]));

        // 解析动作，更新棋盘
        const { color, row, col } = parseSGFAction(action);
        heatmapBoard[row][col] = color; // 黑棋 = 1, 白棋 = -1

        // 将更新后的棋盘状态添加到 boards 数组
        boards.push(heatmapBoard);
    });

    return boards;
}

function generateColorBoards(actions, Value) {
    const initialBoard = Array(boardSize)
        .fill(0)
        .map(() => Array(boardSize).fill(0)); // Empty 9x9 board
    // console.log(initialBoard)
    const boards = [JSON.parse(JSON.stringify(initialBoard))];
    actions.forEach((action,i) => {
        if (action === "W[PASS]" || action === "B[PASS]") return; // 跳过 Pass 动作

        // 从上一个棋盘状态复制
        const policycolorBoard = JSON.parse(JSON.stringify(boards[boards.length - 1]));

        // 解析动作，更新棋盘
        const { color, row, col } = parseSGFAction(action);
        policycolorBoard[row][col] = Value[i]; // policycolor
        // console.log(row, col, color)

        // 将更新后的棋盘状态添加到 boards 数组
        boards.push(policycolorBoard);
    });

    return boards;
}