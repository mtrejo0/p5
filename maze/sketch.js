
var maze = [];
var n = 40;
var size;
var originBFS = [100,100];
var originDFS = [700,100];
var adj = [];
var pathBFS;
var pathDFS;
var button;


function setup() {

  createCanvas(windowWidth,windowHeight);
  if(button != null)
  {
    button.remove();
  }
  size = 0;
  button = createButton("New Graph");
  button.position(10,10);
  button.mousePressed(setup);

  adj = [];
  maze = [];


  for (var i = n; i >= 0; i--) {
    maze.push([]);
  }
  for (var i = n; i >= 0; i--) {
      for (var j = n; j >= 0; j--) {

        if(random(1)<.2)
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
  maze[n-1][n-1] = 0;

  for (var i = n; i >= 0; i--) {
    adj.push([]);
  }
  for (var i = n; i >= 0; i--) {
      for (var j = n; j >= 0; j--) {
        adj[i].push([]);
      }
  }


  for (var i = maze.length - 1; i >= 0; i--) {
    for (var j = maze.length - 1; j >= 0; j--) {
      if(i+1 < n && !maze[i+1][j] && !maze[i][j])
      {
        adj[i][j].push([i+1,j]);
      }
      if(i-1 >= 0 && !maze[i-1][j] && !maze[i][j])
      {
        adj[i][j].push([i-1,j]);
      }
      if(j+1 < n && !maze[i][j+1] && !maze[i][j])
      {
        adj[i][j].push([i,j+1]);
      }
      if(j-1 >= 0&& !maze[i][j-1] && !maze[i][j])
      {
        adj[i][j].push([i,j-1]);
      }
    }
  }


  pathBFS = unweighted_shortest_pathBFS(adj,[0,0],[n-1,n-1]);
  pathDFS = unweighted_shortest_pathDFS(adj,[0,0],[n-1,n-1]);


}

function draw() {
  createCanvas(windowWidth,windowHeight);
  originBFS = [windowWidth/12,windowHeight/6];
  originDFS = [windowWidth/2,windowHeight/6]

  size = windowWidth/100;

  var x = originBFS[0];
  var y = originBFS[1];
  var color = "white";

  for (var i = 0; i < n ; i++) {
    for (var j = 0; j < n; j++) {

      if(maze[i][j])
      {
        color = "black";
      }
      else
      {
        color = "white";
      }
      if(pathBFS != null)
      {
        for (var k = pathBFS.length - 1; k >= 0; k--) {
          if(pathBFS[k] == i.toString()+","+j.toString())
          {
            color = "red";
          }
        }
      }
      else
      {
        fill("black");
        textSize(30);
        text("No Path Possible", originBFS[0],originBFS[1]-20);
      }
      if(i == 0 && j == 0)
      {
        color = "lime";
      }
      if(i == n-1 && j == n-1)
      {
        color = "lime";
      }
      fill(color);
      rect(x,y,size,size)
      x=x+size;
    }
    y+=size;
    x = originBFS[0];
  }

  var x = originDFS[0];
  var y = originDFS[1];
  var color = "white";

  for (var i = 0; i < n ; i++) {
    for (var j = 0; j < n; j++) {

      if(maze[i][j])
      {
        color = "black";
      }
      else
      {
        color = "white";
      }

      if(pathDFS != null)
      {
        for (var k = pathDFS.length - 1; k >= 0; k--) {
          if(pathDFS[k] == i.toString()+","+j.toString())
          {
            color = "blue";
          }
        }

      }
      else
      {
        fill("black");
        textSize(30);
        text("No Path Possible", originDFS[0],originDFS[1]-20);

      }
      if(i == 0 && j == 0)
      {
        color = "lime";
      }
      if(i == n-1 && j == n-1)
      {
        color = "lime";
      }

      fill(color);
      rect(x,y,size,size)
      x= x+size;
    }
    y+=size;
    x = originDFS[0];
  }

fill("black");
  textSize(30);
  text("BFS", originBFS[0],originBFS[1]-50);
  text("DFS", originDFS[0],originDFS[1]-50);

}

function bfs (Adj, s)
{
  parent = {} ;

  parent[s[0].toString()+","+s[1].toString()] =  s[0].toString()+","+s[1].toString();
  //console.log("parent",parent);
  level = [[s[0].toString()+","+s[1].toString()]]
  //console.log("level",level);
  while (0 < level[level.length-1].length){
    level.push([]);

    for (var i = 0; i < level[level.length-2].length;i++){
      var u = level[level.length-2][i];


      for (var j = 0; j < Adj[parseInt(u.split(",")[0],10)][parseInt(u.split(",")[1],10)].length; j++){
        var v = Adj[parseInt(u.split(",")[0],10)][parseInt(u.split(",")[1],10)][j];
        if(v[0].toString()+","+v[1].toString() in parent === false){

          parent[v[0].toString()+","+v[1].toString() ] = u;
          level[level.length-2].push(v[0].toString()+","+v[1].toString() );

        }
      }

    }
  }
  return parent
}
/*def bfs(Adj, s): # Adj: adjacency list, s: starting vertex
  parent = [None for v in Adj] # O(V) (use hash if unlabeled)
  parent[s] = s # O(1) root
  level = [[s]] # O(1) initialize levels
  while 0 < len(level[-1]): # O(?) last level contains vertices
                level.append([]) # O(1) amortized, make new level
                for u in level[-2]: # O(?) loop over last full level
                        for v in Adj[u]: # O(Adj[u]) loop over neighbors
                                if parent[v] is None: # O(1) parent not yet assigned
                                        parent[v] = u # O(1) assign parent from level[-2]
                                        level[-1].append(v) # O(1) amortized, add to border
  return parent*/

function dfs(Adj,s, parent, order)
{
  if(parent == null)
  {
    parent = {}
    parent[s[0].toString()+","+s[1].toString()] =  s[0].toString()+","+s[1].toString();
  }
  for (var i = 0; i < Adj[s[0]][s[1]].length; i++){
    var v =  Adj[s[0]][s[1]][i];
    if(v[0].toString()+","+v[1].toString() in parent === false)
    {
      parent[v[0].toString()+","+v[1].toString()]=s[0].toString()+","+s[1].toString();
      dfs(Adj,[v[0],v[1]],parent,order);
    }
  }
  order.push(s[0].toString()+","+s[1].toString());
  return parent;
}


function unweighted_shortest_pathBFS(Adj, s, t)
{
  var parent = bfs(Adj, s);
  if(t[0].toString()+","+t[1].toString() in parent === false)
  {return null;}
  var T = t[0].toString()+","+t[1].toString();
  var S = s[0].toString()+","+s[1].toString();
  path = [T];
  solve = [];
  while(parent[T] != T){
    solve.push(parent[T])
    T=parent[T];}
  solve.push(s[0].toString()+","+s[1].toString());
  solve.reverse()
  solve.push(t[0].toString()+","+t[1].toString());

  return solve.slice(1,solve.length);
}
function unweighted_shortest_pathDFS(Adj, s, t)
{
  var parent = dfs(Adj, s,null,[]);
  if(t[0].toString()+","+t[1].toString() in parent === false)
  {return null;}
  var T = t[0].toString()+","+t[1].toString();
  var S = s[0].toString()+","+s[1].toString();
  path = [T];
  solve = [];
  while(parent[T] != T){
    solve.push(parent[T])
    T=parent[T];}
  solve.push(s[0].toString()+","+s[1].toString());
  solve.reverse()
  solve.push(t[0].toString()+","+t[1].toString());

  return solve.slice(1,solve.length);
}
