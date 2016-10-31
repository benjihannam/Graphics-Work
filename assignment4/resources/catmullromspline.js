// Class definition for a Catmull-Rom spline
var CatmullRomSpline = function(canvasId)
{
    // Set up all the data related to drawing the curve
    this.cId = canvasId;
    this.dCanvas = document.getElementById(this.cId);
    this.ctx = this.dCanvas.getContext('2d');
    this.dCanvas.addEventListener('resize', this.computeCanvasSize());
    this.computeCanvasSize();
    
    // Setup all the data related to the actual curve.
    this.nodes = new Array();
    this.showControlPolygon = true;
    this.showTangents = true;
    
    // Assumes a equal parametric split strategy
    // In case of using Bezier De Casteljau code, add appropriate variables.
    this.numSegments = 16;
    
    // Global tension parameter
    // Undergrads - ignore this value.
    this.tension = 0.5;
    
    // Setup event listeners
    this.cvState = CVSTATE.Idle;
    this.activeNode = null;
    
    // closure
    var that = this;
    
    // Event listeners
    this.dCanvas.addEventListener('mousedown', function(event) {
        that.mousePress(event);
    });
    
    this.dCanvas.addEventListener('mousemove', function(event) {
        that.mouseMove(event);
    });
    
    this.dCanvas.addEventListener('mouseup', function(event) {
        that.mouseRelease(event);
    });
    
    this.dCanvas.addEventListener('mouseleave', function(event) {
        that.mouseRelease(event);
    });
}

// Mutator methods.
CatmullRomSpline.prototype.setShowControlPolygon = function(bShow)
{
    this.showControlPolygon = bShow;
}

CatmullRomSpline.prototype.setShowTangents = function(bShow)
{
    this.showTangents = bShow;
}

CatmullRomSpline.prototype.setTension = function(val)
{
    this.tension = val;
}

CatmullRomSpline.prototype.setNumSegments = function(val)
{
    this.numSegments = val;
}

// Event handlers.
CatmullRomSpline.prototype.mousePress = function(event)
{
    if (event.button == 0) {
        this.activeNode = null;
        var pos = getMousePos(event);

        // Try to find a node below the mouse
        for (var i = 0; i < this.nodes.length; i++) {
            if (this.nodes[i].isInside(pos.x,pos.y)) {
                this.activeNode = this.nodes[i];
                break;
            }
        }
    }

    // No node selected: add a new node
    if (this.activeNode == null) {
        this.addNode(pos.x,pos.y);
        this.activeNode = this.nodes[this.nodes.length-1];
    }

    this.cvState = CVSTATE.SelectPoint;
    event.preventDefault();
}

CatmullRomSpline.prototype.mouseMove = function(event) {
    if (this.cvState == CVSTATE.SelectPoint || this.cvState == CVSTATE.MovePoint) {
        var pos = getMousePos(event);
        this.activeNode.setPos(pos.x,pos.y);
    } else {
        // No button pressed. Ignore movement.
    }
}

CatmullRomSpline.prototype.mouseRelease = function(event)
{
    this.cvState = CVSTATE.Idle; this.activeNode = null;
}

// Utility methods.
CatmullRomSpline.prototype.computeCanvasSize = function() 
{
    var renderWidth = Math.min(this.dCanvas.parentNode.clientWidth - 20, 820);
    var renderHeight = Math.floor(renderWidth*9.0/16.0);
    this.dCanvas.width = renderWidth;
    this.dCanvas.height = renderHeight;
}

CatmullRomSpline.prototype.drawControlPolygon = function()
{
    for (var i = 0; i < this.nodes.length-1; i++)
        drawLine(this.ctx, this.nodes[i].x, this.nodes[i].y,
                      this.nodes[i+1].x, this.nodes[i+1].y);
}

CatmullRomSpline.prototype.drawControlPoints = function()
{
    for (var i = 0; i < this.nodes.length; i++)
        this.nodes[i].draw(this.ctx);
}

// TODO: Task 4
CatmullRomSpline.prototype.drawTangents = function()
{
    // Note: Tangents are available only for 2,..,n-1 nodes. The tangent is not defined for 1st and nth node.
    // Compute tangents from (i+1) and (i-1) node
    //loop from 2nd to n-1 node
    for(var i = 1; i < this.nodes.length - 1; i++){
        // get the x and y directions
        var x = (this.nodes[i + 1].x - this.nodes[i - 1].x)/2.0;
        var y = (this.nodes[i + 1].y - this.nodes[i - 1].y)/2.0;
        //normalize
        var size = Math.sqrt(x*x + y*y);
        //the the points 50 pixels along
        qx = this.nodes[i].x + x/size*50;
        qy= this.nodes[i].y + y/size*50;
        //draw the line
        setColors(this.ctx,'rgb(250,10,10)');
        drawLine(this.ctx, this.nodes[i].x, this.nodes[i].y, qx, qy);
    }
}

// TODO: Task 5
CatmullRomSpline.prototype.draw = function()
{
    //NOTE: You can either implement the equal parameter split strategy or recursive bezier draw for drawing the spline segments
    //NOTE: If you're a grad student, you will have to employ the tension parameter to draw the curve (see assignment description for more details)
    //Hint: Once you've computed the segments of the curve, draw them using the drawLine() function
    
    var tension = this.tension;
    var n = this.numSegments;
    //loop over the nodes
    for(var i = 1; i < this.nodes.length - 2; i++){

        //get the 4 nodes
        var p1 = this.nodes[i-1];
        var p2 = this.nodes[i];
        var p3 = this.nodes[i+1];
        var p4 = this.nodes[i+2];

        //set up the initial first point
        var x1 = this.nodes[i].x;
        var y1 = this.nodes[i].y;

        //loop over the segments
        for(var j = 0; j < this.numSegments; j++){
            var t = j/ this.numSegments;

            //get the x and y values using the tension and t
            var x = (-tension*t + 2*tension*t*t - tension*t*t*t)*p1.x 
                    + (1 + (tension - 3)*t*t + (2-tension)*t*t*t)*p2.x
                    + (tension*t + (3 - 2*tension)*t*t + (tension - 2) *t*t*t)*p3.x
                    +(-tension*t*t + tension*t*t*t)*p4.x;

            var y = (-tension*t + 2*tension*t*t - tension*t*t*t)*p1.y 
                    + (1 + (tension - 3)*t*t + (2-tension)*t*t*t)*p2.y
                    + (tension*t + (3 - 2*tension)*t*t + (tension - 2) *t*t*t)*p3.y
                    +(-tension*t*t + tension*t*t*t)*p4.y;

            //draw the line
            setColors(this.ctx,'rgb(0,10,10)');
            drawLine(this.ctx, x1, y1, x, y);
            x1 = x;
            y1 = y; 
        }
        //draw to the final node
        setColors(this.ctx,'rgb(0,10,10)');
        drawLine(this.ctx, x1, y1, this.nodes[i+1].x, this.nodes[i+1].y);

    }
}

// NOTE: Task 4 code.
CatmullRomSpline.prototype.drawTask4 = function()
{
    // clear the rect
    this.ctx.clearRect(0, 0, this.dCanvas.width, this.dCanvas.height);
    
    if (this.showControlPolygon) {
        // Connect nodes with a line
        setColors(this.ctx,'rgb(10,70,160)');
        for (var i = 1; i < this.nodes.length; i++) {
            drawLine(this.ctx, this.nodes[i-1].x, this.nodes[i-1].y, this.nodes[i].x, this.nodes[i].y);
        }
        // Draw nodes
        setColors(this.ctx,'rgb(10,70,160)','white');
        for (var i = 0; i < this.nodes.length; i++) {
            this.nodes[i].draw(this.ctx);
        }
    }

    // We need atleast 4 points to start rendering the curve.
    if(this.nodes.length < 4) return;
    
    // draw all tangents
    if(this.showTangents)
        this.drawTangents();
}

// NOTE: Task 5 code.
CatmullRomSpline.prototype.drawTask5 = function()
{
    // clear the rect
    this.ctx.clearRect(0, 0, this.dCanvas.width, this.dCanvas.height);
    
    if (this.showControlPolygon) {
        // Connect nodes with a line
        setColors(this.ctx,'rgb(10,70,160)');
        for (var i = 1; i < this.nodes.length; i++) {
            drawLine(this.ctx, this.nodes[i-1].x, this.nodes[i-1].y, this.nodes[i].x, this.nodes[i].y);
        }
        // Draw nodes
        setColors(this.ctx,'rgb(10,70,160)','white');
        for (var i = 0; i < this.nodes.length; i++) {
            this.nodes[i].draw(this.ctx);
        }
    }

    // We need atleast 4 points to start rendering the curve.
    if(this.nodes.length < 4) return;
    
    // Draw the curve
    this.draw();
    
    if(this.showTangents)
        this.drawTangents();
}

// Add a contro point to the Bezier curve
CatmullRomSpline.prototype.addNode = function(x,y)
{
    this.nodes.push(new Node(x,y));
}
