var Bone = function(parent, position, scale, jointLocation, jointAxis) {
    this.parent = parent;
    this.position = position;
    this.scale = scale;
    this.jointLocation = jointLocation;
    this.jointAxis = jointAxis;
    this.jointAngle = 0;
}

Bone.prototype.setJointAngle = function(angle) {
    this.jointAngle = angle;
}
Bone.prototype.computePoseMatrix = function() {
    
    var rotation = rotateAroundAxisAtPoint(this.jointAxis, this.jointAngle, this.jointLocation);
    var translation = Matrix.translate(this.position[0], this.position[1], this.position[2]);
    //       If this.parent is not null, you should also apply the pose matrix of the parent
    //       to get a hierarchical transform
    var final = translation.multiply(rotation);
    if(this.parent != null){
        var parent_pose = this.parent.computePoseMatrix();
        final = parent_pose.multiply(final);
    }
    return final;
}
Bone.prototype.computeModelMatrix = function() {

    var scale_mat = Matrix.scale(this.scale[0], this.scale[1], this.scale[2]);
    var final =  this.computePoseMatrix().multiply(scale_mat);
    return final;
}

var Task4 = function(gl) {
    this.cameraAngle = 0;
    this.mesh = new ShadedTriangleMesh(gl, CubePositions, CubeNormals, CubeIndices, PhongVertexSource, PhongFragmentSource);
    
    var hip       = new Bone(     null, [0,    1.5, 0  ], [0.5,  0.3, 0.2], [0, 0,    0   ], [0, 1, 0]);
    var leftThigh = new Bone(      hip, [0.5, -1.1, 0.1], [0.1,  0.7, 0.1], [0, 0.7,  0   ], [1, 0, 0]);
    var leftShin  = new Bone(leftThigh, [0,   -1.5, 0  ], [0.1,  0.7, 0.1], [0, 0.7,  0   ], [1, 0, 0]);
    var leftFoot  = new Bone( leftShin, [0,   -0.9, 0.2], [0.15, 0.1, 0.3], [0, 0.1, -0.25], [1, 0, 0]);
    
    this.bones = [hip, leftThigh, leftShin, leftFoot];
    
    gl.enable(gl.DEPTH_TEST);
}

Task4.prototype.setJointAngle = function(boneIndex, angle) {
    this.bones[boneIndex].setJointAngle(angle);
}

Task4.prototype.render = function(gl, w, h) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    var projection = Matrix.perspective(60, w/h, 0.1, 100);
    var view =
        Matrix.translate(0, 0, -5).multiply(
        Matrix.rotate(this.cameraAngle, 1, 0, 0));
    
    for (var i = 0; i < this.bones.length; ++i) {
        var model = this.bones[i].computeModelMatrix();
        
        this.mesh.render(gl, model, view, projection);
    }
}

Task4.prototype.dragCamera = function(dy) {
    this.cameraAngle = Math.min(Math.max(this.cameraAngle + dy*0.5, -90), 90);
}
