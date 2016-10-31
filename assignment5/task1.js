function bezierPatchTesselation(patch, tesselation) {
    // TODO: Implement a function that tesselates a cubic bezier patch
    //       into `tesselation` x `tesselation` quadrilaterals.
    //
    // Input:
    //  `patch`: A 4 x 4 array of control vertices.
    //           patch[i][j] is the position of the j'th vertex of the i'th control curve
    //           Positions are given as Vectors
    //  `tesselation`: Number of output quadrilaterals per side
    //
    // Output: Fill in `vertices` and `faces` with the results.
    // `vertices` should be an array of vectors, specifying the vertex positions of the tesselated patch
    // `faces` should be a list of quadrilaterals. Quadrilaterals are specified by the
    //  vertex indices of its four corners
    // For example,
    //      faces = [
    //          [quad0_index0, quad0_index1, quad0_index2, quad0_index3],
    //          [quad1_index0, quad1_index1, quad1_index2, quad1_index3],
    //          .....
    //      ];
    //
    // It should hold:
    //      vertices.length == (tesselation + 1)*(tesselation + 1)
    //      faces.length == tesselation*tesselation
    //      faces[i].length == 4, for all i
    
    
    // The following is dummy code to display the corners of the bezier patch
    // Replace this with your cubic bezier implementation
    var vertices = [];
    var faces = [];

    //get the vertices
    for(var u = 0.0; u < 1.0 + tesselation; u++){
        for(var v = 0.0; v < 1.0 + tesselation; v++){
            var new_u = u /tesselation;
            var new_v = v /tesselation;
            var point = evaluatePatch(patch, new_u, new_v);
            vertices.push(point);
            
            
        }
        
    }
    
    //get the faces
    for(var i = 0; i < tesselation; i++ ){
        for(var j = 0; j < tesselation; j++){
            faces.push([i*(tesselation+1) + j, i*(tesselation+1) + j+1, (i+1)*(tesselation+1) + j + 1, (i+1)*(tesselation+1) + j]);
        }
    }
    // Do not remove this line
    return {'vertices': vertices, 'faces': faces};
};

function cubicBezier(p0, p1, p2, p3, t) {
    var s = 1.0 - t;
    return s*s*s*p0 + 3.0*t*s*s*p1 + 3.0*t*t*s*p2 + t*t*t*p3;
}

function vector_cubic_bezier(p0, p1, p2, p3, t){
    var x = cubicBezier(p0.x, p1.x, p2.x, p3.x, t);
    var y = cubicBezier(p0.y, p1.y, p2.y, p3.y, t);
    var z = cubicBezier(p0.z, p1.z, p2.z, p3.z, t);

    var vec = new Vector(x, y, z);
    return vec;
}
function evaluatePatch(patch, u , v){ 
    var point0 = vector_cubic_bezier(patch[0][0], patch[0][1], patch[0][2], patch[0][3], u);
    var point1 = vector_cubic_bezier(patch[1][0], patch[1][1], patch[1][2], patch[1][3], u);
    var point2 = vector_cubic_bezier(patch[2][0], patch[2][1], patch[2][2], patch[2][3], u);
    var point3 = vector_cubic_bezier(patch[3][0], patch[3][1], patch[3][2], patch[3][3], u);

    return vector_cubic_bezier(point0, point1, point2, point3, v);
}

var Task1 = function(gl) {
    this.pitch = 0;
    this.yaw = 0;
    this.selectedModel = 0;
    this.subdivisionLevel = 1;
    this.gl = gl;
    
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    
    this.controlCages = [
        this.buildDebugPatch(),
        {'vertices': TeapotVertices, 'patches': TeapotPatches}
    ];
    
    this.wireCages = [];
    for (var i = 0; i < this.controlCages.length; ++i)
        this.wireCages.push(this.buildWireCage(this.controlCages[i]));
}

Task1.prototype.buildDebugPatch = function() {
    var transform = Matrix.rotate(25, 1, 0, 0).multiply(Matrix.rotate(45, 0, 1, 0));

    var vertices = [];
    var coords = [-1.5, -0.5, 0.5, 1.5];
    var height = [0, 1, 1, 0]
    for (var i = 0; i < 4; ++i)
        for (var j = 0; j < 4; ++j)
            vertices.push(transform.transformPoint(new Vector(coords[i], height[i]*height[j], coords[j])));
    
    var patch = [
         0,  1,  2,  3,
         4,  5,  6,  7,
         8,  9, 10, 11,
        12, 13, 14, 15
    ];
    
    return {'vertices': vertices, 'patches': [patch]};
}

Task1.prototype.buildWireCage = function(cage) {
    var vertices = [];
    var faces = [];
    for (var i = 0; i < cage.patches.length; ++i) {
        for (var m = 0; m < 3; ++m) {
            for (var n = 0; n < 3; ++n) {
                faces.push([
                    vertices.length + (m + 0)*4 + (n + 0),
                    vertices.length + (m + 0)*4 + (n + 1),
                    vertices.length + (m + 1)*4 + (n + 1),
                    vertices.length + (m + 1)*4 + (n + 0)
                ]);
            }
        }
        for (var j = 0; j < 16; ++j)
            vertices.push(cage.vertices[cage.patches[i][j]]);
    }
    
    return new Mesh(vertices, faces, false).toTriangleMesh(this.gl);
}

Task1.prototype.setSubdivisionLevel = function(subdivisionLevel) {
    this.subdivisionLevel = subdivisionLevel;
    this.computeMesh();
}

Task1.prototype.selectModel = function(idx) {
    this.selectedModel = idx;
    this.computeMesh();
}

Task1.prototype.computeMesh = function() {
    var vertices = [];
    var faces = [];
    
    var cage = this.controlCages[this.selectedModel];
    for (var i = 0; i < cage.patches.length; ++i) {
        var patch = [];
        for (var m = 0; m < 4; ++m) {
            patch.push([]);
            for (var n = 0; n < 4; ++n)
                patch[m].push(cage.vertices[cage.patches[i][m*4 + n]].clone());
        }
        
        var result = bezierPatchTesselation(patch, this.subdivisionLevel);
        for (var j = 0; j < result.faces.length; ++j)
            for (var k = 0; k < result.faces[j].length; ++k)
                result.faces[j][k] += vertices.length;
        
        vertices = vertices.concat(result.vertices);
        faces = faces.concat(result.faces);
    }
    
    this.mesh = new Mesh(vertices, faces, false).toTriangleMesh(this.gl);
}

Task1.prototype.render = function(gl, w, h) {
    gl.viewport(0, 0, w, h);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    var projection = Matrix.perspective(35, w/h, 0.1, 100);
    var view =
        Matrix.translate(0, 0, -5).multiply(
        Matrix.rotate(this.pitch, 1, 0, 0)).multiply(
        Matrix.rotate(this.yaw, 0, 1, 0));
    var model = new Matrix();
    
    this.wireCages[this.selectedModel].render(gl, model, view, projection, false, true, new Vector(0.7, 0.7, 0.7));

    this.mesh.render(gl, model, view, projection);
}

Task1.prototype.dragCamera = function(dx, dy) {
    this.pitch = Math.min(Math.max(this.pitch + dy*0.5, -90), 90);
    this.yaw = this.yaw + dx*0.5;
}
