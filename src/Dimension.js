



export let includes = (vm, pos) => {
    return (vm.position.x - vm.size.width / 2 < pos.x && vm.position.x + vm.size.width / 2 > pos.x &&
        vm.position.y - vm.size.height / 2 < pos.y && vm.position.y + vm.size.height / 2 > pos.y);
};

export let rotate = (p, theta) => {
    let c = Math.cos(theta);
    let s = Math.sin(theta);
    return {
        x: p.x * c - p.y * s,
        y: p.x * s + p.y * c
    };
}


export let translate = (p, d) => {
    return {
        x: p.x + d.x,
        y: p.y + d.y
    };
}


export let distanceToLine = (point, line) => {
    if (line.x0 === line.x1) {
        return point.x - line.x0;
    } else if (line.y0 === line.y1) {
        return point.y - line.y0;
    }

    let a = (line.y0 - line.y1) / (line.x0 - line.x1);
    let b = line.y0 - a * line.x0;

    return Math.abs(a* point.x - point.y + b) / Math.sqrt(a*a + 1);
}


export let offset = (point, offset) => {
    return {
        x: point.x + offset.x,
        y: point.y + offset.y
    };
}


export let crossingPointLineAndEllipse = (line, ellipse, margin) => {
    let dx = line.x0 - line.x1;
    let dy = -(line.y0 - line.y1) ;
    let theta2 = Math.atan2(dy, dx);
    let theta = Math.atan2(dy * ellipse.width / ellipse.height, dx);
    return {x: (ellipse.width/2) * Math.cos(theta) + line.x1 + margin * Math.cos(theta2),
        y: -(ellipse.height/2) * Math.sin(theta) + line.y1 - margin * Math.sin(theta2)};
}


export let crossingPointLineAndRect = (line, rect, margin) => {
    let dx = line.x0 - line.x1;
    let dy = -(line.y0 - line.y1) ; // dyが正なら画面下向きの矢印
    if (dx === 0) {
        return {x: line.x1, y: line.y1 + (dy > 0 ? rect.height/2 - margin : -rect.height/2 - margin)}
    }
    let a = dy / dx;
    let b = line.y1 + a * line.x1;
    let theta2 = Math.atan2(dy, dx);
    if (dx > 0 && dy > 0) { // 画面左下向き
        if (dy/dx < rect.height/ rect.width) { // 右側の辺に接する
            let x = line.x1 + rect.width/2;
            return {
                x: x + margin * Math.cos(theta2),
                y: (-a * x + b) - margin * Math.sin(theta2)
            }
        } else { // 上の辺に接する
            let y = line.y1 - rect.height / 2;
            return {
                x: - (y - b) / a + margin * Math.cos(theta2),
                y: y - margin * Math.sin(theta2)
            }
        }
    } else if (dx < 0 && dy > 0) {
        if (-dy/dx < rect.height/ rect.width) { // 左側の辺に接する
            let x = line.x1 - rect.width/2;
            return {
                x: x + margin * Math.cos(theta2),
                y: (-a * x + b) - margin * Math.sin(theta2)
            }
        } else { // 上の辺に接する
            let y = line.y1 - rect.height / 2;
            return {
                x: - (y - b) / a + margin * Math.cos(theta2),
                y: y - margin * Math.sin(theta2)
            }
        }
    } else if (dx < 0 && dy < 0) { // 画面右上向き
        //console.log('C1', dy/dx, rect.height/rect.width);
        if (dy/dx < rect.height/ rect.width) { // 左側の辺に接する
            let x = line.x1 - rect.width/2;
            return {
                x: x + margin * Math.cos(theta2),
                y: (-a * x + b) - margin * Math.sin(theta2)
            }
        } else { // 下の辺に接する
            let y = line.y1 + rect.height / 2;
            return {
                x: - (y - b) / a + margin * Math.cos(theta2),
                y: y - margin * Math.sin(theta2)
            }
        }
    } else if (dx > 0 && dy < 0) {
        if (-dy/dx < rect.height/ rect.width) { // 左側の辺に接する
            let x = line.x1 + rect.width/2;
            return {
                x: x + margin * Math.cos(theta2),
                y: (-a * x + b) - margin * Math.sin(theta2)
            }
        } else { // 上の辺に接する
            let y = line.y1 + rect.height / 2;
            return {
                x: - (y - b) / a + margin * Math.cos(theta2),
                y: y - margin * Math.sin(theta2)
            }
        }
    }
    let theta = Math.atan2(dy *  rect.width / rect.height, dx);
    return {x: (rect.width/2) * Math.cos(theta) + line.x1 + margin * Math.cos(theta2),
        y: -(rect.height/2) * Math.sin(theta) + line.y1 - margin * Math.sin(theta2)};
}


export let distance = (x0, x1) => {
    return Math.sqrt((x0.x - x1.x)**2 + (x0.y - x1.y)**2);
}