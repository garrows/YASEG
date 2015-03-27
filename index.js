var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

canvas.setAttribute("width", window.innerWidth);
canvas.setAttribute("height", window.innerHeight);

var center = {
  x: canvas.width / 2,
  y: canvas.height / 2,
};

var ship = {
  x: canvas.width / 2,
  y: canvas.height / 2 / 2,
  h: 30,
  w: 20,
  r: 0,
  d: 0,
  v: 0,
  t: 0.013
};


var updateShip = function(dt) {
  if (ship.left) ship.r -= 0.003 * dt;
  if (ship.right) ship.r += 0.003 * dt;
  ship.d = ship.r;
  if (ship.thrust) {
    ship.v += ship.t * dt;
  } else if (ship.down) {
    ship.v -= ship.t * dt;
  } else {
    ship.v -= 0.02 * dt;
    if (ship.v < 0) ship.v = 0;
  }
  ship.x += Math.sin(ship.d) * ship.v;
  ship.y -= Math.cos(ship.d) * ship.v;
  //soh cah toa



  if (ship.x < 0) ship.x = canvas.width;
  if (ship.y < 0) ship.y = canvas.height;
  if (ship.x > canvas.width) ship.x = 0;
  if (ship.y > canvas.height) ship.y = 0;

}


var lastTime;
var draw = function(time) {
  if (!lastTime) {
    lastTime = time;
    requestAnimationFrame(draw);
    return;
  }
  var dt = time - lastTime;
  lastTime = time;

  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  updateShip(dt);

  drawPlanet(center.x * 0.5, center.y, 50);
  drawPlanet(center.x * 1.5, center.y, 50);
  drawShip();

  requestAnimationFrame(draw);
}



var drawShip = function() {
  ctx.fillStyle = '#aaa';
  ctx.strokeStyle = '#FFFFFF';
  // ctx.strokeRect(ship.x - ship.w / 2, ship.y - ship.h / 2, ship.w, ship.h);
  ctx.save();
  ctx.translate(ship.x, ship.y);
  ctx.rotate(ship.r);
  ctx.beginPath();
  ctx.moveTo(0, 0 - ship.h / 2);
  ctx.lineTo(0 + ship.w / 2, 0 + ship.h / 2);
  ctx.lineTo(0 - ship.w / 2, 0 + ship.h / 2);
  ctx.fill();
  if (ship.thrust) {
    ctx.beginPath();
    ctx.fillStyle = '#faa';
    ctx.moveTo(0 + ship.w / 4, 0 + ship.h / 2);
    ctx.lineTo(0, 0 + ship.h * 1.5);
    ctx.lineTo(0 - ship.w / 4, 0 + ship.h / 2);
    ctx.fill();
  }
  ctx.restore();
}

var drawPlanet = function(x, y, r) {
  ctx.fillStyle = '#a00';
  ctx.beginPath();
  ctx.arc(x, y, r, 10, 80);
  ctx.fill();
}


document.onkeydown = document.onkeyup = function(e) {
  switch (e.which) {
    case 38: //up
      ship.thrust = e.type === "keydown";
      break;
    case 37: //left
      ship.left = e.type === "keydown";
      break;
    case 39: //right
      ship.right = e.type === "keydown";
      break;
    case 40: //down
      ship.down = e.type === "keydown";
      break;
  }
}


requestAnimationFrame(draw);