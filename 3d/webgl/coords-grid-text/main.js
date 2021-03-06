// Vertex shader program

const vsSource = `
attribute vec4 aVertexPosition;
attribute vec4 aVertexColor;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

varying lowp vec4 vColor;

void main() {
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    vColor = aVertexColor;
}
`;

const fsSource = `
precision mediump float;
varying lowp vec4 vColor;

void main() {
    gl_FragColor = vColor;
}
`;

const black = {
    r: 0,
    g: 0,
    b: 0,
};

const projectionMatrix = mat4.create();
const modelMatrix = mat4.create();
const viewMatrix = mat4.create();
const modelViewMatrix = mat4.create();
let textPos = vec2.create(0, 0);
const textList = [
    { text: "0,0,0", x: 0, y: 0, z: 0 },
    { text: "0,0,-2", x: 0, y: 0, z: -2 },
    { text: "0,0,2", x: 0, y: 0, z: 2 },
    { text: "0,-2,0", x: 0, y: -2, z: 0 },
    { text: "0,2,0", x: 0, y: 2, z: 0 },
    { text: "-2,0,0", x: -2, y: 0, z: 0 },
    { text: "2,0,0", x: 2, y: 0, z: 0 }
];

main();

//
// start here
//
function main() {
    const canvas = document.querySelector("#glCanvas");
    // Initialize the GL context
    const gl = canvas.getContext("webgl");

    // Only continue if WebGL is available and working
    if (!gl) {
        alert("Unable to initialize WebGL. Your browser or machine may not support it.");
        return;
    }

    // look up the text canvas.
    var textCanvas = document.querySelector("#glText");
    // make a 2D context for it
    var ctx = textCanvas.getContext("2d");
    if (!ctx) {
        alert("Unable to initialize WebGL 2D. Your browser or machine may not support it.");
        return;
    }

    // Set clear color to black, fully opaque
    gl.clearColor(black.r, black.g, black.b, 1.0);
    // Clear the color buffer with specified clear color
    gl.clear(gl.COLOR_BUFFER_BIT);

    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

    const programInfo = {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
            vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
            modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix')
        }
    };

    initProjectionMatrix(gl);
    initModelViewMatrix(gl);

    const buffers = initBuffers(gl);

    var then = 0;

    textList.forEach(item => {
        item.pos = from3dto2d(gl, item.x, item.y, item.z);
    })

    // Draw the scene repeatedly
    function render(now) {
        now *= 0.001;  // convert to seconds
        const deltaTime = now - then;
        then = now;

        drawScene(gl, programInfo, buffers, deltaTime);
        draw2d(ctx);

        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}

function from3dto2d(gl, x, y, z) {
    const pmv = mat4.create();
    mat4.mul(pmv, projectionMatrix, modelViewMatrix);

    const h = vec4.create();
    vec4.transformMat4(h, vec4.fromValues(x, y, z, 1), pmv);
    
    const cs = vec4.fromValues(h[0]/h[3], h[1]/h[3], h[2]/h[3]);
    const p = vec2.fromValues((1+cs[0])*gl.canvas.width/2,(1-cs[1])*gl.canvas.height/2)

    return p;
}

function draw2d(ctx) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.font = '14px serif';
    ctx.fillStyle = 'rgb(255,255,255)';

    textList.forEach(item => {
        const size = ctx.measureText(item.text);
        ctx.fillText(item.text, item.pos[0] - (size.width/2), item.pos[1]);
    });
}

function initBuffers(gl) {
  // Create a buffer for the square's positions.
  const positionBuffer = gl.createBuffer();

  // Select the positionBuffer as the one to apply buffer
  // operations to from here out.
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Now create an array of positions for the square.
  const positions = [
     0, 0, -2,
     0, 0, 2,
     0, -2, 0,
     0, 2, 0,
     -2, 0, 0,
     2, 0, 0
  ];

  // Now pass the list of positions into WebGL to build the
  // shape. We do this by creating a Float32Array from the
  // JavaScript array, then use it to fill the current buffer.
  gl.bufferData(gl.ARRAY_BUFFER,
                new Float32Array(positions),
                gl.STATIC_DRAW);

  const gridBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, gridBuffer);
  const rows = 20;
  const cols = 20;
  let gridPositions = [];
  for(let y = 0; y < rows; y++) {
      for(let x = 0; x < cols; x++) {
          gridPositions.push(0, (x / 5) - (cols / 5 / 2), (y / 5) - (rows / 5 / 2));
      }
  }
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(gridPositions), gl.STATIC_DRAW);

  const colors = [
    1.0,  0.0,  0.0,  1.0,    // red
    1.0,  0.0,  0.0,  1.0,    // red
    0.0,  1.0,  1.0,  1.0,    // green
    0.0,  1.0,  0.0,  1.0,    // green
    0.0,  0.0,  1.0,  1.0,    // blue
    0.0,  0.0,  1.0,  1.0,    // blue
  ];

  let gridColors = [];
  for(let i = 0; i < 400; i++) {
      gridColors.push(1.0, 1.0, 1.0, 1.0);
  }

  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

  const gridColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, gridColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(gridColors), gl.STATIC_DRAW);

  return {
    position: positionBuffer,
    gridPositions: gridBuffer,
    color: colorBuffer,
    gridColor: gridColorBuffer,
  };
}

//
// Initialize a shader program, so WebGL knows how to draw our data
//
function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  // Create the shader program

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // If creating the shader program failed, alert

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
    return null;
  }

  return shaderProgram;
}

//
// creates a shader of the given type, uploads the source and
// compiles it.
//
function loadShader(gl, type, source) {
  const shader = gl.createShader(type);

  // Send the source to the shader object

  gl.shaderSource(shader, source);

  // Compile the shader program

  gl.compileShader(shader);

  // See if it compiled successfully

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function initProjectionMatrix(gl) {
  const fieldOfView = 45 * Math.PI / 180;   // in radians
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = 0.1;
  const zFar = 100.0;

  mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);
}

function initModelViewMatrix(gl) {
  mat4.rotate(modelMatrix, modelMatrix, 0.8, [0, 0, 1]);
  mat4.lookAt(viewMatrix, vec3.fromValues(-4.0, -4.0, -4.0), vec3.fromValues(0, 0, 0), vec3.fromValues(0, 1, 0));
  mat4.mul(modelViewMatrix, modelMatrix, viewMatrix);
}

function drawScene(gl, programInfo, buffers, deltaTime) {
  gl.clearColor(black.r, black.g, black.b, 1.0);  // Clear to black, fully opaque
  gl.clearDepth(1.0);                 // Clear everything
  gl.enable(gl.DEPTH_TEST);           // Enable depth testing
  gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.useProgram(programInfo.program);

  // Set the shader uniforms

  gl.uniformMatrix4fv(
      programInfo.uniformLocations.projectionMatrix,
      false,
      projectionMatrix);
  gl.uniformMatrix4fv(
      programInfo.uniformLocations.modelViewMatrix,
      false,
      modelViewMatrix);

  // Tell WebGL how to pull out the positions from the position
  // buffer into the vertexPosition attribute.
  {
    const numComponents = 3;  // pull out 2 values per iteration
    const type = gl.FLOAT;    // the data in the buffer is 32bit floats
    const normalize = false;  // don't normalize
    const stride = 0;         // how many bytes to get from one set of values to the next
                              // 0 = use type and numComponents above
    const offset = 0;         // how many bytes inside the buffer to start from
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(
        programInfo.attribLocations.vertexPosition);
  }

  // Tell WebGL how to pull out the colors from the color buffer
  // into the vertexColor attribute.
  {
    const numComponents = 4;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexColor,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(
        programInfo.attribLocations.vertexColor);
  }

  {
    const offset = 0;
    const vertexCount = 6;
    gl.drawArrays(gl.LINES, offset, vertexCount);
  }

  // Tell WebGL how to pull out the positions from the position
  // buffer into the vertexPosition attribute.
  {
    const numComponents = 3;  // pull out 2 values per iteration
    const type = gl.FLOAT;    // the data in the buffer is 32bit floats
    const normalize = false;  // don't normalize
    const stride = 0;         // how many bytes to get from one set of values to the next
                              // 0 = use type and numComponents above
    const offset = 0;         // how many bytes inside the buffer to start from
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.gridPositions);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(
        programInfo.attribLocations.vertexPosition);
  }

  // Tell WebGL how to pull out the colors from the color buffer
  // into the vertexColor attribute.
  {
    const numComponents = 4;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.gridColor);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexColor,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(
        programInfo.attribLocations.vertexColor);
  }

  {
    const offset = 0;
    const vertexCount = 400;
    gl.drawArrays(gl.POINTS, offset, vertexCount);
  }
}