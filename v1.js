var canvas;
var gl;
var points;

var locTime;
var iniTime;
var vertices;
var dx = 0.005;
var dy = 0.005;

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
        vec2( -0.02, -0.035 ),   // Bolti VN 8
        vec2( -0.02, 0.035 ),    // Bolti VE 9
        vec2(  0.02, 0.035 ),    // Bolti HE 10
        vec2(  0.02, -0.035 ),   // Bolti HN 11
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
                lower_move = -0.04;
                higher_move = 0.04;
              }
                break;
            case 39:	// hægri ör
              if (vertices[2][0] >= 1) {
                lower_move = 0.0;
                higher_move = 0.0;
              } else {
                lower_move = 0.04;
                higher_move = -0.04;                
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
  if (vertices[9][1] >= 0.86 && vertices[5][0] < vertices[10][0] && vertices[9][0] < vertices[6][0]) {
    dy = -dy;
  }
  // Árekstur við neðri spaða
  if (vertices[8][1] <= -0.86 && vertices[1][0] < vertices[11][0] && vertices[8][0] < vertices[2][0]){
    dy = -dy;
  }

  for(i=8 ; i<12 ; i++){
    vertices[i][0] += dx;
    vertices[i][1] += dy;
  }

  //for(i=8 ; i<12 ; i++){
    //if (vertices[i][0] >= 1 || vertices[i][0] <= -1) {
      //dx = -dx;
    //}
    //if (vertices[i][1] >= 1 || vertices[i][1] <= -1) {
      //dy = -dy;
    //}
    //vertices[i][0] += dx;
    //vertices[i][1] += dy;
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(vertices));
  }


function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );

    gl.drawArrays( gl.TRIANGLE_FAN, 0, 4 );
    gl.drawArrays( gl.TRIANGLE_FAN, 4, 4 );

    move_ball();
    gl.drawArrays( gl.TRIANGLE_FAN, 8, 4 );

    window.requestAnimFrame(render);
}
