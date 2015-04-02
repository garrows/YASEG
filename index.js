var canvas = document.getElementById('canvas'),
  ctx = canvas.getContext('2d'),
  center,
  camera,
  ship,
  planets,
  stars,
  startTime;

var PLANET_COUNT = 1000,
  PLANET_AREA = 10000,
  PLANET_SIZE = 80,
  STAR_COUNT = 4000,
  STAR_SIZE = 1;

var initialize = function() {
  canvas.setAttribute("width", window.innerWidth);
  canvas.setAttribute("height", window.innerHeight);

  startTime = Date.now();

  center = {
    x: canvas.width / 2,
    y: canvas.height / 2,
  };

  if (!ship) {

    ship = {
      x: canvas.width / 2,
      y: canvas.height / 2 / 2,
      h: 30,
      w: 20,
      r: 0,
      d: 0,
      v: 0,
      t: 0.1
    };

    camera = {
      x: ship.x - canvas.width / 2,
      y: ship.y - canvas.height / 2,
    };

    planets = Array(PLANET_COUNT);
    for (var i = 0; i < planets.length; i++) {
      planets[i] = {
        x: Math.random() * PLANET_AREA - PLANET_AREA / 2,
        y: Math.random() * PLANET_AREA - PLANET_AREA / 2,
        r: Math.random() * PLANET_SIZE + 20,
        home: i === planets.length - 1
      }
    }

    stars = Array(STAR_COUNT);
    for (var i = 0; i < stars.length; i++) {
      stars[i] = {
        x: Math.random() * PLANET_AREA - PLANET_AREA / 2,
        y: Math.random() * PLANET_AREA - PLANET_AREA / 2,
        r: Math.random() * STAR_SIZE + 1
      }
    }
  }
}
initialize();
window.onresize = initialize;


var updateShip = function(dt) {
  if (ship.left) ship.r -= 0.003 * dt;
  if (ship.right) ship.r += 0.003 * dt;

  if (ship.r > Math.PI * 2) ship.r -= Math.PI * 2;
  if (ship.r < 0) ship.r += Math.PI * 2;

  var startPos = {
    x: ship.x,
    y: ship.y
  };

  ship.x += Math.sin(ship.d) * ship.v;
  ship.y += -Math.cos(ship.d) * ship.v;
  var dx = ship.x - startPos.x;
  var dy = ship.y - startPos.y;

  if (ship.thrust) {
    ship.x += Math.sin(ship.r) * ship.t;
    ship.y += -Math.cos(ship.r) * ship.t;

    dx = ship.x - startPos.x;
    dy = ship.y - startPos.y;

    if (dy < 0) {
      ship.d = -Math.atan(dx / dy);
    } else if (dx > 0) {
      ship.d = Math.atan(dy / dx) + Math.PI / 2;
    } else if (dx < 0) {
      ship.d = Math.atan(dy / dx) + Math.PI * 1.5;
    }
    ship.v = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
    // if (ship.v > 4) ship.v = 4;
  }

  if (detectCollide()) {
    ship = null;
    initialize();
  };

  //Wrap border
  // if (ship.x < 0) ship.x = canvas.width;
  // if (ship.y < 0) ship.y = canvas.height;
  // if (ship.x > canvas.width) ship.x = 0;
  // if (ship.y > canvas.height) ship.y = 0;

  //Camera movement
  var cameraBuffer = 1;
  if (ship.x < canvas.width * cameraBuffer) camera.x += dx;
  if (ship.y < canvas.height * cameraBuffer) camera.y += dy;
  if (ship.x > canvas.width * 1 - cameraBuffer) camera.x += dx;
  if (ship.y > canvas.height * 1 - cameraBuffer) camera.y += dy;

}

var inPlanet = function(planet, x, y) {
  if (
    x < planet.x + planet.r &&
    x > planet.x - planet.r &&
    y < planet.y + planet.r &&
    y > planet.y - planet.r &&
    planet.r > 50 &&
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

  drawStars();
  drawPlanets();
  drawShip();
  drawHud();

  // drawDirection();

  requestAnimationFrame(draw);
}


var drawPlanets = function() {
  var planet, color;
  for (var i = 0; i < planets.length; i++) {
    planet = planets[i];
    color = planet.home ? '#0a0' : '#a00';

    if (planet.r < 50) color = 'rgba(255,0,0,0.3)';

    drawPlanet(planet.x, planet.y, planet.r, color);
  }
}

var drawStars = function() {
  var star, color, opacity;
  for (var i = 0; i < stars.length; i++) {
    star = stars[i];

    opacity = STAR_SIZE / star.r;
    color = 'rgba(255,255,255,' + opacity + ')';

    drawPlanet(star.x, star.y, star.r, color);
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

var drawDirection = function() {
  ctx.fillStyle = '#afa';
  ctx.strokeStyle = '#FFFFFF';
  // ctx.strokeRect(ship.x - ship.w / 2, ship.y - ship.h / 2, ship.w, ship.h);
  ctx.save();
  ctx.translate(ship.x - camera.x, ship.y - camera.y);
  ctx.rotate(ship.d);
  ctx.beginPath();
  ctx.moveTo(0, 0 - ship.v * 10);
  ctx.lineTo(0 + ship.w / 4, 0 + ship.h / 2);
  ctx.lineTo(0 - ship.w / 4, 0 + ship.h / 2);
  ctx.fill();
  ctx.restore();
}

var drawPlanet = function(x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x - camera.x, y - camera.y, r, 10, 80);
  ctx.fill();
}

var drawHud = function() {
  var score = 'Time: ' + ((Date.now() - startTime) / 1000).toFixed(0),
    x = 5,
    y = 20,
    color = '#FF11FF';

  ctx.font = '18px sans-serif'

  ctx.strokeStyle = color;
  ctx.fillStyle = color;

  ctx.strokeText(score, x, y);
  ctx.fillText(score, x, y);
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