First Person
============
Description...


Specification
-------------
Tickmarks (✔) indicate completed tasks.
Ellipses (...) indicate ongoing tasks.

* Conceptual: World, Camera, Screen coordinates 

* Retrieve context
* Initialize viewport
* Write and load shaders
    - Nothing fancy (for now)
    - Ambient and point lighting
    - Helper functions (loading, attaching)
    - Consider XMLHttpRequest

* Initialize buffers
    - Ground
    - A few simple shapes
    - Textures or colours

* Implement rendering logic
* Implement animation logic
    - Time handling (timer object, fixed FPS, global state?)
    - Create physics objects (encapsulating state)
    - Acceleration, impacts, forces
    - Jumping

* Implement input logic
    - WASD for moving around
    - Mouse for looking around
    - Space for jumping
    - Configuration GUI?

* Fun experiments
    - Gaussian blur
    - Warped textures
    - Folded textures
    - Run-time texture binding

* Good practice
    - Comments, unit labels
    - Optimizations
    - Organize code into reusable modules (ie. objects)
        -- Encapsulate buffers, shaders, textures behind high-level mesh objects
        -- Matrix



Contributors
------------
Jonatan H Sundqvist