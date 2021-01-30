let maze = [];
let size;
let adj = [];
let pathBFS;
let width;
let height;
let searchIndex;
let search;
let seen;

function setup() {

  createCanvas(windowWidth,windowHeight);

  searchIndex = 0;
  size = 20;
  width = (windowWidth/size|0)-1;
  height = (windowHeight/size|0)-1;

  makeMaze()
  pathBFS = unweighted_shortest_pathBFS(makeAdj(),[0,0],[height-1,width-1]);

  while (!pathBFS)
  {
    makeMaze()
    pathBFS = unweighted_shortest_pathBFS(makeAdj(),[0,0],[height-1,width-1]);
    console.log("new maze")
  }

  let bfsSearch = bfs(adj, [0, 0])
  search = bfsSearch[1]
  seen = bfsSearch[2]


}

function makeMaze() {
  maze = [];
  for (var i = 0; i < height; i++) {
    maze.push([]);
    for (var j = 0; j < width; j++) {
      if(random(1) < .4)
      {
        maze[i].push(1);
      }
      else
      {
        maze[i].push(0);
      }
    }

  }
  maze[0][0] = 0;
  maze[1][0] = 0;
  maze[0][1] = 0;
  maze[height-1][width-1] = 0;
  maze[height-2][width-1] = 0;
  maze[height-2][width-2] = 0;
}
 function makeAdj() {
   adj = [];
   for (var i = 0; i < height; i++) {
     adj.push([]);
     for (var j = 0; j < width; j++) {
       adj[i].push([]);
     }
   }
   for (var i = maze.length - 1; i >= 0; i--) {
     for (var j = maze[i].length - 1; j >= 0; j--) {
       if(i+1 < maze.length && !maze[i+1][j] && !maze[i][j])
       {
         adj[i][j].push([i+1,j]);
       }
       if(i-1 >= 0 && !maze[i-1][j] && !maze[i][j])
       {
         adj[i][j].push([i-1,j]);
       }
       if(j+1 < maze[i].length && !maze[i][j+1] && !maze[i][j])
       {
         adj[i][j].push([i,j+1]);
       }
       if(j-1 >= 0 && !maze[i][j-1] && !maze[i][j])
       {
         adj[i][j].push([i,j-1]);
       }
     }
   }
   return adj
 }

function draw() {


  var x = 0;
  var y = 0;
  var color = "white";

  for (var i = 0; i < maze.length ; i++) {
    for (var j = 0; j < maze[i].length; j++) {
      if(maze[i][j])
      {
        color = "black";
      }
      else
      {
        color = "white";
      }
      fill(color);
      rect(x,y,size,size)
      x=x+size;
    }
    y+=size;
    x = 0;
  }



  if(searchIndex < search.length-1 ) {
    fill("yellow");
    let seenState = seen[searchIndex]
    for (let k = 0; k < seenState.length; k++) {
      pos = seenState[k]
      x = pos[1] * size
      y = pos[0] * size
      rect(x, y, size, size)
    }

    fill("red");
    let searchState = search[searchIndex]
    for (let k = 0; k < searchState.length; k++) {
      pos = searchState[k]
      x = pos[1] * size
      y = pos[0] * size
      rect(x, y, size, size)
    }
    searchIndex++
  }
  else if(pathBFS){
    fill("red");
    for (let k = 0 ; k < pathBFS.length ; k ++)
    {
      pos = pathBFS[k]
      x = pos[1]*size
      y = pos[0]*size
      rect(x,y,size,size)
    }
  }


  fill("lime")
  rect(0,0,size,size)
  x = (maze[0].length-1)*size
  y = (maze.length-1)*size
  rect(x,y,size,size)



}

function bfs (Adj, s)
{
  let parent = {};
  parent[s] =  s
  let level = [[s]]
  let seen = []
  while (0 < level[level.length-1].length){
    seen.push([])
    for(let i = 0 ; i < level.length ; i++)
    {
      for(let j = 0 ; j < level[i].length ; j++){
        seen[seen.length-1].push(level[i][j])
      }
    }

    level.push([]);
    for (let i = 0; i < level[level.length-2].length; i++){
      const u = level[level.length - 2][i];
      for (let j = 0; j < Adj[u[0]][u[1]].length; j++){
        const v = Adj[u[0]][u[1]][j];
        if(!(v in parent)){
          parent[v] = u;
          level[level.length-1].push(v);
        }
      }
    }
  }
  return [parent,level,seen]
}

function unweighted_shortest_pathBFS(Adj, s, t)
{
  var parent = bfs(Adj, s)[0];
  if(!(t in parent)) {return null;}
  path = [t];
  solve = [];
  while(parent[t] !== t){
    solve.push(parent[t])
    t = parent[t];
  }
  solve.push(s);
  solve.reverse()
  solve.push(t);
  return solve.slice(1,solve.length);
}
