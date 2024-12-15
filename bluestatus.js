function drawStatusBoard(container, root_info, top_info) {
    // 清空现有状态板
    let statusBoard = container.select('.status-board');
    if (statusBoard.empty()) {
        statusBoard = container.append('div')
            .attr('class', 'status-board')
            .style('width', '175px')
            .style('height', '400px')
            .style('padding', '10px')
            .style('border', '0px solid black')
            .style('position', 'absolute')
            .style('left', '70%') 
            .style('top', '17.5%')
            .style('background-color', 'white')
            .style('font-family', 'Times New Roman, serif')
            .style('font-size', '20px');
    } else {
        statusBoard.html(''); // 清空现有内容
    }

    // 动态填充信息
    statusBoard.append('div')
        .html(`<strong>Value: ${root_info.v*100}%</strong>`);
    statusBoard.append('div').html('&nbsp;'); 
    statusBoard.append('div')
        .html(`<strong>Policy:</strong>`);
        top_info.forEach(({ policy, action}, index) => {
            statusBoard.append('div')
                .text(`${index + 1}. ${action} (${policy.toFixed(5)*100}%)`)
                .style('font-size', '19px')
        });

    statusBoard.append('div')
        .text('--')
        .style('margin-top', '10px');
    statusBoard.append('div')
        .html('<strong>(Visit Counts)</strong>');
        statusBoard.append('div')
        .text(`Q: ${root_info.q}`);
}

function info(tree, step) {
    const v = extractValueFromRoot(tree[step][0], "v");
    const q = extractValueFromRoot(tree[step][0], "q");
    return {
        v,
        q,
        //result.get("v")
        get: function (key) {
            return this[key] !== undefined ? this[key] : null;
        }
    };
}

function extractTopPValuesAndActions(Pvalue, actions, topN = 3) {
    const combined = Pvalue.map((value, index) => ({
        policy: value,
        action: actions[index]
    }));

    const sorted = combined.sort((a, b) => b.policy - a.policy);
    const topValues = sorted.slice(0, topN);

    return topValues; 
}