// Define global variables
var img, img2, img3, img4, img5; // Image variables
var WIDTH, HEIGHT; // Canvas width and height
var pixelSize = 10; // Size of the pixel blocks
var waveEffect; // Instance of the wave effect
var img5Pixelation; // Instance of the pixelation effect for the fifth image
var img2Movable, img3Movable, img4Movable; // Instances of the movable images

// Preload images
function preload() {
  img = loadImage("assets/painting.jpg");
  img2 = loadImage("assets/gull1.png");
  img3 = loadImage("assets/gull2.png");
  img4 = loadImage("assets/boat.png");
  img5 = loadImage("assets/sunset.png");
}

// Setup canvas and initialize instances
function setup() {
  WIDTH = img.width; // Get the width of the first image
  HEIGHT = img.height; // Get the height of the first image
  createCanvas(WIDTH, HEIGHT); // Create the canvas
  imageMode(CENTER); // Set image mode to center
  noStroke(); // Disable stroke
  background(255); // Set background color to white

  // Initialize the wave effect instance
  waveEffect = new WaveEffect(img, pixelSize);
  // Initialize the pixelation effect instance for the fifth image
  img5Pixelation = new ImagePixelation(img5, pixelSize);
  // Initialize the movable image instances
  img2Movable = new MovableImage(img2, WIDTH / 2, HEIGHT / 4, 1, 0.5, 0.5, 0.5);
  img3Movable = new MovableImage(img3, WIDTH / 1.25, HEIGHT / 4, -1, 0.5, 0.5, 0.5);
  img4Movable = new MovableImage(img4, WIDTH / 1.5, HEIGHT * 3 / 4, 1, 1, 0.5, 0.5);
}

// Draw function
function draw() {

  // If the wave effect hasn't started, draw the initial wave
  if (!waveEffect.startWave) {
    waveEffect.drawInitialWave();
  } else {
    // If the wave effect has started, draw the wave effect
    waveEffect.drawWave();
  }

  // Update the position of each movable image
  img2Movable.updatePosition(WIDTH / 2);
  img3Movable.updatePosition(WIDTH / 1.25);
  img4Movable.updatePosition(WIDTH / 1.5);

  // Draw each movable image
  img2Movable.draw();
  img3Movable.draw();
  fill(0, 100); // Set shadow to semi-transparent black
  ellipse(img4Movable.x, img4Movable.y + img4Movable.height * 0.07, img4Movable.width, img4Movable.height * 0.1); // Draw elliptical shadow
  img4Movable.draw();

  // Draw the pixelation effect for the fifth image
  img5Pixelation.drawPixelatedImage(WIDTH * 0.65, HEIGHT * 0.42, 0.5);

  // Apply black and white filter to the entire canvas
  applyBlackAndWhiteFilter();

  // Draw black rectangles on all four sides
  fill(0); // Set fill color to black
  rect(0, 0, WIDTH, 50); // Top
  rect(0, HEIGHT - 50, WIDTH, 50); // Bottom
  rect(0, 0, 50, HEIGHT); // Left
  rect(WIDTH - 50, 0, 50, HEIGHT); // Right
}

// Apply black and white filter to the entire canvas
function applyBlackAndWhiteFilter() {
  loadPixels(); // Load the pixel data for the canvas
  for (let i = 0; i < pixels.length; i += 4) { // Iterate through every pixel (4 values per pixel: R, G, B, and A)
    let avg = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3; // Calculate the average value of R, G, and B components
    pixels[i] = avg; // Set R component to the average
    pixels[i + 1] = avg; // Set G component to the average
    pixels[i + 2] = avg; // Set B component to the average
  }
  updatePixels(); // Update the canvas with the modified pixel data
}

// Fisher-Yates Shuffle algorithm to shuffle an array
function shuffle(array, shouldShuffle) {
  if (!shouldShuffle) return array;
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// ImagePixelation class to handle the pixelated drawing of the painting
class ImagePixelation {
  constructor(img, pixelSize) {
    this.img = img;
    this.pixelSize = pixelSize;
  }

  drawPixelatedImage(x, y, scale) {
    let scaledWidth = this.img.width * scale;
    let scaledHeight = this.img.height * scale;
    this.img.loadPixels();
    for (let py = 0; py < scaledHeight; py += this.pixelSize) {
      for (let px = 0; px < scaledWidth; px += this.pixelSize) {
        const imgColor = this.img.get(px / scale, py / scale);
        fill(imgColor);
        rect(px + x - scaledWidth / 2, py + y - scaledHeight / 2, this.pixelSize, this.pixelSize);
      }
    }
  }
}

// MovableImage class to handle the position and movement of an image
class MovableImage {
  constructor(img, x, y, direction, speed, widthScale, heightScale) {
    this.img = img;
    this.x = x;
    this.y = y;
    this.direction = direction;
    this.speed = speed;
    this.width = img.width * widthScale;
    this.height = img.height * heightScale;
  }

  updatePosition(limitX) {
    this.x += this.direction * this.speed;
    if (this.x > limitX + 50 || this.x < limitX - 50) {
      this.direction *= -1;
    }
  }

  draw() {
    image(this.img, this.x, this.y, this.width, this.height);
  }
}

// WaveEffect class to handle the wave effect
class WaveEffect {
  constructor(img, pixelSize) {
    this.img = img;
    this.pixelSize = pixelSize;
    this.pixelsToDraw = [];
    this.totalPixels = 0;
    this.drawnPixels = 0;
    this.startWave = false;

    this.initializePixels();
  }

  initializePixels() {
    for (let y = 0; y < this.img.height; y += this.pixelSize) {
      for (let x = 0; x < this.img.width; x += this.pixelSize) {
        const frequency = random(0.01, 0.05);
        const amplitude = 20 + (x % this.pixelSize) * 10;
        const oy = random(-30, 30);
        this.pixelsToDraw.push({x: x, y: y, frequency: frequency, offset: 0, amplitude: amplitude, oy: oy});
      }
    }
    shuffle(this.pixelsToDraw, true);
    this.totalPixels = this.pixelsToDraw.length;
  }

  drawInitialWave() {
    for (let i = 0; i < 100; i++) {
      if (this.drawnPixels >= this.totalPixels) {
        this.startWave = true;
        break;
      }
      let pixel = this.pixelsToDraw[this.drawnPixels];
      let pix = this.img.get(pixel.x, pixel.y);
      fill(pix);
      rect(pixel.x, pixel.y, this.pixelSize, this.pixelSize);
      this.drawnPixels++;
    }
  }

  drawWave() {
    background(255);
    for (let i = 0; i < this.pixelsToDraw.length; i++) {
      let pixel = this.pixelsToDraw[i];
      let pix = this.img.get(pixel.x, pixel.y);
      fill(pix);
      if (pixel.y > 400 + pixel.oy) {
        let waveHeight = map(noise(pixel.offset), 0, 1, -pixel.amplitude, pixel.amplitude);
        rect(pixel.x, pixel.y, this.pixelSize, this.pixelSize);
        rect(pixel.x, pixel.y + waveHeight, this.pixelSize, this.pixelSize);
        pixel.offset += pixel.frequency;
      } else {
        rect(pixel.x, pixel.y, this.pixelSize, this.pixelSize);
      }
    }
  }
}












