/**
 * Student Name: Dhadkan K.C.
 * Student ID: 2407710
 */
const apiKey = "ee197d5374741bafce5243401fa92b5d";

// Select the necessary elements from the HTML
const searchBox = document.querySelector(".search-box");
const searchBtn = document.querySelector(".search-button");
const weatherIcon = document.querySelector(".weather-icon");
const cityElement = document.querySelector(".city");
const tempElement = document.querySelector(".temp");
const humidityElement = document.querySelector(".humidity");
const windElement = document.querySelector(".wind");
const errorElement = document.querySelector(".error");
const weatherElement = document.querySelector(".weather");
const currentTempElement = document.querySelector(".temp");
const fahrenheitBtn = document.querySelector(".fahrenheit-btn");
const celsiusBtn = document.querySelector(".celsius-btn");
const weatherphoto = document.querySelector(".icons");
const showPressure = document.querySelector(".pressure");
const showtime = document.querySelector(".display-time");
const showdiscription = document.querySelector(".weather-discription");

const city = "Hoshiarpur";

// Function to store data in local storage
function storeDataInLocalStorage(city, data) {
  localStorage.setItem(city, JSON.stringify(data));
}

// Function to check if data is available in local storage
function getStoredDataFromLocalStorage(city) {
  return JSON.parse(localStorage.getItem(city)) || null;
}


// Function to save city name to local storage
function saveCityToLocalStorage(cityName) {
  localStorage.setItem('city', cityName);
}

async function fetchWeatherFromAPI(city) {
  try {
    const response = await fetch(`https://bobbyweather.free.nf/dhadkan_2407710.php?q=${city}`);

    if (response.ok) {
      const data = await response.json();
      if (data && data.length > 0) {
        updateUI(data);
        storeDataInLocalStorage(city, data);
      } else {
        showError("Enter correct city name:");
      }
    } else {
      throw new Error("API request failed");
    }
  } catch (error) {
    console.log("Error fetching data from API:", error);
    showError("Error fetching data from API. Please try again later.");
  }
}

async function fetchWeatherFromLocalStorage(city) {
  const storedData = getStoredDataFromLocalStorage(city);
  if (storedData) {
    console.log("Fetching data from local storage...");
    updateUI(storedData);
  } else {
    showError(" Please enter correct name.");
  }
}
async function checkWeather(city) {
  try {
    const response = await fetch(`https://bobbyweather.free.nf/dhadkan_2407710.php?q=${city}`);

    if (response.ok) {
      const data = await response.json();

      if (data && data.length > 0) {
        updateUI(data);
        storeDataInLocalStorage(city, data);
      } else {
        showError("No data available for the specified city");
      }
    } else {
      throw new Error("API request failed");
    }
  } catch (error) {
    console.log("Error fetching data from API:", error);
    fetchWeatherFromLocalStorage(city);
  }
}

// Set Hoshiarpur as the default city and fetch its data
window.addEventListener("load", function () {
  const defaultCity = "Hoshiarpur"; // Set default city to Hoshiarpur
  searchBox.value = ""; // Clear search box

  // Always call checkWeather to attempt fetching data (from API or local storage)
  checkWeather(defaultCity);
});


searchBtn.addEventListener("click", function () {
  const city = searchBox.value;
  if (city) {
    // Hide error message if it's currently displayed
    errorElement.style.display = "none";
    mainContainer.style.display="block";
    // Fetch weather data for the searched city
    checkWeather(city);
  } else {
    // Display a message prompting the user to enter a city name
    showError("Please enter a city name");
    
  }
});


// Function to display an error message on the page
function showError(message) {
  errorElement.style.display = "block";
  errorElement.textContent = message;
  weatherElement.style.display = "block";
  showdiscription.style.display = "block";
  mainContainer.style.display="none";
}

// Function to update the UI with weather data
function updateUI(data) {
  cityElement.innerHTML = data[0].city_name;
  currentTempElement.innerHTML =Math.round(data[0].temperature) + "&deg;c";
  tempElement.innerHTML =Math.round(data[0].temperature) + "&deg;c";
  humidityElement.innerHTML = data[0].humidity + "%";
  windElement.innerHTML = data[0].wind + "km/h";
  showPressure.innerHTML = data[0].pressure + "hpa";
  showdiscription.innerHTML = data[0].weather_description || "";

  weatherphoto.innerHTML = `<img src=https://openweathermap.org/img/wn/${data[0].weather_icon}@4x.png>`;
  let date = data[0].currenttime;
  const newDate = new Date(date * 1000).toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  });

  // For Weather Info
  showtime.innerHTML = `${date}`;

};

checkWeather(city);

//get past weather

async function getpastWeather(cityName) {
  const defaultCityName = "Hoshiarpur";
  const fetchCityName = cityName ? cityName : defaultCityName;
  searchBox.value = "";

  try {
    let data = getStoredDataFromLocalStorage(fetchCityName);
    if (!data) {
      throw new Error(`No past weather data available for ${fetchCityName}`);
    }

    const pastHistoryContainer = document.querySelector(".pasthistory");
    pastHistoryContainer.innerHTML = "";

    // Ensure data is an array before proceeding
    if (!Array.isArray(data)) {
      throw new Error("Past weather data is not in the expected format");
    }

    // Filter out today's data from the fetched history data
    const todayDate = new Date().toISOString().slice(0, 10);
    const filteredData = data.filter((item) => item.date !== todayDate);

    // Sort the filtered data by day of the week (Sunday to Saturday)
    filteredData.sort((a, b) => {
      const dayOfWeekA = new Date(a.currenttime).getDay();
      const dayOfWeekB = new Date(b.currenttime).getDay();
      return dayOfWeekA - dayOfWeekB;
    });

    const displayedDays = new Set();

    filteredData.forEach((item) => {
      const dayOfWeek = new Date(item.currenttime).getDay();
      const options = {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      };
      const formattedDate = new Date(
        item.currenttime
      ).toLocaleDateString("en-US", options);

      if (!displayedDays.has(dayOfWeek)) {
        const pastDataItem = document.createElement("div");
        pastDataItem.classList.add("past-data-item");

        const weatherDate = document.createElement("div");
        weatherDate.classList.add("weather-date");
        weatherDate.textContent = formattedDate;

        const weatherCondition = document.createElement("div");
        weatherCondition.classList.add("weather-condition");
        weatherCondition.textContent = item.weather_description;

        const weatherTemperature = document.createElement("div");
        weatherTemperature.classList.add("weather-temperature");
        weatherTemperature.innerHTML = `Temp:` + item.temperature + "°C";

        const weatherhumidity = document.createElement("div");
        weatherhumidity.classList.add("weather-humidity");
        weatherhumidity.innerHTML = `humidity:` + item.humidity + "pa";

        const weatherIcon = document.createElement("div");
        weatherIcon.classList.add("icons");
        weatherIcon.innerHTML = `<img src=https://openweathermap.org/img/wn/${item.weather_icon}@4x.png>`;
        
        pastDataItem.appendChild(weatherDate);
        pastDataItem.appendChild(weatherCondition);
        pastDataItem.appendChild(weatherTemperature);
        pastDataItem.appendChild(weatherhumidity);
        pastDataItem.appendChild(weatherIcon);

        pastHistoryContainer.appendChild(pastDataItem);

        displayedDays.add(dayOfWeek);
      }
    });

    
  } catch (error) {
    console.error("Error fetching past weather data:", error);
  }
}


let pastButton = document.querySelector(".past-button");
let mainContainer = document.querySelector(".container");
let pastSection = document.querySelector(".past-data");
let pasthistory = document.querySelector(".pasthistory");
let cityName = "hosiarpur";

pastButton.addEventListener("click", () => {
  getpastWeather(searchBox.value);
  mainContainer.style.display = "none";
  pastSection.style.display = "block";
  pastButton.style.display = "none";
  pasthistory.style.display = "block";
  returnButton.style.display = "block";
  searchBtn.style.display = "none";
  searchBox.style.display = "none";
  errorElement.style.display="none";
});

let returnButton = document.querySelector(".return-button");
returnButton.addEventListener("click", () => {
  getpastWeather(cityName);
  mainContainer.style.display = "block";
  pastSection.style.display = "none";
  pastButton.style.display = "block";
  pasthistory.style.display = "none";
  // Show the search bar and button when returning
  searchBox.style.display = "block";
  searchBtn.style.display = "block";
});