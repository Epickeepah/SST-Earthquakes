function openMenu() {
    console.log("Menu button clicked");
    document.getElementById("popup").style.display = "block";
}

function closeMenu() {
    document.getElementById("popup").style.display = "none";
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