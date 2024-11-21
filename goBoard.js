// goBoard.js

function drawGoBoard(container, boardData) {
    const gridSize = 50;
    const boardSize = 9;

    // Create or select the SVG container
    let svg = container.select('svg');
    if (svg.empty()) {
        svg = container.append('svg')
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('viewBox', `0 0 ${boardSize * gridSize} ${boardSize * gridSize}`)
            .style('max-width', '100px')
            .style('max-height', '100px')
            .style('border', '1px solid black');
    } else {
        svg.selectAll('*').remove(); // Clear existing elements
    }

    // Draw the board grid
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            svg.append('rect')
                .attr('x', j * gridSize)
                .attr('y', i * gridSize)
                .attr('width', gridSize)
                .attr('height', gridSize)
                .attr('fill', 'none')
                .attr('stroke', 'black');
        }
    }

    // Draw the stones based on the boardData
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            if (boardData[i][j] === 1) {
                // Draw black stone
                svg.append('circle')
                    .attr('cx', j * gridSize + gridSize / 2)
                    .attr('cy', i * gridSize + gridSize / 2)
                    .attr('r', gridSize / 3)
                    .attr('fill', 'black');
            } else if (boardData[i][j] === -1) {
                // Draw white stone
                svg.append('circle')
                    .attr('cx', j * gridSize + gridSize / 2)
                    .attr('cy', i * gridSize + gridSize / 2)
                    .attr('r', gridSize / 3)
                    .attr('fill', 'white')
                    .attr('stroke', 'black');
            }
        }
    }
}
