const canvas = document.querySelector('canvas');
canvas.width = document.body.clientWidth; //document.width is obsolete
canvas.height = document.body.clientHeight; //document.height is obsolete

const ctx = canvas.getContext('2d');
const width = canvas.width;
const height = canvas.height;
const randomX = () => (Math.random() * width);
const randomY = () => (Math.random() * height);
const average = (array) => array.reduce((a, b) => a + b) / array.length;
const dist = (from, to) => Math.sqrt(Math.pow(from[0] - to[0], 2) + Math.pow(from[1] - to[1], 2));
const vSubtract = (v1, v2) => [v1[0] - v2[0], v1[1] - v2[1]];
const vAdd = (v1, v2) => [v1[0] + v2[0], v1[1] + v2[1]];
const mag = (v) => Math.sqrt(Math.pow(v[0], 2) + Math.pow(v[1], 2));
const rand = (min, max) => Math.random() * (max - min) + min;


var BOID_RADIUS = 50;
const BOID_REPEL_RADIUS = 10;
const MOD_CENTER_MASS = 15;
const MOD_VEL_MATCH = 1000;
const MAX_VELOCITY = 5;
const WIND_MAX = 0;
var MOD_CENTER_TENDENCY = 0;


/*
boid:
    position: v2
    velocity: v2
 */
let birds = [];
let wind = [0, 0];


function scatter() {
    if(BOID_RADIUS == 50) {
        BOID_RADIUS = 1;
    } else {
        BOID_RADIUS = 50;
    }
}


function updateWind() {
    wind = [rand(WIND_MAX * -1, WIND_MAX), rand(WIND_MAX * -1, WIND_MAX)];
}


function drawBird(bird) {
    ctx.beginPath();
    ctx.arc(bird.position[0], bird.position[1], 2, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fillStyle = "green";
    ctx.fill();
}


function getCenterMassVector(bird, localBirds) {
    if(localBirds.length == 0) return [0, 0];

    let x = [];
    let y = [];
    localBirds.forEach(b => {
        x.push(b.position[0]);
        y.push(b.position[1]);
    });

    x = average(x);
    y = average(y);

    x -= bird.position[0];
    y -= bird.position[1];

    x *= (MOD_CENTER_MASS / 1000);
    y *= (MOD_CENTER_MASS / 1000);

    return [x, y];
}


function getNeighborRepelVector(bird, localBirds) {
    if(localBirds.length == 0) return [0, 0];

    let v = [0, 0];

    localBirds.forEach(b => {
        if(dist(bird.position, b.position) < BOID_REPEL_RADIUS) {
            v = vSubtract(v, vSubtract(b.position, bird.position));
        };
    });

    return v;
}


function getVelocityMatchVector(bird, localBirds) {
    if(localBirds.length == 0) return [0, 0];

    let v = [0, 0];

    localBirds.forEach(b => {
       v = vAdd(v, b.velocity);
    });

    v[0] /= localBirds.length;
    v[1] /= localBirds.length;

    v[0] *= (MOD_VEL_MATCH / 1000);
    v[1] *= (MOD_VEL_MATCH / 1000);

    return v;
}


function getCenterVector(bird) {
    let v = vSubtract([width / 2, height / 2], bird.position);

    v[0] *= (MOD_CENTER_TENDENCY / 1000);
    v[1] *= (MOD_CENTER_TENDENCY / 1000);

    return v;
}


function updateBird(bird) {
    // find all local birds
    let localBirds = [];
    birds.forEach(bird2 => {
        if((bird2 === bird)) return;
        if(dist(bird.position, bird2.position) < BOID_RADIUS) localBirds.push(bird2);
    });

    bird.velocity = vAdd(bird.velocity, getCenterMassVector(bird, localBirds));
    bird.velocity = vAdd(bird.velocity, getNeighborRepelVector(bird, localBirds));
    bird.velocity = vAdd(bird.velocity, getVelocityMatchVector(bird, localBirds));
    bird.velocity = vAdd(bird.velocity, wind);
    bird.velocity = vAdd(bird.velocity, getCenterVector(bird));

    // cap velocity
    if(mag(bird.velocity) > MAX_VELOCITY) {
        let v1 = (bird.velocity[0] / mag(bird.velocity)) * MAX_VELOCITY;
        let v2 = (bird.velocity[1] / mag(bird.velocity)) * MAX_VELOCITY;

        bird.velocity = [v1, v2];
    }

    if(mag(bird.velocity) > MAX_VELOCITY) {
        console.log(bird.velocity);
    }

    // move birds
    bird.position = vAdd(bird.position, bird.velocity);

    if(bird.position[0] < 0) {
        bird.position[0] = 0;
        bird.velocity[0] *= -1;
    }
    
    if(bird.position[0] > width) {
        bird.position[0] = width;
        bird.velocity[0] *= -1;
    }

    if(bird.position[1] < 0) {
        bird.position[1] = 0;
        bird.velocity[1] *= -1;
    }
    
    if(bird.position[1] > height) {
        bird.position[1] = height;
        bird.velocity[1] *= -1;
    }

    return bird;
}


function step() {
    let newBirds = [];

    birds.forEach(b => {
        newBirds.push(updateBird(b));
    });

    ctx.clearRect(0, 0, width, height);

    newBirds.forEach(b => {
        drawBird(b);
    });

    birds = newBirds;
}


window.addEventListener('load', () => {
    // generate initial birds
    for (let i = 0; i < 1000; i++) {
        birds.push({
            id: i,
            position: [randomX(), randomY()],
            velocity: [rand(-1, 1), rand(-1, 1)],
        });
    }

    setInterval(step, 32);
    setInterval(scatter, 15000);
});

/*
window.addEventListener('load', () => {
  const random255 = () => Math.floor(Math.random() * 255);
  const randomColor = () => `rgba(0,0,0,0.5`;
  const randomSide = () => (Math.random() * 1000) + 20;
  const randomRadius = () => (Math.random() * 50) + 20;

  const drawShapes = () => {
    for (let i = 0; i < 50; i += 1) {
      ctx.fillStyle = randomColor();
      ctx.fillRect(randomX(), randomY(), randomSide(), randomSide());
      ctx.fillStyle = randomColor();
      ctx.beginPath();
      ctx.arc(randomX(), randomY(), randomRadius(), 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.fill();
    }
  };

  canvas.addEventListener('click', drawShapes);

  canvas.addEventListener('dblclick', () => ctx.clearRect(0, 0, width, height));

  drawShapes();
});
*/
