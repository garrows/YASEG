var canvas = document.getElementById('canvas'),
  ctx = canvas.getContext('2d'),
  center,
  camera,
  ship,
  planets,
  stars,
  level = 1,
  startTime;


// var PLANET_COUNT = 1,
//   PLANET_AREA = 100,
//   PLANET_SIZE = 80,
//   PLANET_BACKGROUND_SIZE = 0,
//   STAR_COUNT = 40,
//   STAR_SIZE = 1;

var PLANET_COUNT = 200,
  PLANET_AREA = 10000,
  PLANET_SIZE = 80,
  // PLANET_BACKGROUND_SIZE = 50,
  PLANET_BACKGROUND_SIZE = 0,
  PLANET_DENSITY_COEFFICIENT = 10,
  STAR_COUNT = 4000,
  STAR_SIZE = 1,
  MAX_VELOCITY_HUD = 30,
  MAX_TARGET_DISTANCE_HUD = PLANET_AREA / 2;

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
      t: 0.2,
      mass: 100
    };

    camera = {
      x: ship.x - canvas.width / 2,
      y: ship.y - canvas.height / 2,
    };

    planets = Array(PLANET_COUNT);
    for (var i = 0; i < planets.length; i++) {
      var radius = Math.random() * PLANET_SIZE + 20;
      planets[i] = {
        x: Math.random() * PLANET_AREA - PLANET_AREA / 2,
        y: Math.random() * PLANET_AREA - PLANET_AREA / 2,
        r: radius,
        mass: radius * PLANET_DENSITY_COEFFICIENT,
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
  var dx, dy;

  //Steering
  if (ship.left) ship.r -= 0.003 * dt;
  if (ship.right) ship.r += 0.003 * dt;

  //Clip rotation
  if (ship.r > Math.PI * 2) ship.r -= Math.PI * 2;
  if (ship.r < 0) ship.r += Math.PI * 2;
  if (ship.d > Math.PI * 2) ship.d -= Math.PI * 2;
  if (ship.d < 0) ship.d += Math.PI * 2;

  var startPos = {
    x: ship.x,
    y: ship.y
  };

  //Apply momentum TODO: add mass & dt
  ship.x += Math.sin(ship.d) * ship.v;
  ship.y += -Math.cos(ship.d) * ship.v;

  if (ship.thrust) {
    //Apply thrust TODO: add mass & dt
    ship.x += Math.sin(ship.r) * ship.t;
    ship.y += -Math.cos(ship.r) * ship.t;
  }

  var planet;
  for (var i = 0; i < planets.length; i++) {
    planet = planets[i];

    var distance = Math.sqrt(Math.pow(planet.x - ship.x, 2) + Math.pow(planet.y - ship.y, 2));
    if (distance < canvas.width) {
      var pdx = ship.x - planet.x;
      var pdy = ship.y - planet.y;

      var direction;
      if (pdy < 0) {
        direction = -Math.atan(pdx / pdy);
      } else if (pdx > 0) {
        direction = Math.atan(pdy / pdx) + Math.PI / 2;
      } else if (pdx < 0) {
        direction = Math.atan(pdy / pdx) + Math.PI * 1.5;
      }
      direction -= Math.PI;

      var gravitationalForce = (ship.mass + planet.mass) / Math.pow(distance, 2);
      ship.x += Math.sin(direction) * gravitationalForce * dt / 10;
      ship.y += -Math.cos(direction) * gravitationalForce * dt / 10;

    }
  }

  //Calculate change of direction.
  var vector = getVector(startPos, ship);
  ship.d = vector.angle;
  ship.v = vector.distance;


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
  camera.x = ship.x - canvas.width / 2;
  camera.y = ship.y - canvas.height / 2;
  // var cameraBuffer = 1;
  // if (ship.x < canvas.width * cameraBuffer) camera.x += dx;
  // if (ship.y < canvas.height * cameraBuffer) camera.y += dy;
  // if (ship.x > canvas.width * 1 - cameraBuffer) camera.x += dx;
  // if (ship.y > canvas.height * 1 - cameraBuffer) camera.y += dy;

}

var inPlanet = function(planet, x, y) {
  if (
    x < planet.x + planet.r &&
    x > planet.x - planet.r &&
    y < planet.y + planet.r &&
    y > planet.y - planet.r &&
    planet.r > PLANET_BACKGROUND_SIZE &&
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
    if (inPlanet(planet, ship.x, ship.y)) {
      if (i === planets.length - 1) {
        levelUp();
      }
      return true;
    }
    // if (inPlanet(planet, ship.x, ship.y + ship.h / 2)) return true;
    // if (inPlanet(planet, ship.x + ship.w / 2, ship.y - ship.h / 2)) return true;
    // if (inPlanet(planet, ship.x + ship.w / 2, ship.y - ship.h / 2)) return true;
  }
  return false;
}

var levelUp = function() {
  level++;
  PLANET_AREA = Math.floor(PLANET_AREA * 1.20);
  PLANET_COUNT = Math.floor(PLANET_COUNT * 1.20);
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

  requestAnimationFrame(draw);
}


var drawPlanets = function() {
  var planet, color;
  for (var i = 0; i < planets.length; i++) {
    planet = planets[i];
    color = planet.home ? '#0a0' : '#a00';

    if (planet.r < PLANET_BACKGROUND_SIZE) color = 'rgba(255,0,0,0.3)';

    drawPlanet(planet.x, planet.y, planet.r, color);
  }
}

var drawStars = function() {
  var star, color, opacity;
  for (var i = 0; i < stars.length; i++) {
    star = stars[i];

    opacity = STAR_SIZE / star.r;
    // color = 'rgba(255,255,255,' + opacity + ')';
    color = 'white';

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


var drawHudArrow = function(direction, distance, max, color) {
  ctx.fillStyle = color;
  ctx.save();
  ctx.translate(ship.x - camera.x, ship.y - camera.y);
  ctx.rotate(direction);
  ctx.beginPath();
  var r = -30,
    w = 2,
    percent = distance / max,
    d = percent * 100;
  ctx.moveTo(0, r - d);
  ctx.lineTo(0 + w, r);
  ctx.lineTo(0 - w, r);
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
    levelString = 'Level: ' + level,
    x = 5,
    y = 20,
    textHeight = 30,
    color = '#FF11FF';

  ctx.font = '18px sans-serif'

  ctx.strokeStyle = color;
  ctx.fillStyle = color;

  ctx.strokeText(levelString, x, y);
  ctx.fillText(levelString, x, y);
  ctx.strokeText(score, x, y + textHeight);
  ctx.fillText(score, x, y + textHeight);

  //Draw trajectory
  drawHudArrow(ship.d, ship.v, MAX_VELOCITY_HUD, '#faa');
  //Draw target
  var vector = getVector(ship, planets[planets.length - 1]);
  drawHudArrow(vector.angle, vector.distance, MAX_TARGET_DISTANCE_HUD, '#afa');
}

var getVector = function(source, target) {
  var vector = {
    x: target.x - source.x,
    y: target.y - source.y,
    angle: 0,
    distance: 0
  };
  if (vector.y < 0) {
    vector.angle = -Math.atan(vector.x / vector.y);
  } else if (vector.x > 0) {
    vector.angle = Math.atan(vector.y / vector.x) + Math.PI / 2;
  } else if (vector.x < 0) {
    vector.angle = Math.atan(vector.y / vector.x) + Math.PI * 1.5;
  }
  //Calculate velocity
  vector.distance = Math.sqrt(Math.pow(vector.x, 2) + Math.pow(vector.y, 2));
  return vector;
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