const canvas = document.querySelector('canvas');
canvas.width = document.body.clientWidth; //document.width is obsolete
canvas.height = document.body.clientHeight; //document.height is obsolete


const ctx = canvas.getContext('2d');
const width = canvas.width;
const height = canvas.height;
const depth = 100;
const randomX = () => (Math.random() * width);
const randomY = () => (Math.random() * height);
const randomZ = () => (Math.random() * depth);
const average = (array) => array.reduce((a, b) => a + b) / array.length;
const dist = (from, to) => Math.sqrt(Math.pow(from[0] - to[0], 2) + Math.pow(from[1] - to[1], 2) + Math.pow(from[2] - to[2], 2));
const vSubtract = (v1, v2) => [v1[0] - v2[0], v1[1] - v2[1], v1[2] - v2[2]];
const vAdd = (v1, v2) => [v1[0] + v2[0], v1[1] + v2[1], v1[2] + v2[2]];
const mag = (v) => Math.sqrt(Math.pow(v[0], 2) + Math.pow(v[1], 2) + Math.pow(v[2], 2));
const rand = (min, max) => Math.random() * (max - min) + min;


var BOID_RADIUS = 40;
const BOID_REPEL_RADIUS = 20;
const MOD_CENTER_MASS = 15;
const MOD_VEL_MATCH = 1000;
const MAX_VELOCITY = 5;
const WIND_MAX = 0;
var MOD_CENTER_TENDENCY = 0;


/*
boid:
    position: v3
    velocity: v3
 */
let birds = [];
let wind = [0, 0];


function scatter() {
    if(BOID_RADIUS == 40) {
        BOID_RADIUS = 30;
    } else {
        BOID_RADIUS = 40;
    }
}


function drawBird(bird) {
    ctx.beginPath();
    ctx.arc(bird.position[0], bird.position[1], (bird.position[2] / depth) + 1, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fillStyle = "green";
    ctx.fill();
}


function getCenterMassVector(bird, localBirds) {
    if(localBirds.length == 0) return [0, 0, 0];

    let x = [];
    let y = [];
    let z = [];
    localBirds.forEach(b => {
        x.push(b.position[0]);
        y.push(b.position[1]);
        z.push(b.position[2]);
    });

    x = average(x);
    y = average(y);
    z = average(z);

    x -= bird.position[0];
    y -= bird.position[1];
    z -= bird.position[2];

    x *= (MOD_CENTER_MASS / 1000);
    y *= (MOD_CENTER_MASS / 1000);
    z *= (MOD_CENTER_MASS / 1000);

    return [x, y, z];
}


function getNeighborRepelVector(bird, localBirds) {
    if(localBirds.length == 0) return [0, 0, 0];

    let v = [0, 0, 0];

    localBirds.forEach(b => {
        if(dist(bird.position, b.position) < BOID_REPEL_RADIUS) {
            v = vSubtract(v, vSubtract(b.position, bird.position));
        };
    });

    return v;
}


function getVelocityMatchVector(bird, localBirds) {
    if(localBirds.length == 0) return [0, 0, 0];

    let v = [0, 0, 0];

    localBirds.forEach(b => {
       v = vAdd(v, b.velocity);
    });

    v[0] /= localBirds.length;
    v[1] /= localBirds.length;
    v[2] /= localBirds.length;

    v[0] *= (MOD_VEL_MATCH / 1000);
    v[1] *= (MOD_VEL_MATCH / 1000);
    v[2] *= (MOD_VEL_MATCH / 1000);

    return v;
}


function getCenterVector(bird) {
    let v = vSubtract([width / 2, height / 2, depth / 2], bird.position);

    v[0] *= (MOD_CENTER_TENDENCY / 1000);
    v[1] *= (MOD_CENTER_TENDENCY / 1000);
    v[2] *= (MOD_CENTER_TENDENCY / 1000);

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
    bird.velocity = vAdd(bird.velocity, getCenterVector(bird));

    // cap velocity
    if(mag(bird.velocity) > MAX_VELOCITY) {
        let v1 = (bird.velocity[0] / mag(bird.velocity)) * MAX_VELOCITY;
        let v2 = (bird.velocity[1] / mag(bird.velocity)) * MAX_VELOCITY;
        let v3 = (bird.velocity[2] / mag(bird.velocity)) * MAX_VELOCITY;

        bird.velocity = [v1, v2, v3];
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

    if(bird.position[2] < 0) {
        bird.position[2] = 0;
        bird.velocity[2] *= -1;
    }
    
    if(bird.position[2] > depth) {
        bird.position[2] = depth;
        bird.velocity[2] *= -1;
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
            position: [randomX(), randomY(), randomZ()],
            velocity: [rand(-1, 1), rand(-1, 1), rand(-1, 1)],
        });
    }

    setInterval(step, 32);
    setInterval(scatter, 15000);
});
