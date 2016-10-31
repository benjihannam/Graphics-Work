var PhongVertexSource = `

    uniform mat4 ModelViewProjection;
    uniform mat4 Model;
    uniform mat4 View;

    attribute vec3 Position;
    attribute vec3 Normal;

    varying vec3 vNormal;
    varying vec4 global_position;

    void main() {
        gl_Position = ModelViewProjection* vec4(Position, 1.0);
        global_position = Model * vec4(Position, 1.0);
        vNormal = Normal;
    }
`;
var PhongFragmentSource = `
    precision highp float;
    
    const vec3 LightPosition = vec3(4, 2, 4);
    const vec3 LightIntensity = vec3(20);
    const vec3 ka = 0.3*vec3(1, 0.5, 0.5);
    const vec3 kd = 0.7*vec3(1, 0.5, 0.5);
    const vec3 ks = vec3(0.4);
    const float n = 60.0;

    uniform mat4 ModelInverse;
    uniform mat4 ViewInverse;

    varying vec3 vNormal;
    varying vec4 global_position;
    
    void main() {

        //get the light vector and the eye vector
        vec3 l = LightPosition - vec3(global_position);
        vec3 view_direction = vec3(ViewInverse * vec4(0.0, 0.0, 0.0,1.0))  - vec3(global_position);

        // combine them and normalize to get h
        vec3 combined = normalize(l) + normalize(view_direction);
        vec3 h = normalize(combined);

        //get the normal vector
        vec3 n2 = vec3(ModelInverse * vec4(vNormal, 1.0));

        // calculate the dot product 
        float n_dot_h = dot(normalize(n2), normalize(h));

        //get the amount of incident light falling on the point
        vec3 incident_light = LightIntensity / pow(length(l), 2.0);

        //calculate the light components
        vec3 light_response = kd * incident_light * max(0.0, dot(normalize(l), normalize(n2)));
        vec3 spec_light = ks * incident_light * pow(n_dot_h, n);

        // add them and set the color
        vec3 total_light = ka + light_response + spec_light;
        gl_FragColor = vec4(total_light, 1.0);
    }
`;

var ShadedTriangleMesh = function(gl, vertexPositions, vertexNormals, indices, vertexSource, fragmentSource) {
    this.indexCount = indices.length;
    this.positionVbo = createVertexBuffer(gl, vertexPositions);
    this.normalVbo = createVertexBuffer(gl, vertexNormals);
    this.indexIbo = createIndexBuffer(gl, indices);
    this.shaderProgram = createShaderProgram(gl, vertexSource, fragmentSource);
}

ShadedTriangleMesh.prototype.render = function(gl, model, view, projection) {

    gl.useProgram(this.shaderProgram);

    var matrix = projection.multiply(view.multiply(model));
    ModelViewProjection = matrix;

    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionVbo);

    var location = gl.getAttribLocation(this.shaderProgram,"Position");
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalVbo);

    var norm = gl.getAttribLocation(this.shaderProgram, "Normal");
    gl.enableVertexAttribArray(norm);
    gl.vertexAttribPointer(norm, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexIbo);

    //load in the uniform locations
    var uniformLocation = gl.getUniformLocation(this.shaderProgram, "ModelViewProjection");
    var model_transform = gl.getUniformLocation(this.shaderProgram, "Model");
    var view_transform = gl.getUniformLocation(this.shaderProgram, "View");
    var model_inverse = gl.getUniformLocation(this.shaderProgram, "ModelInverse");
    var view_inverse = gl.getUniformLocation(this.shaderProgram, "ViewInverse");

    //put the values into the locations
    gl.uniformMatrix4fv(uniformLocation, false, ModelViewProjection.transpose().m);
    gl.uniformMatrix4fv(model_transform, false, model.transpose().m);
    gl.uniformMatrix4fv(view_transform, false, view.transpose().m);
    gl.uniformMatrix4fv(view_inverse, false, view.inverse().transpose().m);
    gl.uniformMatrix4fv(model_inverse, false, model.inverse().m);
    
    gl.drawElements(gl.TRIANGLES, this.indexCount, gl.UNSIGNED_SHORT, 0);
}

var Task2 = function(gl) {
    this.cameraAngle = 0;
    this.sphereMesh = new ShadedTriangleMesh(gl, SpherePositions, SphereNormals, SphereIndices, PhongVertexSource, PhongFragmentSource);
    this.cubeMesh = new ShadedTriangleMesh(gl, CubePositions, CubeNormals, CubeIndices, PhongVertexSource, PhongFragmentSource);
    
    gl.enable(gl.DEPTH_TEST);
}

Task2.prototype.render = function(gl, w, h) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    var projection = Matrix.perspective(60, w/h, 0.1, 100);
    var view =
        Matrix.translate(0, 0, -5).multiply(
        Matrix.rotate(this.cameraAngle, 1, 0, 0));
    var rotation = Matrix.rotate(Date.now()/25, 0, 1, 0);
    var cubeModel = Matrix.translate(-1.8, 0, 0).multiply(rotation);
    var sphereModel = Matrix.translate(1.8, 0, 0).multiply(rotation).multiply(Matrix.scale(1.2, 1.2, 1.2));

    this.sphereMesh.render(gl, sphereModel, view, projection);
    this.cubeMesh.render(gl, cubeModel, view, projection);
}

Task2.prototype.dragCamera = function(dy) {
    this.cameraAngle = Math.min(Math.max(this.cameraAngle + dy*0.5, -90), 90);
}
