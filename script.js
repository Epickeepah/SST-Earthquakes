function openCalendarMenu() {
    console.log("Menu button clicked");
    document.getElementById("popup").style.display = "block";
}

function closeCalendarMenu() {
    document.getElementById("popup").style.display = "none";
}

function openSettingsMenu() {
    console.log("Menu Button Clicked");

    document.getElementById("settings-popup").style.display = "block";

    // Show current magnitude in dropdown
    document.getElementById("mag-select").value = minimumMagnitude.toFixed(1);
}

function closeSettingsMenu() {
    document.getElementById("settings-popup").style.display = "none";
}

function openListSettingMenu() {
    console.log("Menu Button Clicked")
    document.getElementById("list-settings-popup").style.display = "block"
}

function closeListSettingMenu() {
    document.getElementById("list-settings-popup").style.display = "none";
}

function openListDetailsMenu(quake) {

    selectedQuake = quake;

    const longitude = quake.geometry.coordinates[0];
    const latitude = quake.geometry.coordinates[1];
    const depth = quake.geometry.coordinates[2];

    const magnitude = quake.properties.mag;
    const location = quake.properties.place;
    const time = new Date(quake.properties.time);

    document.getElementById("quake-name").textContent = location
    document.getElementById("mag").textContent = `Magnitude: ${magnitude}`
    document.getElementById("depth").textContent = `Depth: ${depth}`
    document.getElementById("lat-long").textContent = `Latitude: ${latitude}, Longitude ${longitude}`
    document.getElementById("time").textContent = `Time: ${time}`
    document.querySelector(".more-details-popup")
        .classList.add("show");
}

function closeListDetailsMenu() {
    const popup = document.querySelector(".more-details-popup");

    popup.classList.remove("show");
}

function openMap() {

    if (!selectedQuake) {
        console.log("No earthquake selected");
        return;
    }
    const id = selectedQuake.id;

    const longitude = selectedQuake.geometry.coordinates[0];
    const latitude = selectedQuake.geometry.coordinates[1];

    window.location.href =
        `earthquake-map.html?lat=${latitude}&lon=${longitude}&id=${selectedQuake.id}&mag=${selectedQuake.properties.mag}&place=${encodeURIComponent(selectedQuake.properties.place)}&time=${selectedQuake.properties.time}`;
}

function openDetialsFile() {
    if (!selectedQuake) {
        console.log("No earthquake selected");
        return;
    }
    const id = selectedQuake.id;

    const longitude = selectedQuake.geometry.coordinates[0];
    const latitude = selectedQuake.geometry.coordinates[1];


    window.location.href =
        `earthquake-details.html?lat=${latitude}&lon=${longitude}&id=${selectedQuake.id}&mag=${selectedQuake.properties.mag}&place=${encodeURIComponent(selectedQuake.properties.place)}&time=${selectedQuake.properties.time}&radius=50000`;

}


function toggleDays() {
    const list = document.getElementById("dayList");

    if (list.style.display === "block") {
        list.style.display = "none";
    } else {
        list.style.display = "block";
    }
}


function selectDay(day) {
    document.getElementById("selectedDay").textContent = day;

    document.getElementById("dayList").style.display = "none";

}

const currentDateCheck = document.getElementById("current-date-check");

currentDateCheck.addEventListener("change", function () {

    const startDropdowns = [
        document.getElementById("day"),
        document.getElementById("month"),
        document.getElementById("year")
    ];

    const endDropdowns = [
        document.getElementById("end-day"),
        document.getElementById("end-month"),
        document.getElementById("end-year")
    ];


    if (this.checked) {

        // Disable dropdowns
        [...startDropdowns, ...endDropdowns].forEach(dropdown => {
            dropdown.disabled = true;
        });


        const now = new Date();

        day = String(now.getDate()).padStart(2, "0");
        month = String(now.getMonth() + 1).padStart(2, "0");
        year = now.getFullYear();


        // Set end date = today
        document.getElementById("end-day").value = Number(day);
        document.getElementById("end-month").value = Number(month);
        document.getElementById("end-year").value = year;


        // Set start date = yesterday
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        start_day = String(yesterday.getDate()).padStart(2, "0");
        start_month = String(yesterday.getMonth() + 1).padStart(2, "0");
        start_year = yesterday.getFullYear();


        document.getElementById("day").value = Number(start_day);
        document.getElementById("month").value = Number(start_month);
        document.getElementById("year").value = start_year;

    } else {

        // Enable dropdowns again
        [...startDropdowns, ...endDropdowns].forEach(dropdown => {
            dropdown.disabled = false;
        });

    }

});