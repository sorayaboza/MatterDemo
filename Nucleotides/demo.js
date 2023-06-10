Matter.use('matter-attractors')

// Module aliases
var Engine = Matter.Engine,         // Manages updates for the world simulation.
    Render = Matter.Render,         // Visualizes instances of Matter.Engine. Intended for debugging.
    Runner = Matter.Runner,         // Provides a game loop, which handles continuous updates for Matter.Engine.
    Bodies = Matter.Bodies,         // Contains methods for creating rigid body models.
    Composite = Matter.Composite,   // Collection of Matter.Body, Matter.Constraint, and Matter.Composite. Container that represents complex objects made of multiple parts.
    Mouse = Matter.Mouse,           // Contains methods for creating and manipulating mouse inputs.
    MouseConstraint = Matter.MouseConstraint,   // Allow for user interaction, providing ability to move bodies via mouse or touch.
    Events = Matter.Events,        // Events emitted by objects created by MouseConstraint

    // A Constraint is an entity that connects two bodies.
    Constraint = Matter.Constraint // Constraints are used for specifying that a fixed distance must be maintained between two bodies.


// Create an engine
var engine = Engine.create(),
    world = engine.world // The root Composite that will contain all bodies, constraints and other composites to be simulated by the engine
    engine.world.gravity.y = 0.2; // Adjust the gravity value here

// Create a renderer
var render = Render.create({
    // Render properties
    element: document.body,
    engine: engine,
    options: {
        wireframes: false // Allows you to add more specific colors & adds random colors to circles
    }
})

// Add mouse control
var mouse = Mouse.create(render.canvas), // render.canvas: canvas element to render to
    mouseConstraint = MouseConstraint.create(
        // Render properties
        engine, 
    {   mouse: mouse,
        constraint: {
            stiffness: 0.2,
            render: {
                visible: false
            }
        }
    })

Composite.add(world, mouseConstraint) // Adds items to the given Composite

// Keep the mouse in sync with rendering
render.mouse = mouse

// Fit the render viewport to the scene
// lootAt: Positions and sizes viewport around the given objects.
Render.lookAt(render, {
    min: { x: 0, y: 0 },
    max: { x: 800, y: 600 }
})

// Storing all walls here
var walls = []
var forceBodies = []

// Creating a walls and pushing to walls
var ceiling = Bodies.rectangle(400, 0, 810, 60, { isStatic: true });
var left_wall = Bodies.rectangle(0, 610, 60, 1200, { isStatic: true});
var right_wall = Bodies.rectangle(800, 610, 60, 1200, { isStatic: true});
var ground = Bodies.rectangle(400, 610, 810, 60, { isStatic: true });

walls.push(ceiling)
walls.push(left_wall)
walls.push(right_wall)
walls.push(ground)

let strand = ["G", "A", "C", "A", "G", "U"];
let x = 0
// Create force shape
var forceShape = {
    plugin: {
        attractors: [
            // Determine force of attraction between bodies 1 and 2
            function (b1, b2) {
                var force = { x: 0, y: 0 };
                // GC pairs are the strongest.
                if ((b1.ntType == "G" && b2.ntType == "C") || (b2.ntType == "C" && b1.ntType == "C")) {
                    force.x = (b1.position.x - b2.position.x) * 0.0001;
                    force.y = (b1.position.y - b2.position.y) * 0.0001;
                }
                // AU pairs are medium strength.
                if ((b1.ntType == "U" && b2.ntType == "A") || (b2.ntType == "U" && b1.ntType == "A")) {
                    force.x = (b1.position.x - b2.position.x) * 0.00001;
                    force.y = (b1.position.y - b2.position.y) * 0.00001;
                }
                // GU pairs are the weakest.
                if ((b1.ntType == "U" && b2.ntType == "G") || (b2.ntType == "U" && b1.ntType == "G")) {
                    force.x = (b1.position.x - b2.position.x) * 0.000001;
                    force.y = (b1.position.y - b2.position.y) * 0.000001;
                }
                // Same types repel.
                if ((b1.ntType == "A" && b2.ntType == "A") || (b2.ntType == "G" && b1.ntType == "G") 
                || (b2.ntType == "C" && b1.ntType == "C") || (b2.ntType == "U" && b1.ntType == "U")) {
                    force.x = (b1.position.x - b2.position.x) * -1e-6;
                    force.y = (b1.position.y - b2.position.y) * -1e-6;
                }
                // All else repel.
                else {
                    force.x = (b1.position.x - b2.position.x) * -1e-6;
                    force.y = (b1.position.y - b2.position.y) * -1e-6;
                }
                return force;
            }
        ],
    },
};

var prev = null

// Creating attractive/repulsive circles
strand.forEach(nt => {
    // TODO: Add these to a chain rather than at random locations
    console.log(nt)
    let body = Bodies.circle(200, 100, 25, forceShape)
    body.ntType = nt 
    switch(nt) {
        case "A":
            body.render.fillStyle = "rgb(189, 9, 102)" // Red
            break;
        case "G":
            body.render.fillStyle = "rgb(9, 189, 90)" // Green
            break;
        case "U":
            body.render.fillStyle = "rgb(9, 132, 189)" // Blue
            break;  
        case "C":
            body.render.fillStyle = "rgb(242, 196, 89)" // Yellow
            break; 
    }
    forceBodies.push(body)

    if (prev) { // if prev exists,
        // Constraint options
        var options = {
            // Our bodies (circles)
            bodyA: body,
            bodyB: prev, // Conncting current circles to previous circle

            length: 50, // Pixel distance between bodies
            stiffness: 0.4 // Determines how much the constraint acts like a string vs a spring
        }
        var constraint = Constraint.create(options)
        Composite.add(engine.world, constraint)  // Adds constraint to the given Composite
    }
    prev = body
    
    // Add event listener to each circle
    Events.on(mouseConstraint, "mousedown", createClickListener(body));
});

// Function to handle the "mousedown" event for a specific circle
function createClickListener(circle) {
    return function (event) {
        var mousePosition = mouse.position;

        // Check if the clicked position is inside the circle
        if (Matter.Bounds.contains(circle.bounds, mousePosition)) {
            var currentColor = circle.render.fillStyle;
            var colors = ["rgb(242, 196, 89)", "rgb(189, 9, 102)", "rgb(9, 189, 90)", "rgb(9, 132, 189)"];
            var currentIndex = colors.indexOf(currentColor);
            var nextIndex = (currentIndex + 1) % colors.length;
            var nextColor = colors[nextIndex];

            // Change the circle's color
            circle.render.fillStyle = nextColor;
            circle.render.strokeStyle = nextColor;

            // Update the ntType based on the new color
            switch (nextColor) {
                case "rgb(189, 9, 102)": // Red
                    circle.ntType = "G";
                    break;
                case "rgb(9, 189, 90)": // Green
                    circle.ntType = "A";
                    break;
                case "rgb(9, 132, 189)": // Blue
                    circle.ntType = "T";
                    break;
                case "rgb(242, 196, 89)": // Yellow
                    circle.ntType = "C";
                    break;
            }
        }
    };
}



// Add all of the bodies to the world
Composite.add(world, walls)  // Adds array of rectangular Bodies to the given Composite
Composite.add(world, forceBodies)  // Adds force bodies to given Composite


Render.run(render)

var runner = Runner.create()

Runner.run(runner, engine)

// Run the renderer
Render.run(render)

// Create runner
var runner = Runner.create()

// Run the engine
Runner.run(runner, engine)