import RAPIER from './vendor/rapier2d.mjs';

const canvas = document.querySelector('#pinball');
const ctx = canvas.getContext('2d');
const scoreEl = document.querySelector('#score');
const bestEl = document.querySelector('#best');
const ballsEl = document.querySelector('#balls');
const statusEl = document.querySelector('#status');
const launchMeter = document.querySelector('#launchMeter');
const startButton = document.querySelector('#startButton');
const loading = document.querySelector('#loading');
const W = canvas.width;
const H = canvas.height;
const image = new Image();
image.src = 'temple-playfield.png';

let world;
let eventQueue;
let ball;
let ballCollider;
let leftFlipper;
let rightFlipper;
let score = 0;
let balls = 3;
let running = false;
let readyToLaunch = false;
let leftPressed = false;
let rightPressed = false;
let charging = false;
let chargeStarted = 0;
let launchPower = 0;
let lastTime = 0;
let accumulator = 0;
let resetTimer = 0;
let best = Number(localStorage.getItem('templeQuestBest') || 0);
const bumperByHandle = new Map();
const bumperFlash = new Map();

const bumpers = [
  { x: 272, y: 285, r: 38, points: 300 },
  { x: 445, y: 360, r: 43, points: 500 },
  { x: 582, y: 310, r: 39, points: 300 },
  { x: 190, y: 740, r: 30, points: 250 },
  { x: 455, y: 895, r: 82, points: 750 }
];

function fixedSegment(x1, y1, x2, y2, thickness = 12, restitution = .58) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const body = world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation((x1 + x2) / 2, (y1 + y2) / 2).setRotation(Math.atan2(dy, dx)));
  return world.createCollider(RAPIER.ColliderDesc.cuboid(Math.hypot(dx, dy) / 2, thickness / 2).setRestitution(restitution).setFriction(.12), body);
}

function buildTable() {
  const walls = [
    [112, 92, 75, 1260, 18], [75, 1260, 255, 1450, 18],
    [788, 88, 882, 1410, 18], [882, 1410, 650, 1465, 18],
    [112, 92, 300, 52, 15], [300, 52, 610, 54, 15], [610, 54, 788, 88, 15],
    [108, 1110, 278, 1240, 13], [792, 1120, 620, 1240, 13],
    [113, 1040, 225, 1165, 10], [784, 1040, 672, 1165, 10],
    [812, 235, 812, 1290, 11], [882, 180, 882, 1370, 11],
    [125, 630, 195, 715, 10], [680, 570, 742, 675, 10],
    [155, 420, 210, 515, 10], [650, 405, 710, 515, 10]
  ];
  walls.forEach(args => fixedSegment(...args));

  bumpers.forEach(data => {
    const body = world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(data.x, data.y));
    const collider = world.createCollider(
      RAPIER.ColliderDesc.ball(data.r).setRestitution(1.25).setFriction(0).setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS),
      body
    );
    bumperByHandle.set(collider.handle, data);
  });

  leftFlipper = createFlipper(330, 1302, .32);
  rightFlipper = createFlipper(570, 1302, -.32);
}

function createFlipper(x, y, angle) {
  const body = world.createRigidBody(RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(x, y).setRotation(angle));
  world.createCollider(RAPIER.ColliderDesc.cuboid(91, 15).setRestitution(.55).setFriction(.2), body);
  return { body, x, y, angle, current: angle };
}

function createBall() {
  if (ball) world.removeRigidBody(ball);
  ball = world.createRigidBody(
    RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(848, 1305)
  );
  ballCollider = world.createCollider(
    RAPIER.ColliderDesc.ball(15).setDensity(.002).setRestitution(.62).setFriction(.08).setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS),
    ball
  );
  readyToLaunch = true;
  charging = false;
  launchPower = 0;
  updateLaunchMeter();
  statusEl.textContent = 'Hold Space or Launch. Release to fire.';
}

function beginCharge() {
  if (!running || !readyToLaunch || !ball || charging) return;
  charging = true;
  chargeStarted = performance.now();
  launchPower = 0;
  statusEl.textContent = 'Charging the spring…';
  tone(105, .04, 'triangle', .018);
}

function releaseCharge() {
  if (!charging) return;
  charging = false;
  launchPower = Math.max(.12, Math.min(1, (performance.now() - chargeStarted) / 1400));
  launch(launchPower);
}

function launch(power) {
  if (!running || !readyToLaunch || !ball) return;
  readyToLaunch = false;
  const speed = 690 + power * 760;
  ball.setBodyType(RAPIER.RigidBodyType.Dynamic, true);
  ball.setLinearDamping(.08);
  ball.setAngularDamping(.15);
  ball.enableCcd(true);
  ball.setLinvel({ x: -22 - power * 25, y: -speed }, true);
  statusEl.textContent = `Launch power · ${Math.round(power * 100)}%`;
  tone(150 + power * 120, .07, 'triangle', .028);
  window.setTimeout(() => { launchPower = 0; updateLaunchMeter(); }, 350);
}

function updateLaunchMeter() {
  launchMeter.style.width = `${Math.round(launchPower * 100)}%`;
}

function startGame() {
  score = 0;
  balls = 3;
  running = true;
  resetTimer = 0;
  updateHud();
  createBall();
  startButton.textContent = 'Restart expedition';
}

function loseBall() {
  if (!running || resetTimer) return;
  balls -= 1;
  readyToLaunch = false;
  charging = false;
  launchPower = 0;
  updateLaunchMeter();
  updateHud();
  tone(95, .2, 'sine', .035);
  if (balls <= 0) {
    running = false;
    if (score > best) {
      best = score;
      localStorage.setItem('templeQuestBest', String(best));
    }
    updateHud();
    statusEl.textContent = `Expedition complete · ${score.toLocaleString()} points`;
    startButton.textContent = 'Play again';
    return;
  }
  statusEl.textContent = 'Ball lost. Ready the next one…';
  resetTimer = window.setTimeout(() => { resetTimer = 0; createBall(); }, 900);
}

function updateFlippers(dt) {
  const speed = Math.min(1, dt * 16);
  const leftTarget = leftPressed ? -.38 : .32;
  const rightTarget = rightPressed ? .38 : -.32;
  leftFlipper.current += (leftTarget - leftFlipper.current) * speed;
  rightFlipper.current += (rightTarget - rightFlipper.current) * speed;
  leftFlipper.body.setNextKinematicTranslation({ x: leftFlipper.x, y: leftFlipper.y });
  rightFlipper.body.setNextKinematicTranslation({ x: rightFlipper.x, y: rightFlipper.y });
  leftFlipper.body.setNextKinematicRotation(leftFlipper.current);
  rightFlipper.body.setNextKinematicRotation(rightFlipper.current);
}

function processCollisions() {
  eventQueue.drainCollisionEvents((h1, h2, started) => {
    if (!started || !ballCollider || (h1 !== ballCollider.handle && h2 !== ballCollider.handle)) return;
    const other = h1 === ballCollider.handle ? h2 : h1;
    const bumper = bumperByHandle.get(other);
    if (!bumper) return;
    const pos = ball.translation();
    const dx = pos.x - bumper.x;
    const dy = pos.y - bumper.y;
    const length = Math.hypot(dx, dy) || 1;
    ball.applyImpulse({ x: dx / length * 245, y: dy / length * 245 }, true);
    score += bumper.points;
    bumperFlash.set(bumper, performance.now() + 150);
    updateHud();
    tone(260 + bumper.points * .35, .055, 'sine', .026);
  });
}

function updateHud() {
  scoreEl.textContent = String(score).padStart(6, '0');
  bestEl.textContent = String(Math.max(best, score)).padStart(6, '0');
  ballsEl.textContent = Array.from({ length: 3 }, (_, i) => i < balls ? '●' : '○').join(' ');
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  if (image.complete) ctx.drawImage(image, 0, 0, W, H);
  ctx.fillStyle = 'rgba(2,8,4,.08)';
  ctx.fillRect(0, 0, W, H);

  const now = performance.now();
  bumpers.forEach(bumper => {
    if ((bumperFlash.get(bumper) || 0) < now) return;
    const glow = ctx.createRadialGradient(bumper.x, bumper.y, 4, bumper.x, bumper.y, bumper.r * 1.65);
    glow.addColorStop(0, 'rgba(255,248,151,.95)');
    glow.addColorStop(.45, 'rgba(255,176,29,.55)');
    glow.addColorStop(1, 'rgba(255,79,20,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(bumper.x, bumper.y, bumper.r * 1.65, 0, Math.PI * 2);
    ctx.fill();
  });

  drawPlunger();
  drawFlipper(leftFlipper, false);
  drawFlipper(rightFlipper, true);
  if (ball) drawBall(ball.translation());
}

function drawPlunger() {
  const x = 848;
  const handleY = 1378 + launchPower * 62;
  ctx.save();
  ctx.strokeStyle = '#e5a62a';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x, 1332);
  for (let i = 0; i <= 10; i += 1) {
    const y = 1340 + (handleY - 1340) * (i / 10);
    ctx.lineTo(x + (i % 2 ? 9 : -9), y);
  }
  ctx.stroke();
  ctx.fillStyle = '#b9341e';
  ctx.strokeStyle = '#f1c35a';
  ctx.lineWidth = 3;
  roundRect(ctx, x - 25, handleY, 50, 17, 7);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawFlipper(flipper, mirrored) {
  ctx.save();
  ctx.translate(flipper.x, flipper.y);
  ctx.rotate(flipper.current);
  const gradient = ctx.createLinearGradient(0, -15, 0, 15);
  gradient.addColorStop(0, '#fff3bf');
  gradient.addColorStop(1, '#d7b768');
  ctx.fillStyle = gradient;
  ctx.strokeStyle = '#bb241b';
  ctx.lineWidth = 8;
  roundRect(ctx, -91, -15, 182, 30, 15);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#e94b2d';
  ctx.beginPath();
  ctx.arc(mirrored ? 78 : -78, 0, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function roundRect(context, x, y, width, height, radius) {
  context.beginPath();
  context.roundRect(x, y, width, height, radius);
}

function drawBall(pos) {
  const gradient = ctx.createRadialGradient(pos.x - 6, pos.y - 8, 2, pos.x, pos.y, 17);
  gradient.addColorStop(0, '#fff');
  gradient.addColorStop(.25, '#bcc8c8');
  gradient.addColorStop(.7, '#596366');
  gradient.addColorStop(1, '#111719');
  ctx.fillStyle = gradient;
  ctx.strokeStyle = '#f5dc94';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}

function frame(time) {
  const elapsed = Math.min((time - lastTime) / 1000 || 0, .05);
  lastTime = time;
  if (charging) {
    launchPower = Math.min(1, (time - chargeStarted) / 1400);
    updateLaunchMeter();
    statusEl.textContent = `Spring loaded · ${Math.round(launchPower * 100)}%`;
  }
  accumulator += elapsed;
  while (accumulator >= 1 / 60) {
    updateFlippers(1 / 60);
    world.timestep = 1 / 60;
    world.step(eventQueue);
    processCollisions();
    accumulator -= 1 / 60;
  }
  if (running && ball) {
    const pos = ball.translation();
    if (pos.y > 1535 || pos.x < 25 || pos.x > 875) loseBall();
  }
  draw();
  requestAnimationFrame(frame);
}

let audioContext;
function tone(frequency, duration, type, volume) {
  audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
  if (audioContext.state === 'suspended') audioContext.resume();
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(volume, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(.0001, audioContext.currentTime + duration);
  oscillator.connect(gain).connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + duration);
}

function setControl(control, value) {
  if (control === 'left') leftPressed = value;
  if (control === 'right') rightPressed = value;
}

window.addEventListener('keydown', event => {
  if (['ArrowLeft', 'ArrowRight', 'Space'].includes(event.code)) event.preventDefault();
  if (event.code === 'ArrowLeft' || event.code === 'KeyA') setControl('left', true);
  if (event.code === 'ArrowRight' || event.code === 'KeyD') setControl('right', true);
  if (event.code === 'Space' && !event.repeat) beginCharge();
});
window.addEventListener('keyup', event => {
  if (event.code === 'ArrowLeft' || event.code === 'KeyA') setControl('left', false);
  if (event.code === 'ArrowRight' || event.code === 'KeyD') setControl('right', false);
  if (event.code === 'Space') releaseCharge();
});
window.addEventListener('blur', () => {
  leftPressed = false;
  rightPressed = false;
  releaseCharge();
});

function bindHold(id, control) {
  const element = document.querySelector(id);
  element.addEventListener('pointerdown', event => { event.preventDefault(); element.setPointerCapture(event.pointerId); setControl(control, true); });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(type => element.addEventListener(type, () => setControl(control, false)));
}

bindHold('#leftControl', 'left');
bindHold('#rightControl', 'right');
const launchControl = document.querySelector('#launchControl');
launchControl.addEventListener('pointerdown', event => {
  event.preventDefault();
  launchControl.setPointerCapture(event.pointerId);
  beginCharge();
});
['pointerup', 'pointercancel', 'lostpointercapture'].forEach(type => launchControl.addEventListener(type, releaseCharge));
startButton.addEventListener('click', startGame);

await RAPIER.init();
world = new RAPIER.World({ x: 0, y: 760 });
eventQueue = new RAPIER.EventQueue(true);
buildTable();
updateHud();
startButton.disabled = false;
statusEl.textContent = 'The temple is ready.';
loading.classList.add('hidden');
requestAnimationFrame(frame);
