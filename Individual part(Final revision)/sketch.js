// Define global variables
var img, img2, img3, img4, img5; // Image variables
var WIDTH, HEIGHT; // Canvas width and height
var pixelSize = 10; // Size of the pixel blocks
var waveEffect; // Instance of the wave effect
var img5Pixelation; // Instance of the pixelation effect for the fifth image
var img2Movable, img3Movable, img4Movable; // Instances of the movable images
var bgSound; // Background sound
var audioPlayed = false; // Variable to track if audio has been played
var waveEffectEnabled = false; // Variable to track if wave effect is enabled
var rainEnabled = false; // Variable to track if rain effect is enabled

// Initialize raindrops array and constants
var rainDrops = []; // Array to store raindrop objects
var numRainDrops = 50; // Number of raindrops
var maxDropSize = 15; // Maximum size of raindrops
var minDropSize = 10; // Minimum size of raindrops
var maxDropSpeed = 15; // Maximum speed of raindrops
var minDropSpeed = 10; // Minimum speed of raindrops

var clickText = "Click"; // Text to display on click
var clickTextVisible = true; // Variable to track if click text is visible

// Preload images
function preload() {
  img = loadImage("assets/painting.jpg");
  img2 = loadImage("assets/gull1.png");
  img3 = loadImage("assets/gull2.png");
  img4 = loadImage("assets/boat.png");
  img5 = loadImage("assets/sunset.png");
  bgSound = loadSound("assets/sleepy-rain-116521.mp3");
}

// Setup canvas and initialize instances
function setup() {
  WIDTH = img.width; // Get the width of the first image
  HEIGHT = img.height; // Get the height of the first image
  var canvas = createCanvas(WIDTH, HEIGHT); // Create the canvas
  canvas.mousePressed(startAudio); // Call startAudio() when canvas is clicked
  imageMode(CENTER); // Set image mode to center
  noStroke(); // Disable stroke
  background(255); // Set background color to white
  textAlign(CENTER, CENTER); // Set text alignment to center

  // Initialize the wave effect instance
  waveEffect = new WaveEffect(img, pixelSize);
  // Initialize the pixelation effect instance for the fifth image
  img5Pixelation = new ImagePixelation(img5, pixelSize);
  // Initialize the movable image instances
  img2Movable = new MovableImage(img2, WIDTH / 2, HEIGHT / 4, 1, 0.5, 0.5, 0.5);
  img3Movable = new MovableImage(img3, WIDTH / 1.25, HEIGHT / 4, -1, 0.5, 0.5, 0.5);
  img4Movable = new MovableImage(img4, WIDTH / 1.5, HEIGHT * 3 / 4, 1, 1, 0.5, 0.5);
  
  // Initialize raindrops
  for (var i = 0; i < numRainDrops; i++) {
    var x = random(width); // Random x-coordinate within canvas width
    var y = random(-height, 0); // Random y-coordinate above canvas
    var size = random(minDropSize, maxDropSize); // Random size
    var speed = random(minDropSpeed, maxDropSpeed); // Random speed
    rainDrops.push(new RainDrop(x, y, size, speed)); // Create raindrop object and add to array
  }
}

// Draw function
function draw() {
  // Display click text if visible
  if (clickTextVisible) {
    fill(0); // Set text color to black
    textSize(32); // Set text size
    text(clickText, width / 2, height / 2); // Display click text at center
  }
  // If the wave effect hasn't started, draw the initial wave
  if (!waveEffectEnabled) {
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
  rect(0, 0, WIDTH, 30); // Top
  rect(0, HEIGHT - 30, WIDTH, 30); // Bottom
  rect(0, 0, 30, HEIGHT); // Left
  rect(WIDTH - 30, 0, 30, HEIGHT); // Right

  if (audioPlayed) {
    img2Movable.updatePosition(WIDTH / 2);
    img3Movable.updatePosition(WIDTH / 1.25);
    img4Movable.updatePosition(WIDTH / 1.5);
  }

  // Draw raindrops if rain effect is enabled
  if (rainEnabled) {
    for (var i = 0; i < rainDrops.length; i++) {
      rainDrops[i].fall(); // Make raindrop fall
      rainDrops[i].display(); // Display raindrop
    }
  }
}
// Function to handle mouse click event
function mouseClicked() {
  // Hide click text when clicked
  clickTextVisible = false;
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

// Fisher-Yates Shuffle algorithm to shuffle an array, this technique was not covered in class(this technique is from https://www.tutorialspoint.com/data_structures_algorithms/dsa_fisher_yates_shuffle_algorithm.htm)
function shuffle(array, shouldShuffle) {
  // If shouldShuffle is false, return the original array without shuffling
  if (!shouldShuffle) return array;
  // Start from the last element and iterate backwards
  for (let i = array.length - 1; i > 0; i--) {
    // Generate a random integer j between 0 and i
    const j = Math.floor(Math.random() * (i + 1));
    // Swap array[i] and array[j]
    [array[i], array[j]] = [array[j], array[i]];
  }
  // Return the shuffled array
  return array;
}

// ImagePixelation class to handle the pixelated drawing of the painting
class ImagePixelation {
  constructor(img, pixelSize) {
    this.img = img; // Image to be processed
    this.pixelSize = pixelSize; // Size of the pixel blocks
  }

  // Draw a pixelated image
  drawPixelatedImage(x, y, scale) {
    let scaledWidth = this.img.width * scale; // Scaled width
    let scaledHeight = this.img.height * scale; // Scaled height
    this.img.loadPixels(); // Load the image pixels
    for (let py = 0; py < scaledHeight; py += this.pixelSize) {
      for (let px = 0; px < scaledWidth; px += this.pixelSize) {
        const imgColor = this.img.get(px / scale, py / scale); // Get the color of the pixel
        fill(imgColor); // Set the fill color
        rect(px + x - scaledWidth / 2, py + y - scaledHeight / 2, this.pixelSize, this.pixelSize); // Draw the pixel block
      }
    }
  }
}

// MovableImage class to handle the position and movement of an image
class MovableImage {
  constructor(img, x, y, direction, speed, widthScale, heightScale) {
    this.img = img; // Image to be processed
    this.x = x; // Initial x-coordinate
    this.y = y; // Initial y-coordinate
    this.direction = direction; // Movement direction
    this.speed = speed; // Movement speed
    this.width = img.width * widthScale; // Scaled width
    this.height = img.height * heightScale; // Scaled height
  }

  // Update the image position
  updatePosition(limitX) {
    if (this.moveEnabled) {
      this.x += this.direction * this.speed; // Update the x-coordinate based on direction and speed
      if (this.x > limitX + 50 || this.x < limitX - 50) { // If out of the limit range
        this.direction *= -1; // Reverse direction
      }
    }
  }

  // Draw the image
  draw() {
    image(this.img, this.x, this.y, this.width, this.height); // Draw the image
  }

  // Enable movement
  enableMovement() {
    this.moveEnabled = true;
  }

  // Disable movement
  disableMovement() {
    this.moveEnabled = false;
  }
}

// WaveEffect class to handle the wave effect
class WaveEffect {
  constructor(img, pixelSize) {
    this.img = img; // Image to be processed
    this.pixelSize = pixelSize; // Size of the pixel blocks
    this.pixelsToDraw = []; // Array of pixels to be drawn
    this.totalPixels = 0; // Total number of pixels
    this.drawnPixels = 0; // Number of pixels drawn
    this.startWave = false; // Whether the wave effect has started

    this.initializePixels(); // Initialize the pixels
  }

  // Initialize the pixels
  initializePixels() {
    for (let y = 0; y < this.img.height; y += this.pixelSize) {
      for (let x = 0; x < this.img.width; x += this.pixelSize) {
        const frequency = random(0.1, 0.2); // Random frequency
        const amplitude = 20 + (x % this.pixelSize) * 10; // Amplitude
        const oy = random(-30, 30); // Pixel offset
        this.pixelsToDraw.push({x: x, y: y, frequency: frequency, offset: 0, amplitude: amplitude, oy: oy}); // Add pixel to array
      }
    }
    shuffle(this.pixelsToDraw, true); // Shuffle the pixel array
    this.totalPixels = this.pixelsToDraw.length; // Set the total number of pixels
  }

  // Draw the initial wave
  drawInitialWave() {
    for (let i = 0; i < 100; i++) { // Draw 100 pixel blocks per frame
      if (this.drawnPixels >= this.totalPixels) { // If all pixel blocks are drawn
        break;
      }
      let pixel = this.pixelsToDraw[this.drawnPixels]; // Get the current pixel
      let pix = this.img.get(pixel.x, pixel.y); // Get the color of the pixel
      fill(pix); // Set the fill color
      rect(pixel.x, pixel.y, this.pixelSize, this.pixelSize); // Draw the pixel block
      this.drawnPixels++; // Update the number of pixels drawn
    }
  }

  // Draw the wave effect
  drawWave() {
    background(255); // Set the background color to white
    for (let i = 0; i < this.pixelsToDraw.length; i++) {
      let pixel = this.pixelsToDraw[i]; // Get the current pixel
      let pix = this.img.get(pixel.x, pixel.y); // Get the color of the pixel
      fill(pix); // Set the fill color
      if (pixel.y > 400 + pixel.oy) { // If the pixel position exceeds the specified range
        let waveHeight = map(noise(pixel.offset), 0, 1, -pixel.amplitude, pixel.amplitude); // Calculate the wave height
        rect(pixel.x, pixel.y, this.pixelSize, this.pixelSize); // Draw the original position pixel block
        rect(pixel.x, pixel.y + waveHeight, this.pixelSize, this.pixelSize); // Draw the pixel block after the wave
        pixel.offset += pixel.frequency; // Update the offset
      } else {
        rect(pixel.x, pixel.y, this.pixelSize, this.pixelSize); // Draw the original position pixel block
      }
    }
  }
}

// Function to start audio and enable effects
function startAudio() {
  if (!audioPlayed) {
    bgSound.loop();
    audioPlayed = true;
    waveEffectEnabled = true;
    rainEnabled = true; // Enable rain effect
    // enable image movement
    img2Movable.enableMovement();
    img3Movable.enableMovement();
    img4Movable.enableMovement();
  }
}

// RainDrop class
class RainDrop {
  constructor(x, y, size, speed) {
    this.x = x; // x-coordinate
    this.y = y; // y-coordinate
    this.size = size; // Size of raindrop
    this.speed = speed; // Speed of raindrop
  }

  // Function to make raindrop fall
  fall() {
    this.y += this.speed; // Move raindrop down by its speed
    // If raindrop goes below canvas, reset its position to the top
    if (this.y + 70 > height  - this.size / 3) {
      this.y = random(-height, 0);
      this.x = random(width);
    }
  }

  // Function to display raindrop
  display() {
    // Set raindrop color and size
    fill(255, 100); 
    ellipse(this.x, this.y, this.size / 3, this.size * 2); // Draw raindrop
  }
}












