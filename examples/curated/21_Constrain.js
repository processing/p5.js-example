/**
 * @name Constrain
 * @description This example draws a circle as the mouse position but
 * keeps the circle within a rectangle. It does so by passing the
 * mouse's coordinates into the
 * <a href="https://p5js.org/reference/#/p5/constrain" target="_blank">constrain()</a>
 * function.
 */

// Circle's radius
let radius = 24;

// Distance between edge of rectangle and edge of canvas
let edge = 100;

// Distance between center of circle and edge of canvas
//  when circle is at edge of rectangle
let inner = edge + radius;

function setup() {
  createCanvas(720, 400);
  noStroke();

  // Use radius mode to pass in radius as 3rd parameter for circle()
  ellipseMode(RADIUS);

  // Use corners mode to pass in rectangle corner coordinates
  rectMode(CORNERS);

  describe(
    'Pink rectangle on a grey background. A user uses their mouse to move a white circle within the pink rectangle.'
  );
}

function draw() {
  background(230);

  // Draw rectangle
  fill(237, 34, 93);
  rect(edge, edge, width - edge, height - edge);

  // Calculate circle coordinates constrained to rectangle
  let circleX = constrain(mouseX, inner, width - inner);
  let circleY = constrain(mouseY, inner, height - inner);

  // Draw circle
  fill(255);
  circle(circleX, circleY, radius);
}
