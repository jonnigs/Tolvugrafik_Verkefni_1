var canvas;
var gl;


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

    var vertices = [
        vec2( -0.1, -0.9 ),
        vec2( -0.1, -0.86 ),
        vec2(  0.1, -0.86 ),
        vec2(  0.1, -0.9 ),
        vec2( -0.1, 0.9 ),
        vec2( -0.1, 0.86 ),
        vec2(  0.1, 0.86 ),
        vec2(  0.1, 0.9 ),
        vec2( -0.02, -0.035 ),
        vec2( -0.02, 0.035 ),
        vec2(  0.02, 0.035 ),
        vec2(  0.02, -0.035 ),
    ];

    // Load the data into the GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.DYNAMIC_DRAW );

    // Associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    // Event listener for keyboard
    window.addEventListener("keydown", function(e){
        switch( e.keyCode ) {
            case 37:	// vinstri ör
                lower_move = -0.04;
                higher_move = 0.04;
                break;
            case 39:	// hægri ör
                lower_move = 0.04;
                higher_move = -0.04;
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


function render() {

    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLE_FAN, 0, 4 );
    gl.drawArrays( gl.TRIANGLE_FAN, 4, 4 );
    gl.drawArrays( gl.TRIANGLE_FAN, 8, 4 );

    window.requestAnimFrame(render);
}
