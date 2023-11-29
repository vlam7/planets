let numPlanets = 11; // Number of planets
let radius = 400; // Set a larger radius for the circular orbit to increase spacing
let planetTextures = [];
let planetAngles = [];
let isRotating = true;
let saturnRingsTexture;
let data;
let url = "Solar System data.csv";
let expandedPlanet = -1;
let planetVisible = [];
let planetInfoDiv; // Div element for displaying planet information
let typewriterSpeed = -1; // Typing speed in milliseconds
let typewriterIndex = 10;
let planetInfoText = "";
let typewriterTimeout; // Declare typewriterTimeout as a global variable
let val=0;


function preload() {
  // Load planet textures
  planetTextures[0] = loadImage("Earth.jpg");
  planetTextures[1] = loadImage("Mars.png");
  planetTextures[2] = loadImage("Mercury.jpg");
  planetTextures[3] = loadImage("Jupiter.jpg");
  planetTextures[4] = loadImage("Venus.jpg");
  planetTextures[5] = loadImage("Sun.jpg");
  planetTextures[6] = loadImage("Saturn.jpg");
  planetTextures[7] = loadImage("Uranus.jpg");
  planetTextures[8] = loadImage("Neptune.jpg");
  planetTextures[9] = loadImage("Pluto.jpg");
  planetTextures[10] = loadImage("Moon.jpg");

  saturnRingsTexture = loadImage("Saturn Ring.png");
  data = loadTable(url, 'csv', 'header');
}

function setup() {
  createCanvas(window.innerWidth, window.innerHeight, WEBGL);
  noStroke();
  cam = createCamera();
  perspective();
  for (let i = 0; i < numPlanets; i++) {
    let angle = (TWO_PI / numPlanets) * i;
    planetAngles.push(angle);
    planetVisible.push(true);
  // Create a div element for displaying planet information
  planetInfoDiv = createDiv('');
  planetInfoDiv.position(width / 2 + 20, 270);
  planetInfoDiv.style('color', 'white');
  planetInfoDiv.style('font-size', '16px');
}
}

function draw() {
  background("rgba(0, 0, 0, 0)");
  //orbitControl();
  vinhControl();

  if (isRotating) {
    for (let i = 0; i < numPlanets; i++) {
      planetAngles[i] += 0.005;
    }
  }

  for (let i = 0; i < numPlanets; i++) {
    if (planetVisible[i]) {
      push();
      let x = radius * cos(planetAngles[i]);
      let z = radius * sin(planetAngles[i]);

      translate(x, 0, z);
      rotateY(planetAngles[i]);

      if (i === expandedPlanet) {
        texture(planetTextures[i]);
        sphere(500, 500, 500);
      } else if (i === 6) {
        texture(planetTextures[i]);
        sphere(70,70,70);
        texture(saturnRingsTexture);
        rotateX(PI / 2 + radians(20));
        scale(1, 1, 0.1);
        torus(120, 35, 48, 10);
      } else {
        texture(planetTextures[i]);
        sphere(70,70,70);
      }
      pop();
    }
  }
}

function mouseClicked() {
  let clickX = mouseX - width / 2;
  let clickY = mouseY - height / 2;
  let distanceFromCenter = dist(0, 0, clickX, clickY);

  if (expandedPlanet !== -1) {
    // Close the expanded planet view
    planetVisible[expandedPlanet] = true;
    expandedPlanet = -1;
    planetInfoDiv.html(''); // Clear the displayed planet information
  } else if (distanceFromCenter <= radius + 200) {
    // Check if the click is within the planet area
    expandedPlanet = getClickedPlanet(clickX, clickY); // Pass clickX and clickY
    for (let i = 0; i < numPlanets; i++) {
      if (i !== expandedPlanet) {
        planetVisible[i] = false;
      }
    }
    if (expandedPlanet !== -1) {
      displayPlanetInfo(data.get(expandedPlanet, 'Name'));
    }
  }
}

function getClickedPlanet(x, y) {
  let closestPlanet = -1;
  let closestDistance = Number.MAX_VALUE;

  for (let i = 0; i < numPlanets; i++) {
    if (planetVisible[i]) {
      // Calculate the current position of the planet
      let angle = planetAngles[i];
      let planetX = radius * cos(angle);
      let planetZ = radius * sin(angle);

      // Reverse the rotation transformation
      let clickXRotated = cos(-angle) * x - sin(-angle) * y;
      let clickYRotated = sin(-angle) * x + cos(-angle) * y;

      // Calculate the distance between the rotated click point and the planet
      let d = dist(planetX, planetZ, clickXRotated, clickYRotated);

      if (d < closestDistance) {
        closestDistance = d;
        closestPlanet = i;
      }
    }
  }
  return closestPlanet;
}

function displayPlanetInfo(planetName) {
  planetName = planetName.toLowerCase().trim();

  let matchedPlanet = data.rows.find((row) => {
    return row.obj.Name.toLowerCase().trim() === planetName;
  });

  if (matchedPlanet) {
    // Clear the div content and initialize variables
    planetInfoDiv.html('');
    typewriterIndex = 0;
    planetInfoText = createPlanetInfoText(matchedPlanet.obj);
    
    // Create a function for the typewriter effect
    function typeWriter() {
      if (typewriterIndex < planetInfoText.length) {
        planetInfoDiv.html(planetInfoText.substring(0, typewriterIndex + 1));
        typewriterIndex++;
        setTimeout(typeWriter, typewriterSpeed);
      }
    }

    // Start the typewriter effect
    typeWriter();
  }
}

function createPlanetInfoText(planetData) {
  let planetInfoHTML = '<b>' + planetData.Name + '</b><br>';
  planetInfoHTML += 'Diameter (miles): ' + planetData['Diameter (miles)'] + '<br>';
  planetInfoHTML += 'Rotation Period (hours): ' + planetData['Rotation Period (hours)'] + '<br>';
  planetInfoHTML += 'Length of Day (hours): ' + planetData['Length of Day (hours)'] + '<br>';
  planetInfoHTML += 'Primary: ' + planetData.Primary + '<br>';
  planetInfoHTML += 'Distance from Primary (10^6 miles): ' + planetData['Distance from Primary (10^6 miles)'] + '<br>';
  planetInfoHTML += 'Perihelion (10^6 miles): ' + planetData['Perihelion (10^6 miles)'] + '<br>';
  // planetInfoHTML += 'Aphelion (10^6 miles): ' + planetData['Aphelion (10^6 miles)'] + '<br>';
  // planetInfoHTML += 'Orbital Period (days): ' + planetData['Orbital Period (days)'] + '<br>';
  // planetInfoHTML += 'Orbital Velocity (miles/s): ' + planetData['Orbital Velocity (miles/s)'] + '<br>';
  // planetInfoHTML += 'Orbital Inclination (degrees): ' + planetData['Orbital Inclination (degrees)'] + '<br>';
  // planetInfoHTML += 'Orbital Eccentricity: ' + planetData['Orbital Eccentricity'] + '<br>';
  // planetInfoHTML += 'Obliquity to Orbit (degrees): ' + planetData['Obliquity to Orbit (degrees)'] + '<br>';
  
  return planetInfoHTML;
}

function displayPlanetInfo(planetName) {
  planetName = planetName.toLowerCase().trim();

  let matchedPlanet = data.rows.find((row) => {
    return row.obj.Name.toLowerCase().trim() === planetName;
  });

  if (matchedPlanet) {
    // Clear the div content and initialize variables
    planetInfoDiv.html('');
    typewriterIndex = 0;
    planetInfoText = createPlanetInfoText(matchedPlanet.obj);
    
    // Create a function for the typewriter effect
    function typeWriter() {
      if (typewriterIndex < planetInfoText.length) {
        planetInfoDiv.html(planetInfoText.substring(0, typewriterIndex + 1));
        typewriterIndex++;
        
        typewriterTimeout = setTimeout(typeWriter, typewriterSpeed); // Set typewriterTimeout
      }
    }

    // Start the typewriter effect
    typeWriter();
  }
}

function keyReleased() {
  if (keyCode === 27) {
    for (let i = 0; i < numPlanets; i++) {
      planetVisible[i] = true;
    }
    expandedPlanet = -1;
    planetInfoDiv.html(""); // Clear the displayed planet information
    clearTimeout(typewriterTimeout); // Stop the typewriter effect
  }
}


p5.prototype.vinhControl = function(sensitivityX, sensitivityY, sensitivityZ) {
  //init 3d 
  this._assert3d('vinhControl');


  // If the mouse is not in bounds of the canvas, disable all behaviors:
  const mouseInCanvas =
    this.mouseX < this.width &&
    this.mouseX > 0 &&
    this.mouseY < this.height &&
    this.mouseY > 0;
  if (!mouseInCanvas) return;

  const cam = this._renderer._curCamera;
  //default zooms

  if (typeof sensitivityX === 'undefined') {
    sensitivityX = 1;
  }
  if (typeof sensitivityY === 'undefined') {
    sensitivityY = sensitivityX;
  }
  if (typeof sensitivityZ === 'undefined') {
    sensitivityZ = 0.5;
  }
//zoom
  const scaleFactor = this.height < this.width ? this.height : this.width;
  this._renderer._curCamera._orbit(0, 0, val * scaleFactor);

  if (this.mouseIsPressed) {
    // ORBIT BEHAVIOR
    if (this.mouseButton === this.LEFT) {
      const deltaTheta =
        -sensitivityX * (this.mouseX - this.pmouseX) / scaleFactor;
      const deltaPhi =
        sensitivityY * (this.mouseY - this.pmouseY) / scaleFactor;
      this._renderer._curCamera._orbit(deltaTheta, deltaPhi, 0);
    } else if (this.mouseButton === this.RIGHT) {
      // PANNING BEHAVIOR along X/Z camera axes and restricted to X/Z plane
      // in world space
      const local = cam._getLocalAxes();

      // normalize portions along X/Z axes
      const xmag = Math.sqrt(local.x[0] * local.x[0] + local.x[2] * local.x[2]);
      if (xmag !== 0) {
        local.x[0] /= xmag;
        local.x[2] /= xmag;
      }

      // normalize portions along X/Z axes
      const ymag = Math.sqrt(local.y[0] * local.y[0] + local.y[2] * local.y[2]);
      if (ymag !== 0) {
        local.y[0] /= ymag;
        local.y[2] /= ymag;
      }

      // move along those vectors by amount controlled by mouseX, pmouseY
      const dx = -1 * sensitivityX * (this.mouseX - this.pmouseX);
      const dz = -1 * sensitivityY * (this.mouseY - this.pmouseY);

      // restrict movement to XZ plane in world space
      cam.setPosition(
        cam.eyeX + dx * local.x[0] + dz * local.z[0],
        cam.eyeY,
        cam.eyeZ + dx * local.x[2] + dz * local.z[2]
      );
    }
  }
  return this;
};
