import {crossingPointLineAndEllipse, crossingPointLineAndRect, rotate, translate} from "./Dimension";

function init_nsins(tick) {
    let sins = [];
    let d = 0;
    for (let i = 0; i < tick;i++) {
        d = Math.PI * 2 / (tick+1) * i;
        sins.push(Math.sin(d));
    }
    return sins;
}

let nsins = init_nsins(600);

function normalize_rad(rad) {
    while(rad >= Math.PI*2) rad -= Math.PI*2;
    while(rad < 0) rad += Math.PI*2;
    return rad;
}

export function Nsin(rad1) {
    let rad = normalize_rad(rad1);
    let tick = nsins.length;
    return nsins[Math.round(rad / Math.PI / 2 * (tick+1))]
}

export function Ncos(rad1) {
    return Nsin(rad1 + Math.PI/2);
}


export function drawPolygon(ctx, points, color) {

    ctx.lineWidth = 4.0;
    ctx.strokeStyle = 'white';
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for(let i = 1;i < points.length;i++) {
        ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.lineTo(points[0].x, points[0].y);
    ctx.fill();
    ctx.stroke();
    ctx.closePath();


    ctx.shadowColor = color;
    ctx.shadowOffsetX = 4000;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 10;
    ctx.strokeStyle = 'black';

    ctx.beginPath();
    ctx.moveTo(points[0].x - 4000, points[0].y);
    for(let i = 1;i < points.length;i++) {
        ctx.lineTo(points[i].x - 4000, points[i].y);
    }
    ctx.lineTo(points[0].x - 4000, points[0].y);

    ctx.stroke();
    ctx.closePath();
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur =0;

    ctx.lineWidth = 1.0;
}

export function drawArc(ctx, center, radius, startAngle, stopAngle, color, option) {
    if (option === undefined) {
        option = {
            lineWidth: 3.0,
            ccw: false,
            blur: 10
        }
    }
    ctx.lineWidth = option.lineWidth;
    ctx.strokeStyle = 'white';
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius, startAngle, stopAngle, option.ccw !== undefined ? option.ccw : false);
    ctx.stroke();
    ctx.closePath();


    ctx.shadowColor = color;
    ctx.shadowOffsetX = 4000;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = option.blur !== undefined ? option.blur : 10.0;
    ctx.beginPath();
    ctx.strokeStyle = 'black';
    ctx.arc(center.x - 4000, center.y, radius, startAngle, stopAngle, option.ccw !== undefined ? option.ccw : false);
    ctx.stroke();
    ctx.closePath();
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur =0;

    ctx.lineWidth = 1.0;
}


export function drawLine(ctx, x0, x1, color, option) {
    if (option === undefined) {
        option = {
            lineWidth: 3.0,
            blur: 10,
            offset: {x: 0, y: 0}
        }
    }
    let offset = option.offset ? option.offset : {x: 0, y: 0};
    ctx.lineWidth = option.lineWidth !== undefined ? option.lineWidth : 3.0;
    ctx.strokeStyle = 'white';
    ctx.beginPath();
    ctx.moveTo(x0.x + offset.x, x0.y + offset.y);
    ctx.lineTo(x1.x + offset.x, x1.y + offset.y);
    ctx.stroke();
    ctx.closePath();


    ctx.shadowColor = color;
    ctx.shadowOffsetX = 4000;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = option.blur !== undefined ? option.blur : 10;
    ctx.beginPath();
    ctx.strokeStyle = 'black';
    ctx.moveTo(x0.x-4000 + offset.x, x0.y + offset.y);
    ctx.lineTo(x1.x-4000 + offset.x, x1.y + offset.y);

    ctx.stroke();
    ctx.closePath();
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur =0;

    ctx.lineWidth = 1.0;
}

export function drawRect(ctx, position, size, color, option) {
    if (option === undefined) {
        option = {
            stroke: true,
            fill: false,
            fillColor: 'black',
            strokeWidth: 6.0
        };
    }
    ctx.fillStyle = option.fillColor;
    ctx.strokeStyle = 'white';
    ctx.lineWidth = option.strokeWidth;
    ctx.beginPath();
    ctx.rect(position.x - size.width/2, position.y - size.height/2, size.width, size.height);
    if (option.stroke) {
        ctx.stroke();
    }
    ctx.fill();
    ctx.closePath();

    ctx.shadowColor = color;
    ctx.shadowOffsetX = 4000;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.strokeStyle = 'black';
    ctx.fillStyle = "white";
    ctx.rect(position.x - size.width/2 - 4000, position.y - size.height/2, size.width, size.height);
    if (option.stroke) {
        ctx.stroke();
    }
    if (option.fill) {
        ctx.fill();
    }
    ctx.closePath();
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur =0;

    ctx.lineWidth = 1.0;
}

export function drawRectShadow(ctx, position, size, color) {
    ctx.shadowColor = color;
    ctx.shadowOffsetX = 4000;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 100;
    ctx.beginPath();
    ctx.strokeStyle = 'black';
    ctx.fillStyle = "white";
    ctx.rect(position.x - size.width/2 - 4000, position.y - size.height/2, size.width, size.height);
    ctx.fill();
    ctx.closePath();
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur =0;
}


export function drawEllipseShadow(ctx, position, size, color) {
    ctx.shadowColor = color;
    ctx.shadowOffsetX = 4000;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 100;
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.ellipse(position.x - 4000, position.y, size.width/2, size.height/2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur =0;

    ctx.lineWidth = 1.0;
}

export function drawEllipse(ctx, position, size, color, option) {
    if (option === undefined)
    {
        option = {
            fill: true,
            lineWidth: 6.0,
            startAngle: 0.0,
            endAngle: Math.PI * 2
        };
    }
    if (option.startAngle !== undefined &&  option.endAngle !== undefined && option.startAngle >= option.endAngle) return;

    ctx.fillStyle = "black";
    ctx.lineWidth = option.lineWidth ? option.lineWidth : 6.0;
    ctx.strokeStyle = 'white';
    ctx.beginPath();
    ctx.ellipse(position.x, position.y, size.width/2, size.height/2, 0, option.startAngle !== undefined ? option.startAngle : 0, option.endAngle !== undefined ? option.endAngle : Math.PI*2);
    ctx.stroke(); {}
    if (option.fill) {
        ctx.fill();
    }
    ctx.closePath();

    ctx.shadowColor = color;
    ctx.shadowOffsetX = 4000;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.strokeStyle = 'black';
    ctx.fillStyle = "white";
    ctx.ellipse(position.x - 4000, position.y, size.width/2, size.height/2, 0, option.startAngle !== undefined ? option.startAngle : 0, option.endAngle !== undefined ? option.endAngle : Math.PI*2);
    ctx.stroke();
    ctx.closePath();
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur =0;

    ctx.lineWidth = 1.0;
}

export function drawText(ctx, text, position, color, option) {

    let align = option ? ( option.align ? option.align : 'center') : 'center';
    let scale = ctx.nkScale;
    ctx.lineWidth = 5.0;
    ctx.fillStyle = "white";
    ctx.font = "italic bold " + (14 * scale).toString() + "px monospace";
    let textWidth = ctx.measureText(text).width;
    let pos = position;
    if (align === 'center') {
        pos = {
            x: pos.x - textWidth / 2,
            y: pos.y
        }
    }
    ctx.fillText(text, pos.x, pos.y);
    ctx.shadowColor = color;
    ctx.shadowOffsetX = 4000;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 15;
    ctx.fillText(text, pos.x - 4000, pos.y);
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur =0;
    ctx.lineWidth = 1.0;
}

export function drawPi(ctx, center, radius, startAngle, endAngle, color, option) {
    if (option === undefined) {
        option = {
            lineWidth: 6.0,
            lineColor: 'white',
            innerRadius: 0,
            fill: true,
            stroke: true,
            fillColor: 'white'
        }
    }

    let innerRadius = option.innerRadius !== undefined ? option.innerRadius : 0;
    let stroke = option.stroke !== undefined ? option.stroke : true;
    let fill = option.fill !== undefined ? option.fill : true;
    let fillColor = option.fillColor !== undefined ? option.fillColor : 'white';
    let lineColor = option.lineColor !== undefined ? option.lineColor : 'white';

    if (startAngle >= endAngle) return;

    ctx.fillStyle = fillColor;
    ctx.lineWidth = option.lineWidth !== undefined ? option.lineWidth : 6.0;
    ctx.strokeStyle = lineColor;
    ctx.beginPath();
    let sc = Ncos(startAngle);
    let ss = Nsin(startAngle);
    let ec = Ncos(endAngle);
    let es = Nsin(endAngle);

    ctx.moveTo(center.x + innerRadius * sc, center.y + innerRadius * ss);
    ctx.lineTo( center.x + radius * sc, center.y + radius * ss);
    ctx.arc(center.x, center.y, radius, startAngle, endAngle);
    ctx.lineTo(center.x + innerRadius * ec, center.y + innerRadius * es);
    if (innerRadius > 0) {
        ctx.arc(center.x, center.y, innerRadius, endAngle, startAngle, true);
    }
    ctx.closePath();
    if (stroke) {
        ctx.stroke();
    }
    if (fill) {
        ctx.fill();
    }

    ctx.shadowColor = color;
    ctx.shadowOffsetX = 4000;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 20;
    ctx.strokeStyle = 'black';
    ctx.fillStyle = color;
    ctx.beginPath();

    ctx.moveTo(center.x + innerRadius * sc - 4000, center.y + innerRadius * ss);
    ctx.lineTo( center.x + radius * sc - 4000, center.y + radius * ss);
    ctx.arc(center.x - 4000, center.y, radius, startAngle, endAngle);
    ctx.lineTo(center.x + innerRadius * ec - 4000, center.y + innerRadius * es);
    if (innerRadius > 0) {
        ctx.arc(center.x - 4000, center.y, innerRadius, endAngle, startAngle, true);
    }


    ctx.closePath();
    ctx.stroke();
    if (fill) {
        ctx.fill();
    }

    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 0;
    ctx.lineWidth = 1.0;

}

export function drawCircleArrowToEllipse(ctx, vm, tgtVm, color) {
    drawLine(ctx, vm.position, tgtVm.position, color);
    let point = crossingPointLineAndEllipse({
        x0: vm.position.x, y0: vm.position.y,
        x1: tgtVm.position.x, y1: tgtVm.position.y
    }, {
        width: tgtVm.size.width,
        height: tgtVm.size.height
    }, 8);
    drawEllipse(ctx, {x: point.x-2, y: point.y-2}, {width: 12, height:12}, color);
}

export function drawArrowToRect(ctx, startPos, tgtVm, color) {
    drawLine(ctx, startPos, tgtVm.position, color);

    let line = {
        x0: startPos.x, y0: startPos.y,
        x1: tgtVm.position.x, y1: tgtVm.position.y
    };

    let point = crossingPointLineAndRect(line, {
        width: tgtVm.size.width,
        height: tgtVm.size.height
    }, 8);


    let dx = line.x0 - line.x1;
    let dy = -(line.y0 - line.y1) ;
    let theta = Math.atan2(dy, dx);

    let points = [
        {x: -10, y: 0},
        {x: 7, y: 6},
        {x: 7, y: -6}
    ];


    let newPoints = points.map(
        (p) => {
            return translate(rotate(p, -theta), point);
        }
    )
    drawPolygon(ctx, newPoints, color);

    /*
    let line = {
        x0: vm.position.x, y0: vm.position.y,
        x1: tgt.position.x, y1: tgt.position.y
    };


    let point;
    if (tgt.type === 'topic') {
        point = crossingPointLineAndRect(line, {
            width: tgt.size.width,
            height: tgt.size.height
        }, 8);
    }else {
        point = crossingPointLineAndEllipse(line, {
            width: tgt.size.width,
            height: tgt.size.height
        }, 8);
    }


    let dx = line.x0 - line.x1;
    let dy = -(line.y0 - line.y1) ;
    let theta = Math.atan2(dy, dx);

    let points = [
        {x: -10, y: 0},
        {x: 7, y: 6},
        {x: 7, y: -6}
    ];

    let newPoints = points.map(
        (p) => {
            return translate(rotate(p, -theta), point);
        }
    )
    drawPolygon(ctx, newPoints, color);


    if (c.type === 'event') {
        let p = translate(rotate({x:20, y:20}, -theta), point);
        drawText(ctx, 'e', p, color);
    }

    let p = translate(rotate({x:20, y:-20}, -theta), point);
    drawText(ctx, c.inlet.name, p, color);

     */
}

export function drawArrowToEllipse(ctx, startPos, tgtVm, color) {
    drawLine(ctx, startPos, tgtVm.position, color);

    let line = {
        x0: startPos.x, y0: startPos.y,
        x1: tgtVm.position.x, y1: tgtVm.position.y
    };

    let point = crossingPointLineAndEllipse(line, {
        width: tgtVm.size.width,
        height: tgtVm.size.height
    }, 8);

    let dx = line.x0 - line.x1;
    let dy = -(line.y0 - line.y1);
    let theta = Math.atan2(dy, dx);

    let points = [
        {x: -10, y: 0},
        {x: 7, y: 6},
        {x: 7, y: -6}
    ];

    let newPoints = points.map(
        (p) => {
            return translate(rotate(p, -theta), point);
        }
    )
    drawPolygon(ctx, newPoints, color);
}