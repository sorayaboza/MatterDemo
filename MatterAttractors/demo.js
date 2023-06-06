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
    Constraint = Matter.Constraintm // Constraints are used for specifying that a fixed distance must be maintained between two bodies.


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

// Creating a walls and pushing to circles_array
var ceiling = Bodies.rectangle(400, 0, 810, 60, { isStatic: true });
var left_wall = Bodies.rectangle(0, 610, 60, 1200, { isStatic: true});
var right_wall = Bodies.rectangle(800, 610, 60, 1200, { isStatic: true});
var ground = Bodies.rectangle(400, 610, 810, 60, { isStatic: true });

walls.push(ceiling)
walls.push(left_wall)
walls.push(right_wall)
walls.push(ground)

// Create force shape
var forceShape = {
    plugin: {
        attractors: [
            function (forcefulBody, forcedBody) { // Function takes 2 inputs, both involved in force calculation
                var force = { x: 0, y: 0 }; // Initializing 'force' object to have x and y at 0
                if ((forcefulBody == bodyA && forcedBody == bodyB) || (forcefulBody == bodyB && forcedBody == bodyA)) {
                    force.x = (forcefulBody.position.x - forcedBody.position.x) * 0.00001;
                    force.y = (forcefulBody.position.y - forcedBody.position.y) * 0.00001;
                }
                if ((forcefulBody == bodyB && forcedBody == bodyC) || (forcefulBody == bodyC && forcedBody == bodyB)) {
                    force.x = (forcefulBody.position.x - forcedBody.position.x) * -1e-6;
                    force.y = (forcefulBody.position.y - forcedBody.position.y) * -1e-6;
                }
                if ((forcefulBody == bodyA && forcedBody == bodyC) || (forcefulBody == bodyC && forcedBody == bodyA)) {
                    force.x = (forcefulBody.position.x - forcedBody.position.x) * -1e-6;
                    force.y = (forcefulBody.position.y - forcedBody.position.y) * -1e-6;
                } 
                return force;
            }
        ],
    },
};

// Creating attractive/repulsive circles
var bodyA = Bodies.circle(200, 100, 25, forceShape)
var bodyB = Bodies.circle(200, 100, 25, forceShape)
var bodyC = Bodies.circle(200, 100, 25, forceShape)

forceBodies.push(bodyA)
forceBodies.push(bodyB)
forceBodies.push(bodyC)

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