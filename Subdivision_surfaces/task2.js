function catmullClarkSubdivision(vertices, faces) {
    var newVertices = [];
    var newFaces = [];
    
    var edgeMap = {};
    // This function tries to insert the centroid of the edge between
    // vertices a and b into the newVertices array.
    // If the edge has already been inserted previously, the index of
    // the previously inserted centroid is returned.
    // Otherwise, the centroid is inserted and its index returned.
    function getOrInsertEdge(a, b, centroid) {
        var edgeKey = a < b ? a + ":" + b : b + ":" + a;
        if (edgeKey in edgeMap) {
            return edgeMap[edgeKey];
        } else {
            var idx = newVertices.length;
            newVertices.push(centroid);
            edgeMap[edgeKey] = idx;
            return idx;
        }
    }
    
    // TODO: Implement a function that computes one step of the Catmull-Clark subdivision algorithm.
    //
    // Input:
    // `vertices`: An array of Vectors, describing the positions of every vertex in the mesh
    // `faces`: An array of arrays, specifying a list of faces. Every faces is a list of vertex
    //          indices, specifying its corners. Faces may contain an arbitrary number
    //          of vertices (expect triangles, quadrilaterals, etc.)
    //
    // Output: Fill in newVertices and newFaces with the vertex positions and
    //         and faces after one step of Catmull-Clark subdivision.
    // It should hold:
    //         newFaces[i].length == 4, for all i
    //         (even though the input may consist of any of triangles, quadrilaterals, etc.,
    //          Catmull-Clark will always output quadrilaterals)
    //
    // Pseudo code follows:

    // ************************************
    // ************** Step 1 **************
    // ******** Linear subdivision ********
    // ************************************
    // for v in vertices:
    //      addVertex(v.clone())
    for(var v = 0; v < vertices.length; v++){
        var clone = new Vector(vertices[v].x, vertices[v].y, vertices[v].z);
        newVertices.push(clone);
    }

    // for face in faces:
    //      facePointIndex = addVertex(centroid(face))
    //      for v1 in face:
    //          v0 = previousVertex(face, v1)
    //          v2 = nextVertex(face, v1)
    //          edgePointA = getOrInsertEdge(v0, v1, centroid(v0, v1))
    //          edgePointB = getOrInsertEdge(v1, v2, centroid(v1, v2))
    //          addFace(facePointIndex, edgePointA, v1, edgePointB)

    //loop over the faces
    for(var j = 0; j < faces.length; j++){
        var current_face = faces[j];
        //get the face centroid

        var centroid = new Vector(0.0,0.0,0.0);
        for(var v = 0; v < current_face.length; v++){
            centroid = centroid.add(vertices[current_face[v]]);
        }
        centroid = centroid.divide(current_face.length);
        //get the index and insert
        var facePointIndex = newVertices.length;
        newVertices.push(centroid);

        //loop over the vertices in the face
        for(var i = 0; i < current_face.length; i++){

            var prev = (i - 1)%faces[j].length;
            var next = (i+1)%faces[j].length;
            if(prev < 0){
                prev += faces[j].length;
            }

            //get the vertices
            var v0 = newVertices[current_face[prev]];
            var v1 = newVertices[current_face[i]];
            var v2 = newVertices[current_face[next]];
           

            //get the a centroid
            var a_centroid = new Vector()
            var a_centroid = v0.add(v1);
            var a_centroid = a_centroid.divide(4.0);
  
            //get the b centroid
            var b_centroid = new Vector();
            var b_centroid = v1.add(v2);
            var b_centroid = b_centroid.divide(4.0);
            
            //put the indeices
            var edgePointA = getOrInsertEdge(current_face[prev], current_face[i], a_centroid);
            var edgePointB = getOrInsertEdge(current_face[i], current_face[next], b_centroid);
            
            //add the face
            newFaces.push([facePointIndex, edgePointA, current_face[i], edgePointB])
        }
    }
    
    // ************************************
    // ************** Step 2 **************
    // ************ Averaging *************
    // ************************************
    // avgV = []
    // avgN = []
    // for i < len(newVertices):
    //      append(avgV, new Vector(0, 0, 0))
    //      append(avgN, 0)
    // for face in newFaces:
    //      c = centroid(face)
    //      for v in face:
    //          avgV[v] += c
    //          avgN[v] += 1
    //
    // for i < len(avgV):
    //      avgV[i] /= avgN[i]

    var avgV = [];
    var avgN = [];

    //loop over the new vertices
    for(i = 0; i < newVertices.length; i++){
        avgV.push(new Vector(0.0,0.0,0.0));
        avgN.push(0);
    }

    //loop over the new faces
    for(var i = 0; i < newFaces.length; i++){

        var current_face = newFaces[i];

        //get the centroid for the face
        var c = new Vector(0,0,0);
        for(var v = 0; v < current_face.length; v++){
            c = c.add(newVertices[current_face[v]]);
        }
        c = c.divide(current_face.length);
        
        //
        for(var v = 0; v < current_face.length; v++){
            avgV[current_face[v]] = avgV[current_face[v]].add(c);
            avgN[current_face[v]] = avgN[current_face[v]] + 1.0;
        }
    }

    for(var i = 0; i < avgV.length; i++){
        console.log("after", avgN[i]);
        avgV[i] = avgV[i].divide(avgN[i]);
        
    }
    
    // ************************************
    // ************** Step 3 **************
    // ************ Correction ************
    // ************************************
    // for i < len(avgV):
    //      newVertices[i] = lerp(newVertices[i], avgV[i], 4/avgN[i])

    for(var i = 0; i < avgV.length; i++){
        newVertices[i] = Vector.lerp(newVertices[i], avgV[i], 4/avgN[i]);
        
    }
    //console.log("after", newVertices);
    
    
    // Do not remove this line
    return new Mesh(newVertices, newFaces);
};

function extraCreditMesh() {
    // TODO: Insert your own creative mesh here
    var vertices = [
        new Vector( 0,  1,  0),
        new Vector(-1, -1,  0),
        new Vector( 0, -1, -1),
        new Vector( 1, -1,  0),
        new Vector( 0, -1,  1)
    ];
    
    var faces = [
        [0, 1, 2],
        [0, 2, 3],
        [0, 3, 4],
        [0, 4, 1],
        [1, 2, 3, 4]
    ];
    
    return new Mesh(vertices, faces);
}

var Task2 = function(gl) {
    this.pitch = 0;
    this.yaw = 0;
    this.subdivisionLevel = 0;
    this.selectedModel = 0;
    this.gl = gl;
    
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    
    this.baseMeshes = [];
    for (var i = 0; i < 6; ++i)
        this.baseMeshes.push(this.baseMesh(i).toTriangleMesh(gl));
    
    this.computeMesh();
}

Task2.prototype.setSubdivisionLevel = function(subdivisionLevel) {
    this.subdivisionLevel = subdivisionLevel;
    this.computeMesh();
}

Task2.prototype.selectModel = function(idx) {
    this.selectedModel = idx;
    this.computeMesh();
}

Task2.prototype.baseMesh = function(modelIndex) {
    switch(modelIndex) {
    case 0: return createCubeMesh(); break;
    case 1: return createTorus(8, 4, 0.5); break;
    case 2: return createSphere(4, 3); break;
    case 3: return createIcosahedron(); break;
    case 4: return createOctahedron(); break;
    case 5: return extraCreditMesh(); break;
    }
    return null;
}

Task2.prototype.computeMesh = function() {
    var mesh = this.baseMesh(this.selectedModel);
    
    for (var i = 0; i < this.subdivisionLevel; ++i)
        mesh = catmullClarkSubdivision(mesh.vertices, mesh.faces);
    
    this.mesh = mesh.toTriangleMesh(this.gl);
}

Task2.prototype.render = function(gl, w, h) {
    gl.viewport(0, 0, w, h);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    var projection = Matrix.perspective(35, w/h, 0.1, 100);
    var view =
        Matrix.translate(0, 0, -5).multiply(
        Matrix.rotate(this.pitch, 1, 0, 0)).multiply(
        Matrix.rotate(this.yaw, 0, 1, 0));
    var model = new Matrix();
    
    if (this.subdivisionLevel > 0)
        this.baseMeshes[this.selectedModel].render(gl, model, view, projection, false, true, new Vector(0.7, 0.7, 0.7));

    this.mesh.render(gl, model, view, projection);
}

Task2.prototype.dragCamera = function(dx, dy) {
    this.pitch = Math.min(Math.max(this.pitch + dy*0.5, -90), 90);
    this.yaw = this.yaw + dx*0.5;
}
