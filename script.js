
// Init
const hourWidth = 125;
const legendWidth = 300;
const stripStartYAxis = 60;
const stripGap = 25;

const canvasControllers = document.querySelector('.canvas-controllers');
const canvasPositions = document.querySelector('.canvas-positions');

function createElementWithClass(type, className, html = '') {
    const element = document.createElement(type);
    element.className = className;
    if (html) element.innerHTML = html;
    return element;
}

function createHourColumns(canvas, start, end) {
    for (let i = start; i <= end; i++) {
        let hourColumn = createElementWithClass('div', 'hour-column', `${i}`.padStart(2, '0'));
        canvas.appendChild(hourColumn);

        for (let j = 0; j < 4; j++) {
            let divider = createElementWithClass('div', 'hour-column-divider');
            divider.style.left = `${(hourWidth / 4) * j}px`;
            divider.textContent = `${j * 15}`.padStart(2, '0');
            
            hourColumn.appendChild(divider);
        }
    }
}

async function run() {

    // Extract 'event' query parameter value
    const urlParams = new URLSearchParams(window.location.search);
    const eventName = urlParams.get('event'); // e.g., 'nl2024'

    // Fetch the data
    const response = await fetch(`data/${eventName}.json`);
    const data = await response.json();

    /**
     * 
     * Draw the canvas basics
     * 
     */

    // Page title
    document.querySelector('#title').textContent = data.settings.title;

    // Legend columns
    canvasControllers.appendChild(createElementWithClass('div', 'legend'));
    canvasPositions.appendChild(createElementWithClass('div', 'legend'));
    
    // Create the hour columns for controllers
    createHourColumns(canvasControllers, data.settings.start, data.settings.end);
    createHourColumns(canvasPositions, data.settings.start, data.settings.end);

    // Coloring
    let controllerColorMap = {};
    let positionColorMap = {};
    const allControllers = [...new Set(data.staffing.map(staff => staff.controller))];
    const allPositions = [...new Set(data.staffing.map(staff => staff.position))];

    allControllers.forEach((controller, index) => {
        controllerColorMap[controller] = `color-controllers-${index % 40 + 1}`; // Maps controller ID to a color class
    });

    allPositions.forEach((position, index) => {
        positionColorMap[position] = `color-positions-${index % 40 + 1}`; // Maps position ID to a color class
    });

    /**
     * 
     * Draw the positions canvas
     * 
     */

    // Do the same but for the positions where legend is position and strip are the controllers
    let positionYAxis = {};
    let positionIndex = 1; // Start at 1 to start at 50px

    data.staffing.forEach(staff => {

        var controller = data.controllers.find(controller => controller.id === staff.controller);

        // If the position id is the same, they should maintain their respective y axis
        if (!positionYAxis[staff.position]) {
            positionYAxis[staff.position] = positionIndex;
            positionIndex++;
        }

        // Draw the legend
        let legend = createElementWithClass('div', 'legend-strip', '&emsp;' + staff.position);
        legend.classList.add(positionColorMap[staff.position]);
        legend.style.top = `${stripStartYAxis + (positionYAxis[staff.position] - 1) * stripGap}px`;
        canvasPositions.appendChild(legend);

        // Draw the strip
        let strip = createElementWithClass('div', 'strip');
        strip.innerHTML = '&nbsp;' + controller.name;
        strip.classList.add(controllerColorMap[controller.id]);
        if(controller.color) strip.style.backgroundColor = controller.color;
        strip.style.top = `${stripStartYAxis + (positionYAxis[staff.position] - 1) * stripGap}px`;

        const [startTimeHour, startTimeMinute] = staff.startTime.split(':').map(Number);
        const [endTimeHour, endTimeMinute] = staff.endTime.split(':').map(Number);

        // Set left to the start time in pixels
        let startInPixels = legendWidth + (startTimeHour - data.settings.start) * hourWidth + (startTimeMinute * (hourWidth / 60));
        strip.style.left = `${startInPixels}px`;

        // Set widthInPixels to the time length in pixels
        let timeLength = (endTimeHour * 60 + endTimeMinute) - (startTimeHour * 60 + startTimeMinute);
        let widthInPixels = timeLength * (hourWidth / 60);
        strip.style.width = `${widthInPixels}px`;

        canvasPositions.appendChild(strip);
    });

    /**
     * 
     * Draw the controllers canvas
     * 
     */

    // Create a dictionary to store the y-axis value for each controller
    let controllerYAxis = {};
    let controllerIndex = 1;

    // Create a strip for each controller
    data.staffing.forEach(staff => {

        var controller = data.controllers.find(controller => controller.id === staff.controller);

        // Skip hidden staff
        if(controller.hidden) return;

        // If the controller id is the same, they should maintain their respective y axis
        if (!controllerYAxis[staff.controller]) {
            controllerYAxis[staff.controller] = controllerIndex;
            controllerIndex++;
        }

        // Draw the legend
        let legend = createElementWithClass('div', 'legend-strip');
        legend.innerHTML = '&emsp;' + controller.name + ' (' + controller.rating + ')';
        legend.style.top = `${stripStartYAxis + (controllerYAxis[staff.controller] - 1) * stripGap}px`;
        legend.classList.add(controllerColorMap[controller.id]);
        if(controller.color) legend.style.backgroundColor = controller.color;
        canvasControllers.appendChild(legend);

        // Draw the strip
        let strip = createElementWithClass('div', 'strip', '&nbsp;' + staff.position);
        strip.classList.add(positionColorMap[staff.position]);
        strip.style.top = `${stripStartYAxis + (controllerYAxis[staff.controller] - 1) * stripGap}px`;

        const [startTimeHour, startTimeMinute] = staff.startTime.split(':').map(Number);
        const [endTimeHour, endTimeMinute] = staff.endTime.split(':').map(Number);

        // Set left to the start time in pixels
        let startInPixels = legendWidth + (startTimeHour - data.settings.start) * hourWidth + (startTimeMinute * (hourWidth / 60));
        strip.style.left = `${startInPixels}px`;

        // Set widthInPixels to the time length in pixels
        let timeLength = (endTimeHour * 60 + endTimeMinute) - (startTimeHour * 60 + startTimeMinute);
        let widthInPixels = timeLength * (hourWidth / 60);
        strip.style.width = `${widthInPixels}px`;

        canvasControllers.appendChild(strip);
    });

    

    /**
     * 
     * Adjust the width and height of the website
     * 
     */

    // Set #container width to the total width of the canvas as long it doesn't exceed the window width
    let containerWidth = Math.min(legendWidth + (data.settings.end - data.settings.start + 1) * hourWidth, window.innerWidth - 32);
    document.querySelector('#container').style.width = `${containerWidth}px`;

    // Set the --legend-strip-line-widthwith to container width
    document.documentElement.style.setProperty('--legend-strip-line-width', `${containerWidth}px`);

    // Adjust height of both canvas according to the last strip + 50px padding in bottom
    let canvasHeight = Math.max(stripStartYAxis + (controllerIndex - 1) * stripGap, stripStartYAxis + (positionIndex - 1) * stripGap) + 50;
    canvasControllers.style.height = `${canvasHeight}px`;
    canvasPositions.style.height = `${canvasHeight}px`;

}

run();