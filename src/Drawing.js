


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
            ccw: false
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
    ctx.shadowBlur = 10;
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
            blur: 10
        }
    }
    ctx.lineWidth = option.lineWidth !== undefined ? option.lineWidth : 10;
    ctx.strokeStyle = 'white';
    ctx.beginPath();
    ctx.moveTo(x0.x, x0.y);
    ctx.lineTo(x1.x, x1.y);
    ctx.stroke();
    ctx.closePath();


    ctx.shadowColor = color;
    ctx.shadowOffsetX = 4000;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = option.blur !== undefined ? option.blur : 10;
    ctx.beginPath();
    ctx.strokeStyle = 'black';
    ctx.moveTo(x0.x-4000, x0.y);
    ctx.lineTo(x1.x-4000, x1.y);

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
    ctx.lineWidth = option.lineWidth !== undefined ? option.lineWidth : 6.0;
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

export function drawText(ctx, text, position, color) {
    ctx.lineWidth = 5.0;
    ctx.fillStyle = "white";
    ctx.font = "italic bold 14px monospace";
    let textWidth = ctx.measureText(text).width;
    ctx.fillText(text, position.x - textWidth / 2, position.y);
    ctx.shadowColor = color;
    ctx.shadowOffsetX = 4000;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 15;
    ctx.fillText(text, position.x - textWidth / 2 - 4000, position.y);
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
    let sc = Math.cos(startAngle);
    let ss = Math.sin(startAngle);
    let ec = Math.cos(endAngle);
    let es = Math.sin(endAngle);

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