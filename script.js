async function run() {

    // Init
    let hourWidth = 125;
    let legendWidth = 300;
    let stripStartYAxis = 60;
    let stripGap = 35;
    
    let canvasControllers = document.querySelector('.canvas-controllers');
    let canvasPositions = document.querySelector('.canvas-positions');

    // Fetch the data
    const response = await fetch('nl2024.json');
    const data = await response.json();

    /**
     * 
     * Draw the canvas basics
     * 
     */

    // Page title
    document.querySelector('#title').textContent = data.settings.title;

    // Legend column for controllers
    let legendControllers = document.createElement('div');
    legendControllers.className = 'legend';
    canvasControllers.appendChild(legendControllers);

    // Legend column for positions
    let legendPositions = document.createElement('div');
    legendPositions.className = 'legend';
    canvasPositions.appendChild(legendPositions);
    
    // Create the hour columns for controllers
    for (let i = data.settings.start; i <= data.settings.end; i++) {
        let hourColumn = document.createElement('div');
        hourColumn.className = 'hour-column';
        hourColumn.textContent = i;
        canvasControllers.appendChild(hourColumn);

        // In each column add four child of `hour-column divider`
        for (let j = 0; j < 4; j++) {
            let divider = document.createElement('div');
            divider.className = 'hour-column-divider';

            switch(j) {
                case 0: divider.textContent = '00'; break;
                case 1: divider.textContent = '15'; break;
                case 2: divider.textContent = '30'; break;
                case 3: divider.textContent = '45'; break;
            }

            divider.style.left = `${(hourWidth / 4) * j}px`;
            
            hourColumn.appendChild(divider);
        }

    }

    // Create the hour columns for positions
    for (let i = data.settings.start; i <= data.settings.end; i++) {
        let hourColumn = document.createElement('div');
        hourColumn.className = 'hour-column';
        hourColumn.textContent = i;
        canvasPositions.appendChild(hourColumn);

        // In each column add four child of `hour-column divider`
        for (let j = 0; j < 4; j++) {
            let divider = document.createElement('div');
            divider.className = 'hour-column-divider';

            switch(j) {
                case 0: divider.textContent = '00'; break;
                case 1: divider.textContent = '15'; break;
                case 2: divider.textContent = '30'; break;
                case 3: divider.textContent = '45'; break;
            }

            divider.style.left = `${(hourWidth / 4) * j}px`;
            
            hourColumn.appendChild(divider);
        }
    }

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

        // If the controller id is the same, they should maintain their respective y axis
        if (!controllerYAxis[staff.controller]) {
            controllerYAxis[staff.controller] = controllerIndex;
            controllerIndex++;
        }

        // Draw the legend
        let legend = document.createElement('div');
        legend.className = 'legend-strip';
        legend.innerHTML = '&emsp;' + data.controllers.find(controller => controller.id === staff.controller).name + ' (' + data.controllers.find(controller => controller.id === staff.controller).rating + ')';
        legend.style.top = `${stripStartYAxis + (controllerYAxis[staff.controller] - 1) * stripGap}px`;
        canvasControllers.appendChild(legend);

        // Draw the strip
        let strip = document.createElement('div');
        strip.className = 'strip';
        strip.innerHTML = '&nbsp;' + staff.position;
        strip.style.top = `${stripStartYAxis + (controllerYAxis[staff.controller] - 1) * stripGap}px`;

        let startTime = staff.startTime.split(':');
        let startTimeHour = parseInt(startTime[0]);
        let startTimeMinute = parseInt(startTime[1]);
        let endTime = staff.endTime.split(':');
        let endTimeHour = parseInt(endTime[0]);
        let endTimeMinute = parseInt(endTime[1]);

        // Calculate the time length in minutes
        let timeLength = (endTimeHour * 60 + endTimeMinute) - (startTimeHour * 60 + startTimeMinute);

        // Set startInPixels to the start time in pixels
        let startInPixels = legendWidth + (startTimeHour - data.settings.start) * hourWidth + (startTimeMinute * (hourWidth / 60));
        strip.style.left = `${startInPixels}px`;

        // Set widthInPixels to the time length in pixels
        let widthInPixels = timeLength * (hourWidth / 60);
        strip.style.width = `${widthInPixels}px`;

        canvasControllers.appendChild(strip);
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

        // If the position id is the same, they should maintain their respective y axis
        if (!positionYAxis[staff.position]) {
            positionYAxis[staff.position] = positionIndex;
            positionIndex++;
        }

        // Draw the legend
        let legend = document.createElement('div');
        legend.className = 'legend-strip';
        legend.innerHTML = '&emsp;' + staff.position;
        legend.style.top = `${stripStartYAxis + (positionYAxis[staff.position] - 1) * stripGap}px`;
        canvasPositions.appendChild(legend);

        // Draw the strip
        let strip = document.createElement('div');
        strip.className = 'strip';
        strip.innerHTML = '&nbsp;' + data.controllers.find(controller => controller.id === staff.controller).name;
        strip.style.top = `${stripStartYAxis + (positionYAxis[staff.position] - 1) * stripGap}px`;

        let startTime = staff.startTime.split(':');
        let startTimeHour = parseInt(startTime[0]);
        let startTimeMinute = parseInt(startTime[1]);
        let endTime = staff.endTime.split(':');
        let endTimeHour = parseInt(endTime[0]);
        let endTimeMinute = parseInt(endTime[1]);
        
        // Calculate the time length in minutes
        let timeLength = (endTimeHour * 60 + endTimeMinute) - (startTimeHour * 60 + startTimeMinute);
        
        // Set startInPixels to the start time in pixels
        let startInPixels = legendWidth + (startTimeHour - data.settings.start) * hourWidth + (startTimeMinute * (hourWidth / 60));
        strip.style.left = `${startInPixels}px`;
        
        // Set widthInPixels to the time length in pixels
        let widthInPixels = timeLength * (hourWidth / 60);
        strip.style.width = `${widthInPixels}px`;

        canvasPositions.appendChild(strip);
    });

    /**
     * 
     * Adjust the width and height of the website
     * 
     */

    // Set #container width to the total width of the canvas as long it doesn't exceed the window width
    let containerWidth = Math.min(legendWidth + (data.settings.end - data.settings.start + 1) * hourWidth, window.innerWidth - 32);
    document.querySelector('#container').style.width = `${containerWidth}px`;

    // Adjust height of both canvas according to the last strip + 50px padding in bottom
    let canvasHeight = Math.max(stripStartYAxis + (controllerIndex - 1) * stripGap, stripStartYAxis + (positionIndex - 1) * stripGap) + 50;
    canvasControllers.style.height = `${canvasHeight}px`;
    canvasPositions.style.height = `${canvasHeight}px`;

}

run();