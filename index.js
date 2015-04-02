var canvas = document.getElementById('canvas'),
  ctx = canvas.getContext('2d'),
  center,
  camera,
  ship,
  planets;

var initialize = function() {
  canvas.setAttribute("width", window.innerWidth);
  canvas.setAttribute("height", window.innerHeight);

  center = {
    x: canvas.width / 2,
    y: canvas.height / 2,
  };

  if (!ship) {
    camera = {
      x: 0,
      y: 0,
    };

    ship = {
      x: canvas.width / 2,
      y: canvas.height / 2 / 2,
      h: 30,
      w: 20,
      r: 0,
      d: 0,
      v: 0,
      t: 0.003
    };

    var PLANET_COUNT = 1000;
    var PLANET_AREA = 10000;
    var PLANET_SIZE = 80;
    planets = Array(PLANET_COUNT);
    for (var i = 0; i < planets.length; i++) {
      planets[i] = {
        x: Math.random() * PLANET_AREA - PLANET_AREA / 2,
        y: Math.random() * PLANET_AREA - PLANET_AREA / 2,
        r: Math.random() * PLANET_SIZE + 20,
        home: i === planets.length - 1
      }
    }
  }
}
initialize();
window.onresize = initialize;


var updateShip = function(dt) {
  if (ship.left) ship.r -= 0.003 * dt;
  if (ship.right) ship.r += 0.003 * dt;
  // ship.d = ship.r;
  if (ship.thrust) {
    // ship.v += ship.t * dt;
    var rx = Math.sin(ship.r) * ship.t;
    var ry = -Math.cos(ship.r) * ship.t;
    ship.v += Math.sqrt(Math.pow(rx, 2) + Math.pow(ry, 2));
    ship.d = Math.atan((ry) / (rx));
    ship.x += rx;
    ship.y += ry;
    console.log(ship.v);
  } else if (ship.down) {
    // ship.v -= ship.t * dt;
  } else {
    // ship.v -= 0.002 * dt;
    // if (ship.v < 0) ship.v = 0;
  }
  var dx = Math.sin(ship.d) * ship.v;
  var dy = -Math.cos(ship.d) * ship.v;
  // ship.d = Math.atan((dy + ry) / (dx + rx));

  ship.x += dx;
  ship.y += dy;

  if (detectCollide()) {
    ship = null;
    initialize();
  };


  // if (ship.x < 0) ship.x = canvas.width;
  // if (ship.y < 0) ship.y = canvas.height;
  // if (ship.x > canvas.width) ship.x = 0;
  // if (ship.y > canvas.height) ship.y = 0;

  if (ship.x < canvas.width * 0.30) camera.x += dx;
  if (ship.y < canvas.height * 0.30) camera.y += dy;
  if (ship.x > canvas.width * 0.70) camera.x += dx;
  if (shipop.y > canvas.height * 0.70) camera.y += dy;

}

var inPlanet = function(planet, x, y) {
  if (
    x < planet.x + planet.r &&
    x > planet.x - planet.r &&
    y < planet.y + planet.r &&
    y > planet.y - planet.r &&
    true
  ) {
    return true;
  } else {
    return false;
  }
}

var detectCollide = function() {
  var planet;
  for (var i = 0; i < planets.length; i++) {
    planet = planets[i];
    if (inPlanet(planet, ship.x, ship.y)) return true;
    // if (inPlanet(planet, ship.x, ship.y + ship.h / 2)) return true;
    // if (inPlanet(planet, ship.x + ship.w / 2, ship.y - ship.h / 2)) return true;
    // if (inPlanet(planet, ship.x + ship.w / 2, ship.y - ship.h / 2)) return true;
  }
  return false;
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

  drawPlanets();
  drawShip();

  requestAnimationFrame(draw);
}


var drawPlanets = function() {
  var planet, color;
  for (var i = 0; i < planets.length; i++) {
    planet = planets[i];
    color = planet.home ? '#0a0' : '#a00';

    drawPlanet(planet.x, planet.y, planet.r, color);
  }
}


var drawShip = function() {
  ctx.fillStyle = '#aaa';
  ctx.strokeStyle = '#FFFFFF';
  // ctx.strokeRect(ship.x - ship.w / 2, ship.y - ship.h / 2, ship.w, ship.h);
  ctx.save();
  ctx.translate(ship.x - camera.x, ship.y - camera.y);
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

var drawPlanet = function(x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x - camera.x, y - camera.y, r, 10, 80);
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