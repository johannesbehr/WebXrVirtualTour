const MAP_WIDTH_PX = 785;
const MAP_HEIGHT_PX = 866;

const REAL_WIDTH_M = 190.0;
const REAL_HEIGHT_M = 209.6;

const jsonEditor = document.getElementById("jsonEditor");
const pointsLayer = document.getElementById("pointsLayer");

let data = {
    points: []
};

let dragInfo = null;
let selectedPointIndex = null;

/*
    Meter -> Pixel
*/
function meterToPixelX(meter) {
    return (meter / REAL_WIDTH_M) * MAP_WIDTH_PX;
}

function meterToPixelY(meter) {
    return (meter / REAL_HEIGHT_M) * MAP_HEIGHT_PX;
}

/*
    Pixel -> Meter
*/
function pixelToMeterX(px) {
    return (px / MAP_WIDTH_PX) * REAL_WIDTH_M;
}

function pixelToMeterY(py) {
    return (py / MAP_HEIGHT_PX) * REAL_HEIGHT_M;
}

/*
    JSON aus Textbox lesen
*/
function parseEditorContent() {

    try {
        const parsed = JSON.parse(jsonEditor.value);

        if (!parsed.viewPoints || !Array.isArray(parsed.viewPoints)) {
            return;
        }

        data = parsed;
        renderPoints();

        jsonEditor.style.borderColor = "#bbb";

    } catch (err) {
        jsonEditor.style.borderColor = "red";
    }
}

/*
    JSON aktualisieren
*/
function updateEditor() {
    let text = JSON.stringify(data, null, 2);
	//text = text.replace(/\[\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\]/g, '[$1,$2]');
	text = compactNumericArrays(text);
	jsonEditor.value = text;
}

function compactNumericArrays(json) {
    return json.replace(
        /\[\s*([-\d.]+)\s*,\s*([-\d.]+)(?:\s*,\s*([-\d.]+))?\s*\]/g,
        (match, a, b, c) => {
            return c !== undefined
                ? `[${a},${b},${c}]`
                : `[${a},${b}]`;
        }
    );
}

/*
    Punkte zeichnen
*/
function renderPoints() {

    pointsLayer.innerHTML = "";

    data.viewPoints.forEach((point, index) => {

        const xMeter = point.location[0];
        const yMeter = point.location[1];

        const xPx = meterToPixelX(xMeter);
        const yPx = meterToPixelY(yMeter);

        const pointElement = document.createElement("div");
        pointElement.className = "point";
		

		

        pointElement.style.left = `${xPx}px`;
        pointElement.style.top = `${yPx}px`;

        pointElement.dataset.index = index;

        const label = document.createElement("div");
        label.className = "point-label";
        label.textContent = point.id;
		if (selectedPointIndex === index) {
			label.style.display = "block";
			pointElement.style.background = "orange"
			
		}



        pointElement.appendChild(label);

        /*
            Drag Start
        */
        pointElement.addEventListener("mousedown", (event) => {

			selectedPointIndex = index;

            dragInfo = {
                index: index
            };

            event.preventDefault();
			renderPoints(); // Labels aktualisieren
			
        });

        pointsLayer.appendChild(pointElement);
    });
}


/*
    Maus bewegen
*/
document.addEventListener("mousemove", (event) => {

    if (!dragInfo) {
        return;
    }

    const mapContainer = document.getElementById("mapContainer");
    const rect = mapContainer.getBoundingClientRect();

    /*
        Mausposition relativ zur Karte
    */
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;

    /*
        Begrenzen
    */
    x = Math.max(0, Math.min(MAP_WIDTH_PX, x));
    y = Math.max(0, Math.min(MAP_HEIGHT_PX, y));

    /*
        Pixel -> Meter
    */
    const xMeter = pixelToMeterX(x);
    const yMeter = pixelToMeterY(y);

    /*
        Daten aktualisieren
    */
    data.viewPoints[dragInfo.index].location = [
        Number(xMeter.toFixed(1)),
        Number(yMeter.toFixed(1))
    ];

    renderPoints();
    updateEditor();
});

/*
    Drag Ende
*/
document.addEventListener("mouseup", () => {
    dragInfo = null;
});

/*
    Änderungen im JSON-Editor
*/
jsonEditor.addEventListener("input", () => {
    parseEditorContent();
});

/*
    Initialisieren
*/
parseEditorContent();