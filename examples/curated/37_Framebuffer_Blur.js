/**
 * @name Blur using Framebuffer Depth
 * @description The
 * <a href="https://www.khronos.org/opengl/wiki/Shader" target="_blank">shader</a>
 * in this example uses depth information from a
 * < href="https://p5js.org/reference/#/p5.Framebuffer" target="_blank">p5.Framebuffer</a>
 * to apply a blur. On a real camera, objects appear blurred if they
 * are closer or farther than the lens' focus. This simulates that
 * effect. First, the sketch renders five spheres to the framebuffer.
 * Then, it renders the framebuffer to the canvas using the blur shader.
 */

// Vertex shader code
let vertexShader = `
precision highp float;
attribute vec3 aPosition;
attribute vec2 aTexCoord;
varying vec2 vTexCoord;
void main() {
  vec4 positionVec4 = vec4(aPosition, 1.0);
  positionVec4.xy = positionVec4.xy * 2.0 - 1.0;
  positionVec4.y *= -1.0;
  gl_Position = positionVec4;
  vTexCoord = aTexCoord;
}`;

// Fragment shader code
let fragmentShader = `
precision highp float;
varying vec2 vTexCoord;
uniform sampler2D img;
uniform sampler2D depth;
float getBlurriness(float d) {
  // Blur more the farther away we go from the
  // focal point at depth=0.9
  return abs(d - 0.9) * 40.;
}
float maxBlurDistance(float blurriness) {
  return blurriness * 0.01;
}
void main() {
  vec4 color = texture2D(img, vTexCoord);
  float samples = 1.;
  float centerDepth = texture2D(depth, vTexCoord).r;
  float blurriness = getBlurriness(centerDepth);
  for (int sample = 0; sample < 20; sample++) {
    // Sample nearby pixels in a spiral going out from the
    // current pixel
    float angle = float(sample);
    float distance = float(sample)/20.
      * maxBlurDistance(blurriness);
    vec2 offset = vec2(cos(angle), sin(angle)) * distance;

    // How close is the object at the nearby pixel?
    float sampleDepth = texture2D(depth, vTexCoord + offset).r;

    // How far should its blur reach?
    float sampleBlurDistance =
      maxBlurDistance(getBlurriness(sampleDepth));

    // If it's in front of the current pixel, or its blur overlaps
    // with the current pixel, add its color to the average
    if (
      sampleDepth >= centerDepth ||
      sampleBlurDistance >= distance
    ) {
      color += texture2D(img, vTexCoord + offset);
      samples++;
    }
  }
  color /= samples;
  gl_FragColor = color;
}`;

let layer;
let blur;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  angleMode(DEGREES);
  noStroke();

  // Create framebuffer and shader objects
  layer = createFramebuffer();
  blur = createShader(vertexShader, fragmentShader);

  describe(
    'A row of five spheres rotating in front of the camera. The closest and farthest spheres from the camera appear blurred.'
  );
}

function draw() {
  // Start drawing to framebuffer
  layer.begin();
  background(255);
  ambientLight(100);
  directionalLight(255, 255, 255, -1, 1, -1);
  ambientMaterial(255, 0, 0);
  fill(255, 255, 100);
  specularMaterial(255);
  shininess(150);

  // Rotate 1° per frame
  rotateY(frameCount);

  // Place 5 spheres across canvas at equal distance
  let sphereDistance = width / 4;
  for (let x = -width / 2; x <= width / 2; x += sphereDistance) {
    push();
    translate(x, 0, 0);
    sphere();
    pop();
  }

  // Stop drawing to framebuffer
  layer.end();

  // Pass color and depth information from the framebuffer
  //  to the shader's uniforms
  blur.setUniform('img', layer.color);
  blur.setUniform('depth', layer.depth);

  // Render the scene captured by framebuffer with depth of field blur
  shader(blur);
  rect(0, 0, width, height);
}
