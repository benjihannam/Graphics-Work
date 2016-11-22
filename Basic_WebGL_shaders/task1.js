var WhiteVertexSource = `
    uniform mat4 ModelViewProjection;
    attribute vec3 Position;
    void main(){
        gl_Position = ModelViewProjection* vec4(Position, 1.0);
    }
`;
var WhiteFragmentSource = `
    precision highp float;
    
    void main(){
        gl_FragColor = vec4(1.0);
    }
`;

function createVertexBuffer(gl, vertexData) {
    // TODO: Create a buffer, bind it to the ARRAY_BUFFER target, and
    //       copy the array `vertexData` into it
    //       Return the created buffer
    //       Commands you will need: gl.createBuffer, gl.bindBuffer, gl.bufferData
    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);
    return buf;
}
function createIndexBuffer(gl, indexData) {
    // TODO: Create a buffer, bind it to the ELEMENT_ARRAY_BUFFER target, and
    //       copy the array `indexData` into it
    //       Return the created buffer
    //       Commands you will need: gl.createBuffer, gl.bindBuffer, gl.bufferData
    var ind = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ind);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData), gl.STATIC_DRAW);
    return ind;
}

function createShaderObject(gl, shaderSource, shaderType) {
    // TODO: Create a shader of type `shaderType`, submit the source code `shaderSource`,
    //       compile it and return the shader
    //       Commands you will need: gl.createShader, gl.shaderSource, gl.compileShader
    var shader = gl.createShader(shaderType);
    gl.shaderSource(shader, shaderSource);
    gl.compileShader(shader);
    return shader;
}
function createShaderProgram(gl, vertexSource, fragmentSource) {
    var vertexShader = createShaderObject(gl,   vertexSource, gl.VERTEX_SHADER);
    var fragmentShader = createShaderObject(gl, fragmentSource, gl.FRAGMENT_SHADER);
  
    var program = gl.createProgram(); 
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader); 
    gl.linkProgram(program);
    return program;
    // TODO: Create a shader program, attach `vertexShader` and `fragmentShader`
    //       to it, link the program and return the result.
    //       Commands you will need: gl.createProgram, gl.attachShader, gl.linkProgram
}

var TriangleMesh = function(gl, vertexPositions, indices, vertexSource, fragmentSource) {
    this.indexCount = indices.length;
    this.positionVbo = createVertexBuffer(gl, vertexPositions);
    this.indexIbo = createIndexBuffer(gl, indices);
    this.shaderProgram = createShaderProgram(gl, vertexSource, fragmentSource);
}

TriangleMesh.prototype.render = function(gl, model, view, projection) {

    gl.useProgram(this.shaderProgram);

    var matrix = projection.multiply(view.multiply(model));
    ModelViewProjection = matrix;

    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionVbo);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexIbo);

    var uniformLocation = gl.getUniformLocation(this.shaderProgram, "ModelViewProjection");
    gl.vertexAttribPointer(uniformLocation, 3, gl.FLOAT, false, 0, 0);
    
    var location = gl.getAttribLocation(this.shaderProgram,"Position");
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location, 3, gl.FLOAT, false, 0, 0);

    gl.uniformMatrix4fv(uniformLocation, false, ModelViewProjection.transpose().m);

    gl.drawElements(gl.TRIANGLES, this.indexCount, gl.UNSIGNED_SHORT, 0);


}

var Task1 = function(gl) {
    this.cameraAngle = 0;
    this.mesh = new TriangleMesh(gl, CubePositions, CubeIndices, WhiteVertexSource, WhiteFragmentSource);
    
    gl.enable(gl.DEPTH_TEST);
}

Task1.prototype.render = function(gl, w, h) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    var projection = Matrix.perspective(60, w/h, 0.1, 100);
    var view =
        Matrix.translate(0, 0, -5).multiply(
        Matrix.rotate(this.cameraAngle, 1, 0, 0));
    var model = Matrix.rotate(Date.now()/25, 0, 1, 0);

    this.mesh.render(gl, model, view, projection);
}

Task1.prototype.dragCamera = function(dy) {
    this.cameraAngle = Math.min(Math.max(this.cameraAngle + dy*0.5, -90), 90);
}