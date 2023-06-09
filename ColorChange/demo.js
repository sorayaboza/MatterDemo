// Module aliases
var Engine = Matter.Engine,         // Manages updates for the world simulation.
    Render = Matter.Render,         // Visualizes instances of Matter.Engine. Intended for debugging.
    Runner = Matter.Runner,         // Provides a game loop, which handles continuous updates for Matter.Engine.
    Bodies = Matter.Bodies,         // Contains methods for creating rigid body models.
    Composite = Matter.Composite,   // Collection of Matter.Body, Matter.Constraint, and Matter.Composite. Container that represents complex objects made of multiple parts.
    Mouse = Matter.Mouse,           // Contains methods for creating and manipulating mouse inputs.
    MouseConstraint = Matter.MouseConstraint,   // Allow for user interaction, providing ability to move bodies via mouse or touch.
    Events = Matter.Events         // Events emitted by objects created by MouseConstraint


// Create an engine
var engine = Engine.create(),
    world = engine.world // The root Composite that will contain all bodies, constraints and other composites to be simulated by the engine

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

// Storing all created circles in circles_array
var circles_array = []

// Creating a ground/walls and pushing to circles_array
var ground = Bodies.rectangle(400, 610, 810, 60, { isStatic: true });
var left_wall = Bodies.rectangle(0, 610, 60, 810, { isStatic: true});
var right_wall = Bodies.rectangle(800, 610, 60, 810, { isStatic: true});
var circle = Bodies.circle(400, 200, 90, 90) // creating a circle
circles_array.push(ground)
circles_array.push(left_wall)
circles_array.push(right_wall)
circles_array.push(circle)

// Add all of the bodies to the world
Composite.add(engine.world, circles_array)  // Adds array of Bodies to the given Composite

Render.run(render)

var runner = Runner.create()

Runner.run(runner, engine)

// Add event listener for click event
render.canvas.addEventListener('mousedown', function(event) {
    var mousePosition = mouse.position;
    
    // Check if the clicked position is inside the circle
    if (Matter.Bounds.contains(circle.bounds, mousePosition)) {
        // Generate a random color
        var color = getRandomColor();
        
        // Change the circle's color
        circle.render.fillStyle = color;
        circle.render.strokeStyle = color;
    }
});

// Function to generate a random color
function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// Run the renderer
Render.run(render)

// Create runner
var runner = Runner.create()

// Run the engine
Runner.run(runner, engine)