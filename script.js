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
  console.log("Menu Button Clicked");
  document.getElementById("list-settings-popup").style.display = "block";
}

function closeListSettingMenu() {
  document.getElementById("list-settings-popup").style.display = "none";
}

async function getDYFI(quake) {
  try {
    const url = `https://earthquake.usgs.gov/earthquakes/feed/v1.0/detail/${quake.id}.geojson`;

    const response = await fetch(url);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    const dyfiProduct = data.properties?.products?.dyfi?.[0];

    if (!dyfiProduct) {
      return null;
    }

    const geoJsonFile = dyfiProduct.contents?.["dyfi_geo_1km.geojson"];

    if (!geoJsonFile?.url) {
      return null;
    }

    const dyfiResponse = await fetch(geoJsonFile.url);

    if (!dyfiResponse.ok) {
      return null;
    }

    const dyfiGeoJson = await dyfiResponse.json();

    // Get the highest MMI found in the DYFI grid
    let maxMMI = null;

    for (const feature of dyfiGeoJson.features || []) {
      const properties = feature.properties || {};

      const possibleMMI = Number(
        properties.cdi ?? properties.mmi ?? properties.MMI,
      );

      if (!isNaN(possibleMMI)) {
        if (maxMMI === null || possibleMMI > maxMMI) {
          maxMMI = possibleMMI;
        }
      }
    }

    // No usable MMI
    if (maxMMI === null) {
      return null;
    }

    // Determine MMI color
    let color;

    if (maxMMI <= 2) {
      color = "#00b050";
    } else if (maxMMI <= 4) {
      color = "#9acd32";
    } else if (maxMMI <= 5) {
      color = "#ffff00";
    } else if (maxMMI <= 6) {
      color = "#ff9900";
    } else if (maxMMI <= 8) {
      color = "#ff0000";
    } else {
      color = "#000000";
    }

    return {
      mmi: maxMMI,
      color: color,
      product: dyfiProduct,
      geojson: dyfiGeoJson,
    };
  } catch (error) {
    console.warn(`DYFI failed for ${quake.id}`, error);
    return null;
  }
}

async function openListDetailsMenu(quake) {
  selectedQuake = quake;

  const longitude = quake.geometry.coordinates[0];
  const latitude = quake.geometry.coordinates[1];
  const depth = quake.geometry.coordinates[2];

  const magnitude = quake.properties.mag;
  const location = quake.properties.place;
  const time = new Date(quake.properties.time);

  // Basic earthquake information
  document.getElementById("quake-name").textContent = location;
  document.getElementById("mag").textContent = `Magnitude: ${magnitude}`;

  document.getElementById("depth").textContent = `Depth: ${depth}`;

  document.getElementById("lat-long").textContent =
    `Latitude: ${latitude}, Longitude: ${longitude}`;

  document.getElementById("time").textContent = `Time: ${time}`;

  document.getElementById("quake-id").textContent = `Quake ID: ${quake.id}`;

  // Get DYFI information
  const dyfi = await getDYFI(quake);

  if (dyfi) {
    console.log("Earthquake:", quake.id);
    console.log("Max MMI:", dyfi.mmi);

    // The number of responses is stored in the DYFI product
    const numResponses =
      dyfi.product?.properties?.numResp ??
      dyfi.product?.properties?.numresp ??
      null;

    console.log("Responses:", numResponses);

    // MMI
    document.getElementById("dyfi-mmi").textContent = `Max MMI: ${dyfi.mmi}`;

    // MMI color
    document.getElementById("dyfi-mmi").style.color = dyfi.color;

    // Reports
    if (numResponses !== null) {
      document.getElementById("dyfi-reports").textContent =
        `Reports: ${numResponses}`;
    } else {
      document.getElementById("dyfi-reports").textContent = "Reports: Unknown";
    }
  } else {
    console.log("No DYFI data:", quake.id);

    document.getElementById("dyfi-mmi").textContent = "No DYFI data";

    document.getElementById("dyfi-reports").textContent = "No DYFI data";
  }

  // Show popup
  document.querySelector(".more-details-popup").classList.add("show");
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

  window.location.href = `earthquake-map.html?lat=${latitude}&lon=${longitude}&id=${selectedQuake.id}&mag=${selectedQuake.properties.mag}&place=${encodeURIComponent(selectedQuake.properties.place)}&time=${selectedQuake.properties.time}`;
}

function openDetialsFile() {
  if (!selectedQuake) {
    console.log("No earthquake selected");
    return;
  }
  const id = selectedQuake.id;

  const longitude = selectedQuake.geometry.coordinates[0];
  const latitude = selectedQuake.geometry.coordinates[1];

  window.location.href = `earthquake-details.html?lat=${latitude}&lon=${longitude}&id=${selectedQuake.id}&mag=${selectedQuake.properties.mag}&place=${encodeURIComponent(selectedQuake.properties.place)}&starttime=${selectedQuake.properties.time - 30 * 24 * 60 * 60 * 1000}&endtime=${selectedQuake.properties.time}&radius=50000`;
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
    document.getElementById("year"),
  ];

  const endDropdowns = [
    document.getElementById("end-day"),
    document.getElementById("end-month"),
    document.getElementById("end-year"),
  ];

  if (this.checked) {
    // Disable dropdowns
    [...startDropdowns, ...endDropdowns].forEach((dropdown) => {
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
    [...startDropdowns, ...endDropdowns].forEach((dropdown) => {
      dropdown.disabled = false;
    });
  }
});
