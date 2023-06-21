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
    //engine.world.gravity.y = 0.0; // Adjust the gravity value here

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

let strand = ["A", "A", "G", "A", "C", "U", "U", "C"];

let GC_BOND_STRENGTH = 1e-4
let AU_BOND_STRENGTH = 1e-6
let GU_BOND_STRENGTH = 1e-7
let REPEL_BOND_STRENGTH = -1e-5

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
        // Restore opacity of all circles
        forceBodies.forEach(function (circle) {
          circle.render.opacity = 1;
        });
        prevClickedCircle = null;
    }
    
    if (Matter.Bounds.contains(circle.bounds, mousePosition)) {
        // Restore opacity of the previously clicked circle
        if (prevClickedCircle) {
            prevClickedCircle.render.opacity = 1;
        }

        circle.render.opacity = 0.5; // Lower the opacity of the currently clicked circle
        prevClickedCircle = circle;

        document.onkeydown = function (e) {
            switch (e.keyCode) {
            case key.a:
                updateCircleNtType(circle, "A", color.yellow);
                break;
            case key.u:
                updateCircleNtType(circle, "U", color.blue);
                break;
            case key.g:
                updateCircleNtType(circle, "G", color.red);
                break;
            case key.c:
                updateCircleNtType(circle, "C", color.green);
                break;
            default:
                return;
            }
        };

        function updateCircleNtType(circle, ntType, color) {
            circle.ntType = ntType;
            circle.render.fillStyle = color;
        }
        }
    };
}
   

// Helper function to darken a given color
function selectColor(color) {
    // Convert the color string to RGB values
    var rgb = color.match(/\d+/g);
    var r = parseInt(rgb[0]);
    var g = parseInt(rgb[1]);
    var b = parseInt(rgb[2]);
    
    // Calculate the darker shade (decrease each RGB component value)
    var selectedR = Math.min(255, r - 50);
    var selectedG = Math.min(255, g - 50);
    var selectedB = Math.min(255, b - 50);
    
    // Construct the darker color string in RGB format
    return "rgb(" + selectedR + ", " + selectedG + ", " + selectedB + ")";
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





/* ---------------- BUTTON SELECTION ---------------- */

// Get references to the buttons
const buttonA = document.getElementById("buttonA");
const buttonU = document.getElementById("buttonU");
const buttonG = document.getElementById("buttonG");
const buttonC = document.getElementById("buttonC");

// Add click event listeners to the buttons
buttonA.addEventListener("click", () => {
  selectButton(buttonA);
});
buttonU.addEventListener("click", () => {
  selectButton(buttonU);
});
buttonG.addEventListener("click", () => {
  selectButton(buttonG);
});
buttonC.addEventListener("click", () => {
  selectButton(buttonC);
});

// Function to select a button and deselect others
function selectButton(selectedButton) {
  const buttons = [buttonA, buttonU, buttonG, buttonC];

  buttons.forEach((button) => {
    button.classList.remove("selected");
  });

  selectedButton.classList.add("selected");
}

// Select button A by default
selectButton(buttonA);
