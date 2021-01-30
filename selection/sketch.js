var length = 500;
var width = 500;
var items = [];
var n = 250;
var index = 0;

function setup() {
  // put setup code here
  length = windowWidth;
  width = windowHeight;
  createCanvas(windowWidth , windowHeight);
  for (var i = n; i >= 0; i--) {
    items.push(new Bar(i,i/n));
  }
  randomize(items);
  index = items.length-1;
}

function draw() {
  // put drawing code here
  createCanvas(windowWidth , windowHeight);
  if(index>=0)
  {
    var m = index;
    for (var j = index; j >= 0; j--) {
      if(items[m].height<items[j].height)
      {
        m = j;
        
      }
    }
    var temp = items[m].height;
    items[m].height = items[index].height;
    items[index].height = temp;
    
  }
  index--;
  
  noStroke();

  background('black');
  for (var i = items.length - 1; i >= 0; i--) {
    items[i].display();

  } 
}


function Bar(pos,height)
{
  this.pos = pos;
  this.height = height;

  this.move = function(newPos)
  {
    this.pos = newPos;
  }
  this.display = function ()
  {
    colorMode(HSB,100);
    fill(map(this.height*windowHeight,0,windowHeight,0,100),100,100);
    rectMode(CORNERS);
    rect(windowWidth/n*this.pos,windowHeight, windowWidth/n*this.pos+windowWidth/n,this.height*windowHeight);
  }
}
function randomize(items)
{
  for (var j = 10; j >= 0; j--) {
    for (var i = items.length - 1; i >= 0; i--) {
        index = int(random(items.length));
        var temp = items[i].height;
        items[i].height = items[index].height;
        items[index].height = temp;
  }
}

}





