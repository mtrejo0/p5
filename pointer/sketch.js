

var black = true;

function setup() {
  // put setup code here
 createCanvas(windowWidth-10,windowHeight-10);

}



function mousePressed()
{
  black = !black;
}


function draw() {
  if(black)
  {
    background("white");
    fill("black");
    //ellipse(mouseX,mouseY,10,10);
    var n = 100;
    colorMode(HSB, 100);
    for (var i = n; i >= 0; i--) {
      //line(mouseX,mouseY,mouseX+100000*cos(PI/(n/2)*i),mouseY+100000*sin(PI/(n/2)*i));
      fill(255/(2*n)*i, 255, 255);
      noStroke();
      beginShape();
      vertex(mouseX, mouseY);
      vertex(mouseX+100000*cos(PI/(n/2)*i),mouseY+100000*sin(PI/(n/2)*i));
      vertex(mouseX+100000*cos(PI/(n/2)*(i+1)),mouseY+100000*sin(PI/(n/2)*(i+1)));
      endShape(CLOSE);

    }
  }
  else
  {
    background("white");
    fill("black");
    //ellipse(mouseX,mouseY,10,10);
    var n = 100;
    colorMode(RGB, 100);
    for (var i = n; i >= 0; i--) {
      //line(mouseX,mouseY,mouseX+100000*cos(PI/(n/2)*i),mouseY+100000*sin(PI/(n/2)*i));
      fill(255/( 2*n)*i);
      noStroke();
      beginShape();
      vertex(mouseX, mouseY);
      vertex(mouseX+100000*cos(PI/(n/2)*i),mouseY+100000*sin(PI/(n/2)*i));
      vertex(mouseX+100000*cos(PI/(n/2)*(i+1)),mouseY+100000*sin(PI/(n/2)*(i+1)));
      endShape(CLOSE);

    }
  }
  

  
  
}
