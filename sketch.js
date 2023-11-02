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
  orbitControl();

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


