var canvas;
var gl;
var points;

var locTime;
var iniTime;
var vertices;
// Random stefna fyrir boltann
var speed = 0.007;
var theta = 2*Math.random()*Math.PI;
var dx = speed*Math.cos(theta);
var dy = speed*Math.sin(theta);

// Random upphafsstaðsetning fyrir boltann
var xOffset = 2*Math.random() - 1;
var yOffset = Math.random() -0.5;

// Random stig
var counter = 0;
var point_visible = false;
var point_scored = false;
var x_point = 0;
var y_point = 0;
var total_points_scored = 0;

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.8, 0.8, 0.8, 1.0 );

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    vertices = [
        vec2( -0.1, -0.9 ),      // Neðri spaði VN 0
        vec2( -0.1, -0.86 ),     // Neðri spaði VE 1
        vec2(  0.1, -0.86 ),     // Neðri spaði HE 2
        vec2(  0.1, -0.9 ),      // Neðri spaði VN 3
        vec2( -0.1, 0.9 ),       // Efri spaði VE 4
        vec2( -0.1, 0.86 ),      // Efri spaði VN 5
        vec2(  0.1, 0.86 ),      // Efri spaði HN 6
        vec2(  0.1, 0.9 ),       // Efri spaði HE 7
        vec2( -0.02 + xOffset, -0.035 + yOffset),   // Bolti VN 8
        vec2( -0.02 + xOffset, 0.035 + yOffset),    // Bolti VE 9
        vec2(  0.02 + xOffset, 0.035 + yOffset),    // Bolti HE 10
        vec2(  0.02 + xOffset, -0.035 + yOffset),   // Bolti HN 11
        vec2(-0.03 , -0.048),   // Random stig
        vec2(-0.03 , 0.048),    // Random sitg
        vec2(0.03 , 0.048),     // Random stig
        vec2(0.03 , -0.048)     // Random stig
    ];

    // Load the data into the GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    // Event listener for keyboard
    window.addEventListener("keydown", function(e){
        switch( e.keyCode ) {
            case 37:	// vinstri ör
              if (vertices[1][0] <= -1) {
                lower_move = 0.0;
                higher_move = 0.0;
              } else {
                lower_move = -0.06;
                higher_move = 0.06;
              }
                break;
            case 39:	// hægri ör
              if (vertices[2][0] >= 1) {
                lower_move = 0.0;
                higher_move = 0.0;
              } else {
                lower_move = 0.06;
                higher_move = -0.06;
              }
                break;
            default:
                lower_move = 0.0;
                higher_move = 0.0;
        }
        for(i=0; i<4; i++) {
            vertices[i][0] += lower_move;
            vertices[i+4][0] += higher_move;
        }

        gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(vertices));
    } );


    render();
}

/*
// Fall sem að breytir hnitum boltans fyrir hverja teiknum og finnur
// árekstra við veggi og spaða
*/
function move_ball() {
  // Árekstur við hægri brún
  if (vertices[10][0] >= 1) {
    dx = -dx;
  }
  // Árekstur við vinstri brún
  else if (vertices[9][0] <= -1) {
    dx = -dx;
  }
  // Árekstur við efri spaða
  if (vertices[9][1] >= 0.86 && vertices[9][1] <= 0.9 && vertices[5][0] < vertices[10][0] && vertices[9][0] < vertices[6][0]) {
    dy = -dy;
  }
  // Árekstur við neðri spaða
  if (vertices[8][1] <= -0.86 && vertices[8][1] >= -0.9 && vertices[1][0] < vertices[11][0] && vertices[8][0] < vertices[2][0]){
    dy = -dy;
  }
  for(i=8 ; i<12 ; i++){
    vertices[i][0] += dx;
    vertices[i][1] += dy;
  }
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(vertices));
}

/*
// Fall sem ákveður hvar stig birtist og breytir point_visible til þess
// að það verði teiknað
*/
function show_point() {
  // Taka síðustu hliðrun í burtu
  for (i=12 ; i<16 ; i++) {
    vertices[i][0] -= x_point;
    vertices[i][1] -= y_point;
  }
  // Velja nýja random staðsetningu
  x_point = 2*Math.random() - 1;
  y_point = Math.random() -0.5;
  for (i=12 ; i<16 ; i++) {
    vertices[i][0] += x_point;
    vertices[i][1] += y_point;
  }
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(vertices));
  point_visible = true;
}

/*
// Fall sem athugar hvort að boltinn snerti stigið. Ef bolti snertir stig þá
// er kallað í draw_point og stigið er falið þar til að render() teiknar það næst
*/
function check_score() {
  if (vertices[12][0] <= vertices[10][0] && vertices[15][0] >= vertices[9][0]) {
    if (vertices[15][1] <= vertices[9][1] && vertices[14][1] >= vertices[8][1]) {
      total_points_scored += 1;
      point_visible = false;
      draw_point(total_points_scored);
    }
  }
}

/*
// Fall sem breytir stigatalningu og tilkynnir notanda að hann hafi unnið
*/
function draw_point(k) {
  var stigadiv = document.getElementById( "stigadiv" );
  stigadiv.innerHTML = "";
  var nytt_stig = document.createElement("p");
  if (k == 10) {
    var skilabodadiv = document.getElementById( "skilabodadiv" );
    skilabodadiv.innerHTML = "";
    var ny_skilabod = document.createElement("p");
    var node = document.createTextNode("Til hamingju, þú vannst leikinn!");
    ny_skilabod.appendChild(node);
    skilabodadiv.appendChild(ny_skilabod);
  }
  var node = document.createTextNode("Stigafjöldi: " + k);

  nytt_stig.appendChild(node);
  stigadiv.appendChild(nytt_stig);
}

/*
// Fall sem skoðar hvort að boltinn sé farinn út fyrir strigann.
// Ef boltinn er farinn út fyrir strigann þá eru skrifuð skilaboð til spilara
*/
function ball_offscreen() {
  if (vertices[9][1] >= 1 || vertices[8][1] <= -1) {
    var skilabodadiv = document.getElementById( "skilabodadiv" );
    skilabodadiv.innerHTML = "";
    var ny_skilabod = document.createElement("p");
    var node = document.createTextNode("Leik lokið");
    ny_skilabod.appendChild(node);
    skilabodadiv.appendChild(ny_skilabod);
  }
}

/*
// Fall sem eykur hraða boltans
*/
function need_for_speed() {
  var dx_temp = dx/speed;
  var dy_temp = dy/speed;
  speed += 0.001;
  dx = dx_temp * speed;
  dy = dy_temp *speed;
}

function render() {
  // Held utan um fjölda teiknaðra ramma
  counter += 1;
  // Þurka allt af striganum
  gl.clear( gl.COLOR_BUFFER_BIT );
  // Sýni stig á 1000. hverjum ramma ef það er ekki nú þegar til staðar
  if (counter % 1000 == 0 && point_visible == false) {
    show_point();
  }
  // Ef stig er teiknað á strigan, þá er tékkað hvort boltinn snerti það
  if ( point_visible == true) {
    check_score();
  }
  // Teikna efri og neðri spaða
  gl.drawArrays( gl.TRIANGLE_FAN, 0, 4 );
  gl.drawArrays( gl.TRIANGLE_FAN, 4, 4 );
  // Teikna stig ef það á að vera sýnilegt
  if (point_visible == true) {
    gl.drawArrays( gl.TRIANGLE_FAN, 12, 4 );
  }
  // Tékka hvort að hnit boltans séu komin út fyrir strigann
  ball_offscreen();
  // Eyk hraðann 2000. hvern ramma
  if (counter % 2000 == 0) {
    need_for_speed();
  }
  // Reikna út nýja staðsetningu á boltanum
  move_ball();
  // Teikna boltann
  gl.drawArrays( gl.TRIANGLE_FAN, 8, 4 );

  window.requestAnimFrame(render);
}
