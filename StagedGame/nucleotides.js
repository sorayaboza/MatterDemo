/* ------------------ ADUJUSTABLE PARAMETERS ------------------ */

let gravity = -1.4
let airFriction = 0.5

let GC_BOND_STRENGTH = 1e-4
let AU_BOND_STRENGTH = 1e-6
let GU_BOND_STRENGTH = 1e-7
let REPEL_BOND_STRENGTH = -1e-5


/* ------------------ BUTTON SELECTION ------------------ */
// Get references to the buttons
const buttonA = document.getElementById("buttonA");
const buttonU = document.getElementById("buttonU");
const buttonG = document.getElementById("buttonG");
const buttonC = document.getElementById("buttonC");

// Function to select a button and deselect others
function selectButton(selectedButton) {
    const buttons = [buttonA, buttonU, buttonG, buttonC];

    buttons.forEach((button) => {
        button.classList.remove("selected");
    });

    if (selectedButton == "none"){ return }

    selectedButton.classList.add("selected");
}

// Function to update the color and nt type of a given circle
function updateCircleNtType(circle, ntType, color) {
    circle.ntType = ntType;
    circle.render.fillStyle = color;
}

// Function to make buttons functional
function buttonPressed(selectedCircle) {
    buttonA.onclick = function(){
        updateCircleNtType(selectedCircle, "A", color.yellow);
        selectButton(buttonA)
    }
    buttonU.onclick = function(){
        updateCircleNtType(selectedCircle, "U", color.blue);
        selectButton(buttonU)
    }
    buttonG.onclick = function(){
        updateCircleNtType(selectedCircle, "G", color.red);
        selectButton(buttonG)
    }
    buttonC.onclick = function(){
        updateCircleNtType(selectedCircle, "C", color.green);
        selectButton(buttonC)
    }
}


/* ------------------ MATTER FUNCTIONS ------------------ */
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
    engine.world.gravity.y = gravity;

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
var ceiling = Bodies.rectangle(400, 0, 810, 60, { isStatic: true })
var leftWall = Bodies.rectangle(0, 610, 60, 1250, { isStatic: true})
var rightWall = Bodies.rectangle(800, 610, 60, 1250, { isStatic: true})
var ground = Bodies.rectangle(400, 610, 810, 60, { isStatic: true })

ceiling.render.lineWidth = 6
leftWall.render.lineWidth = 6
rightWall.render.lineWidth = 6
ground.render.lineWidth = 6

walls.push(ceiling)
walls.push(leftWall)
walls.push(rightWall)
walls.push(ground)

// Create force shape
var forceShape = {
    plugin: {
        attractors: [
            // Determine force of attraction between bodies 1 and 2
            function (b1, b2) {
                var force = { x: 0, y: 0 };
                // GC pairs are the strongest.
                if ((b1.ntType == "G" && b2.ntType == "C") || (b2.ntType == "G" && b1.ntType == "C")) {
                    force.x = (b1.position.x - b2.position.x) * GC_BOND_STRENGTH
                    force.y = (b1.position.y - b2.position.y) * GC_BOND_STRENGTH
                }
                // AU pairs are medium strength.
                if ((b1.ntType == "U" && b2.ntType == "A") || (b2.ntType == "U" && b1.ntType == "A")) {
                    force.x = (b1.position.x - b2.position.x) * AU_BOND_STRENGTH
                    force.y = (b1.position.y - b2.position.y) * AU_BOND_STRENGTH
                }
                // GU pairs are the weakest.
                if ((b1.ntType == "U" && b2.ntType == "G") || (b2.ntType == "U" && b1.ntType == "G")) {
                    force.x = (b1.position.x - b2.position.x) * GU_BOND_STRENGTH
                    force.y = (b1.position.y - b2.position.y) * GU_BOND_STRENGTH
                }
                // Same types repel.
                if ((b1.ntType == "A" && b2.ntType == "A") || (b2.ntType == "G" && b1.ntType == "G") 
                || (b2.ntType == "C" && b1.ntType == "C") || (b2.ntType == "U" && b1.ntType == "U")) {
                    force.x = (b1.position.x - b2.position.x) * REPEL_BOND_STRENGTH
                    force.y = (b1.position.y - b2.position.y) * REPEL_BOND_STRENGTH
                }
                return force;
            }
        ],
    },
};

var prev = null

var color = {
    yellow: "rgb(242, 196, 89)",
    blue:  "rgb(9, 132, 189)",
    red: "rgb(189, 9, 102)",
    green: "rgb(9, 189, 90)",
}

// Creating attractive/repulsive circles
strand.forEach(nt => {
    console.log(nt)
    let body = Bodies.circle(200, 100, 25, forceShape)
    body.ntType = nt 
    body.render.lineWidth = 6
    switch(nt) {
        case "A":
            body.render.fillStyle = color.yellow
            break;
        case "U":
            body.render.fillStyle = color.blue
            break;  
        case "G":
            body.render.fillStyle = color.red
            break;
        case "C":
            body.render.fillStyle = color.green
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

// Applying buoyancy
let applyBouyancy = body => {
    let waterPlaneY = 300
    let vy = body.position.y - waterPlaneY
    let distBetweenBodyAndWaterPlane = Math.sqrt(vy * vy)
    let force = 0.00008;
    if (distBetweenBodyAndWaterPlane < waterPlaneY) {
        body.timeScale = 1  // timeScale specifies per-body time scaling.
    } else {
        body.timeScale = 0.2
    }
    Matter.Body.setMass(body, 1);
    body.frictionAir = airFriction
    Matter.Body.applyForce(body, body.position, {
        x: 0,
        y: -distBetweenBodyAndWaterPlane * force
    })
}

// Sample a random normal distribution.
//  From https://stackoverflow.com/questions/25582882/javascript-math-random-normal-distribution-gaussian-bell-curve
function gaussianRandom(mean=0, stdev=1) {
    const u = 1 - Math.random(); // Converting [0,1) to (0,1]
    const v = Math.random();
    const z = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
    // Transform to the desired mean and standard deviation:
    return z * stdev + mean;
}

// Brownian motion
let brownianMotion = body => {
    Matter.Body.applyForce(body, body.position, {
        x: gaussianRandom(0, .15),
        y: gaussianRandom(0, .15)
    })
}

// Apply external forces
forceBodies.forEach(body => {
    applyBouyancy(body);
    brownianMotion(body);
});

var key = {
    a: 65,
    u: 85,
    g: 71,
    c: 67
}

var prevClickedCircle = null;

function createClickListener(circle) {
    return function (event) {
    var mousePosition = mouse.position;

    // Check if the click occurred outside the bounds of all circles
    var clickedOutsideCircles = forceBodies.every(function (circle) {
        return !Matter.Bounds.contains(circle.bounds, mousePosition);
    });
    // If a user clicks outside of the circles, the circles will be unselected
    if (clickedOutsideCircles) {
        selectButton("none")
        // Restore opacity of all circles
        forceBodies.forEach(function (circle) {
          circle.render.strokeStyle = 'black'
          circle.render.lineWidth = 6
        });
        prevClickedCircle = null;
    }
    
    // If user clicks a circle,
    if (Matter.Bounds.contains(circle.bounds, mousePosition)) {
        buttonPressed(circle)
        // Restore opacity of the previously clicked circle
        if (prevClickedCircle) {
            selectButton("none")
            prevClickedCircle.render.strokeStyle = 'black'
            prevClickedCircle.render.lineWidth = 6
        }
        circle.render.strokeStyle = 'white' // Change line color to white
        circle.render.lineWidth = 8
        prevClickedCircle = circle;

        document.onkeydown = function (e) {
            switch (e.keyCode) {
            case key.a:
                updateCircleNtType(circle, "A", color.yellow);
                selectButton(buttonA)
                break;
            case key.u:
                updateCircleNtType(circle, "U", color.blue);
                selectButton(buttonU)
                break;
            case key.g:
                updateCircleNtType(circle, "G", color.red);
                selectButton(buttonG)
                break;
            case key.c:
                updateCircleNtType(circle, "C", color.green);
                selectButton(buttonC)
                break;
            default:
                return;
            }
        };
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