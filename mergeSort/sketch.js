

var items = [];
var n = 250;
var iterations = [];
var time =0;
var index;
var init = [];
var initP = [];


function setup() {

  createCanvas(windowWidth, windowHeight);
  for (var i = n; i >= 0; i--) {
    items.push([i,i/n])
  }

  randomize(items); 

  for (var i = 0; i < items.length; i++) {
    init.push(items[i][1])
    initP.push(items[i][0]);
  }
  
  index = 0

  mergeSort(items,0,0,null);
  


  background('black');
  




}




function mergeSort(arr,l, r, temp)
{

  if(temp == null)
  {
    r = arr.length;
    temp = [];
    for (var i = arr.length - 1; i >= 0; i--) {
      temp.push(null);
    }
  }
  
  if(1<r-l)
  {
    var c = ((l+r+1)/2)|0;
    
    mergeSort(arr,l,c,temp);
    mergeSort(arr,c,r,temp);

    var t  = l;
    var p1 = l;
    var p2 = c;
    while(t != r)
    {

      if(p2 == r || (p1<c && arr[p1][1]<arr[p2][1]))
      {
        temp[t] = arr[p1][1];
        iterations.push(temp.slice())
        
        p1+=1;
      }
      else
      {
        temp[t] = arr[p2][1];
        iterations.push(temp.slice())
        p2+=1;
      }
      t+=1;
      
    }
    for (var i = l; i < r; i++) {
      arr[i][1] = temp[i];
      
      
    }

  }

  return arr;
}


function draw() {
  //createCanvas(windowWidth, windowHeight);

  //noStroke();
  if(index == 0){
  for (var i = init.length - 1; i >= 0; i--) {
    colorMode(HSB,100);
    height = init[i]
    pos = initP[i]
    noStroke()
    fill(map(height*windowHeight,0,windowHeight,0,100),100,100);
    rectMode(CORNERS);
    rect(windowWidth/n*pos,windowHeight, windowWidth/n*pos+windowWidth/n,height*windowHeight);
  }
}
  
  if(index<iterations.length){
      //background('black');
      temp = iterations[index]
      for (var  i = items.length - 1; i >= 0; i--) {
        colorMode(HSB,100);

        if(temp[i]!=null){

          height = temp[i]
        }
        else
        {
          continue
          //height = init[i]
        }

        pos = items[i][0]
        noStroke()
        fill(100,100,0);
        rect(windowWidth/n*pos,windowHeight, windowWidth/n*pos+windowWidth/n,0);

        fill(map(height*windowHeight,0,windowHeight,0,100),100,100);
        rectMode(CORNERS);

        rect(windowWidth/n*pos,windowHeight, windowWidth/n*pos+windowWidth/n,height*windowHeight);
      }
    }
    else
    {
      background('black');
      temp = iterations[iterations.length-1]
      for (var i = items.length - 1; i >= 0; i--) {

        height = temp[i]
        pos = items[i][0]
        noStroke()
        fill(map(height*windowHeight,0,windowHeight,0,100),100,100);
        rectMode(CORNERS);
        rect(windowWidth/n*pos,windowHeight, windowWidth/n*pos+windowWidth/n,height*windowHeight);
      }
    }
    index++;
    


  }


  function randomize(items)
  {
    for (var j = 10; j >= 0; j--) {
      for (var i = items.length - 1; i >= 0; i--) {
        indexA = int(random(items.length));
        var temp = items[i][1];
        items[i][1] = items[indexA][1];
        items[indexA][1] = temp;
      }
    }


  }


