function openCalendarMenu() {
    console.log("Menu button clicked");
    document.getElementById("popup").style.display = "block";
}

function closeCalendarMenu() {
    document.getElementById("popup").style.display = "none";
}

function openSettingsMenu() {
    console.log("Menu Button Clicked")
    document.getElementById("settings-popup").style.display = "block"
}

function closeSettingsMenu() {
    document.getElementById("settings-popup").style.display = "none";
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