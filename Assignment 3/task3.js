function rotateAroundAxisAtPoint(axis, angle, point) {
    // TODO: Build a transformation matrix that rotates around a given axis
    //       by the given angle at the given point.
    //       Hint: You will need Matrix.translate and Matrix.rotate
    //       Hint: axis and point are arrays. Use axis[0], axis[1], etc.
    //             to get their components
    var translate = Matrix.translate(-point[0], -point[1], -point[2]);
    var translate_back = Matrix.translate(point[0], point[1], point[2]);
    var rotationMatrix = Matrix.rotate(angle, axis[0], axis[1], axis[2]);
    var final = translate_back.multiply(rotationMatrix).multiply(translate);
    return final;
}

var Task3 = function(gl) {
    this.cameraAngle = 0;
    this.sphereMesh = new ShadedTriangleMesh(gl, SpherePositions, SphereNormals, SphereIndices, PhongVertexSource, PhongFragmentSource);
    this.cubeMesh = new ShadedTriangleMesh(gl, CubePositions, CubeNormals, CubeIndices, PhongVertexSource, PhongFragmentSource);
    
    gl.enable(gl.DEPTH_TEST);
}

Task3.prototype.render = function(gl, w, h) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    var angle = Date.now()/10;
    var projection = Matrix.perspective(35, w/h, 0.1, 100);
    var view =
        Matrix.translate(0, 0, -10).multiply(
        Matrix.rotate(this.cameraAngle, 1, 0, 0));
    
    var cubeModel = Matrix.translate(-2.7, 0, 0).multiply(
        rotateAroundAxisAtPoint([1, 1, 0], angle, [0, 0, 0])).multiply(
        Matrix.scale(1.5, 0.1, 0.1));
    
    var sphereModel = Matrix.translate(1.5, 0, 0).multiply(
        rotateAroundAxisAtPoint([0, 0, 1], angle, [1.2, 0, 0])).multiply(
        Matrix.scale(1.2, 1.2, 1.2));

    this.sphereMesh.render(gl, sphereModel, view, projection);
    this.cubeMesh.render(gl, cubeModel, view, projection);
}

Task3.prototype.dragCamera = function(dy) {
    this.cameraAngle = Math.min(Math.max(this.cameraAngle + dy*0.5, -90), 90);
}
