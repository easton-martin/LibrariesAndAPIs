/*
Name: Easton Martin
Description: This code helps run my hunting log application.
*/
//   Function to get Location. Returns a promise that resolves into {lat, long}
      function getLocation() {
        // Create a new promise
        let locationPromise = new Promise((resolve, reject) => {
          // Access the current position of the user:
          navigator.geolocation.getCurrentPosition((pos) => {
            // Grab the lat and long
            let long = pos.coords.longitude;
            let lat = pos.coords.latitude;
            // If you can get those values: resolve with an object or reject if not
            resolve({ lat, long });
          }, reject);
        });
        //   return the promise
        return locationPromise;
      }


// Write your code here:
// use jQuery to create a submit event for the form
$("#tripForm").on("submit", async function (e) {
  // call prevet default
  e.preventDefault();
  // use FormData to get date and notes
  let formEl = this;
  let formData = new FormData(formEl);
  let date = formData.get("tripDate");
  let notes = formData.get("notes");
  try {
    // get a location
    let { lat, long } = await getLocation();
    // define URL and retrieve the weather data
    let url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&daily=sunrise,sunset&current=temperature_2m&timezone=auto&forecast_days=1&temperature_unit=fahrenheit`;
    let response = await axios.get(url);
    let data = response.data;
    let sunriseTime = data.daily.sunrise[0];
    let sunsetTime = data.daily.sunset[0];
    let temperature = null;
    if (data.current && typeof data.current.temperature_2m === "number"){
      temperature = data.current.temperature_2m;
    }
    // create the log entry object
    let logEntry  = {
      latitude: lat,
      longitude: long,
      date: date, 
      sunriseTime: sunriseTime,
      sunsetTime: sunsetTime,
      notes: notes,
      temperature: temperature,
    };
    // save entry to localStorage under "huntingLogs"
    const existing = localStorage.getItem("huntingLogs");
    const logs = existing ? JSON.parse(existing) : [];
    logs.push(logEntry);
    localStorage.setItem("huntingLogs", JSON.stringify(logs));
    // reset the form
    formEl.reset();
    // refresh the UI
    if (typeof loadLogs === "function"){
      loadLogs();
    }
  }catch (err){
    console.error("Error creating log entry:", err);
    alert("Unable to save log.");
  }
});

// loadLogs function
function loadLogs(){
  // get huntingLogs values from localStorage
  const logsJson = localStorage.getItem("huntingLogs");
  // if it exists, parse it into an array, otherwise create an empty array
  const logs = logsJson ? JSON.parse(logsJson) : [];
  const $container = $("#logContainer");
  // if array is empty, render a no logs message
  if (!logs.length){
    $container.html("<p>No hunting logs saved yet. Add one now!</p>");
    return;
  }
  // create the HTML for each log
  const html = logs.map(log =>
        `<div class="entry">
          <p>Date: ${log.date}</p>
          <p>Location: ${log.latitude}, ${log.longitude}</p>
          <p>Sunrise: ${log.sunriseTime}</p>
          <p>Sunset: ${log.sunsetTime}</p>
          <p>Temperature: ${log.temperature} F</p>
          <p>Notes: ${log.notes}</p>
        </div>
      `).join("");
  // use jQuery to set the container's HTML
  $container.html(html);
}
// call loadLogs() on page open
$(document).ready(function () {
  loadLogs();
});