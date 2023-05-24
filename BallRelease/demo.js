// module aliases
var Engine = Matter.Engine,         // Manages updates for the world simulation.
    Render = Matter.Render,         // Visualizes instances of Matter.Engine. Intended for debugging.
    Runner = Matter.Runner,         // Provides a game loop, which handles continuous updates for Matter.Engine.
    Bodies = Matter.Bodies,         // Contains methods for creating rigid body models.
    Composite = Matter.Composite,   // Collection of Matter.Body, Matter.Constraint, and Matter.Composite. Container that represents complex objects made of multiple parts.
    Mouse = Matter.Mouse,           // Contains methods for creating and manipulating mouse inputs.
    MouseConstraint = Matter.MouseConstraint,   // Allow for user interaction, providing ability to move bodies via mouse or touch.
    Events = Matter.Events         // Events emitted by objects created by MouseConstraint


// create an engine
var engine = Engine.create(),
    world = engine.world // the root Composite that will contain all bodies, constraints and other composites to be simulated by the engine

// create a renderer
var render = Render.create({
    // render properties
    element: document.body,
    engine: engine,
    options: {
        wireframes: false // allows you to add more specific colors & adds random colors to circles
    }
})

// add mouse control
var mouse = Mouse.create(render.canvas), // render.canvas: canvas element to render to
    mouseConstraint = MouseConstraint.create(
        // render properties
        engine, 
    {   mouse: mouse,
        constraint: {
            stiffness: 0.2,
            render: {
                visible: false
            }
        }
    })

Composite.add(world, mouseConstraint) // adds items to the given Composite

// keep the mouse in sync with rendering
render.mouse = mouse

// fit the render viewport to the scene
// lootAt: Positions and sizes viewport around the given objects.
Render.lookAt(render, {
    min: { x: 0, y: 0 },
    max: { x: 800, y: 600 }
})

// storing all created circles in circles_array
var circles_array = []

// creating a ground/walls and pushing to circles_array
var ground = Bodies.rectangle(400, 610, 810, 60, { isStatic: true });
var left_wall = Bodies.rectangle(0, 610, 60, 810, { isStatic: true});
var right_wall = Bodies.rectangle(800, 610, 60, 810, { isStatic: true});
circles_array.push(ground)
circles_array.push(left_wall)
circles_array.push(right_wall)

function generateCircle() {
    // creating a circle
    var circle = Bodies.circle(400, 200, 40, 40)
    circles_array.push(circle)

    // add all of the bodies to the world
    Composite.add(engine.world, circles_array)  // adds array of Bodies to the given Composite
}
console.log(circles_array)

// run the renderer
Render.run(render)

// create runner
var runner = Runner.create()

// run the engine
Runner.run(runner, engine)