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

    if (maxMMI < 2) {
      // I
      color = "#8c8c8c";
    } else if (maxMMI < 4) {
      // II-III
      color = "#a6cee3";
    } else if (maxMMI < 5) {
      // IV
      color = "#00ffff";
    } else if (maxMMI < 6) {
      // V
      color = "#00ff00";
    } else if (maxMMI < 7) {
      // VI
      color = "#ccff00";
    } else if (maxMMI < 8) {
      // VII
      color = "#ffff00";
    } else if (maxMMI < 9) {
      // VIII
      color = "#ff9900";
    } else if (maxMMI < 10) {
      // IX
      color = "#ff0000";
    } else {
      // X+
      color = "#cc0000";
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

function getIntensityColor(mmi) {
  if (mmi < 2) {
    return "#8c8c8c"; // I
  } else if (mmi < 4) {
    return "#a6cee3"; // II-III
  } else if (mmi < 5) {
    return "#00ffff"; // IV
  } else if (mmi < 6) {
    return "#00ff00"; // V
  } else if (mmi < 7) {
    return "#ccff00"; // VI
  } else if (mmi < 8) {
    return "#ffff00"; // VII
  } else if (mmi < 9) {
    return "#ff9900"; // VIII
  } else if (mmi < 10) {
    return "#ff0000"; // IX
  } else {
    return "#cc0000"; // X+
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

  // ==========================================
  // BASIC EARTHQUAKE INFORMATION
  // ==========================================

  document.getElementById("quake-name").textContent = location;

  document.getElementById("mag").textContent = `Magnitude: ${magnitude}`;

  document.getElementById("depth").textContent = `Depth: ${depth}`;

  document.getElementById("lat-long").textContent =
    `Latitude: ${latitude}, Longitude: ${longitude}`;

  document.getElementById("time").textContent = `Time: ${time}`;

  document.getElementById("quake-id").textContent = `Quake ID: ${quake.id}`;

  // ==========================================
  // GET DYFI + SHAKE MAP
  // ==========================================

  const products = await getEarthquakeProducts(quake);

  const dyfi = products?.dyfi || null;
  const shakeMap = products?.shakemap || null;

  console.log("=================================");
  console.log("Earthquake:", quake.id);
  console.log("DYFI:", dyfi);
  console.log("ShakeMap:", shakeMap);
  console.log("=================================");

  // ==========================================
  // DYFI
  // ==========================================

  if (dyfi && dyfi.mmi !== null && dyfi.mmi !== undefined) {
    console.log("DYFI MMI:", dyfi.mmi);

    let count = Math.round(Number(dyfi.mmi));

    let romanNumber = "I";

    if (count >= 10) {
      romanNumber = "X+";
    } else {
      const roman = [
        { value: 9, symbol: "IX" },
        { value: 5, symbol: "V" },
        { value: 4, symbol: "IV" },
        { value: 1, symbol: "I" },
      ];

      let result = "";

      for (const item of roman) {
        while (count >= item.value) {
          result += item.symbol;
          count -= item.value;
        }
      }

      romanNumber = result;
    }

    // ==========================================
    // DYFI RESPONSES
    // ==========================================

    const numResponses =
      dyfi.product?.properties?.numResp ??
      dyfi.product?.properties?.numresp ??
      null;

    console.log("DYFI Responses:", numResponses);

    // ==========================================
    // DYFI ROMAN NUMERAL
    // ==========================================

    document.getElementById("dyfi-mmi").textContent = romanNumber;

    // ==========================================
    // DYFI ACTUAL NUMBER
    // ==========================================

    document.getElementById("dyfi-mmi-value").textContent = Number(
      dyfi.mmi,
    ).toFixed(1);

    // ==========================================
    // DYFI COLORS
    // ==========================================

    document.getElementById("dyfi-mmi-box").style.backgroundColor = dyfi.color;

    document.getElementById("dyfi-mmi-value-box").style.backgroundColor =
      dyfi.color;

    // Make sure DYFI boxes are visible

    document.getElementById("dyfi-mmi-box").style.display = "flex";

    document.getElementById("dyfi-mmi-value-box").style.display = "flex";

    // ==========================================
    // REPORTS
    // ==========================================

    if (numResponses !== null) {
      document.getElementById("dyfi-reports").textContent =
        `Reports: ${numResponses}`;
    } else {
      document.getElementById("dyfi-reports").textContent = "Reports: Unknown";
    }
  } else {
    console.log("No DYFI data:", quake.id);

    document.getElementById("dyfi-mmi").textContent = "";

    document.getElementById("dyfi-mmi-value").textContent = "";

    document.getElementById("dyfi-mmi-box").style.display = "none";

    document.getElementById("dyfi-mmi-value-box").style.display = "none";

    document.getElementById("dyfi-reports").textContent = "No DYFI data";
  }

  // ==========================================
  // SHAKE MAP
  // ==========================================

  if (
    shakeMap &&
    shakeMap.mmi !== null &&
    shakeMap.mmi !== undefined &&
    !isNaN(Number(shakeMap.mmi))
  ) {
    console.log("ShakeMap MMI:", shakeMap.mmi);

    let shakeMapCount = Math.round(Number(shakeMap.mmi));

    let shakeMapRoman = "I";

    // ==========================================
    // SHAKE MAP ROMAN NUMERAL
    // ==========================================

    if (shakeMapCount >= 10) {
      shakeMapRoman = "X+";
    } else {
      const roman = [
        { value: 9, symbol: "IX" },
        { value: 5, symbol: "V" },
        { value: 4, symbol: "IV" },
        { value: 1, symbol: "I" },
      ];

      let result = "";

      for (const item of roman) {
        while (shakeMapCount >= item.value) {
          result += item.symbol;
          shakeMapCount -= item.value;
        }
      }

      shakeMapRoman = result;
    }

    // ==========================================
    // SHAKE MAP ROMAN NUMERAL
    // ==========================================

    document.getElementById("shakemap-mmi").textContent = shakeMapRoman;

    // ==========================================
    // SHAKE MAP ACTUAL NUMBER
    // ==========================================

    document.getElementById("shakemap-mmi-value").textContent = Number(
      shakeMap.mmi,
    ).toFixed(1);

    // ==========================================
    // SHAKE MAP COLORS
    // ==========================================

    document.getElementById("shakemap-mmi-box").style.backgroundColor =
      shakeMap.color;

    document.getElementById("shakemap-mmi-value-box").style.backgroundColor =
      shakeMap.color;

    // ==========================================
    // SHOW SHAKE MAP BOXES
    // ==========================================

    document.getElementById("shakemap-mmi-box").style.display = "flex";

    document.getElementById("shakemap-mmi-value-box").style.display = "flex";

    console.log("ShakeMap displayed:", shakeMap.mmi, shakeMapRoman);
  } else {
    console.log("No ShakeMap MMI:", quake.id);

    document.getElementById("shakemap-mmi").textContent = "";

    document.getElementById("shakemap-mmi-value").textContent = "";

    document.getElementById("shakemap-mmi-box").style.display = "none";

    document.getElementById("shakemap-mmi-value-box").style.display = "none";
  }

  // ==========================================
  // SHOW / HIDE PRODUCT SECTION
  // ==========================================

  const hasDYFI =
    dyfi &&
    dyfi.mmi !== null &&
    dyfi.mmi !== undefined &&
    !isNaN(Number(dyfi.mmi));

  const hasShakeMap =
    shakeMap &&
    shakeMap.mmi !== null &&
    shakeMap.mmi !== undefined &&
    !isNaN(Number(shakeMap.mmi));

  // DYFI container
  document.getElementById("dyfi-section").style.display = hasDYFI
    ? "block"
    : "none";

  // ShakeMap container
  document.getElementById("shakemap-container").style.display = hasShakeMap
    ? "block"
    : "none";

  // Whole product section
  document.getElementById("dyfi-section").style.display =
    hasDYFI || hasShakeMap ? "flex" : "none";

  // ==========================================
  // SHOW POPUP
  // ==========================================

  const popup = document.querySelector(".more-details-popup");

  if (popup) {
    popup.classList.add("show");
  }

  // ==========================================
  // SHOW POPUP
  // ==========================================

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
