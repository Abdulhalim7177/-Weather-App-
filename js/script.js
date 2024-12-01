
// API Key and URL
const apiKey = '301d88cfa61f6365b9de06604abd3193';
const baseUrl = 'https://api.openweathermap.org/data/2.5/';

// DOM Elements
const todayTemp = document.getElementById('today-temp');
const todayDesc = document.getElementById('today-desc');
const todayLocation = document.getElementById('today-location');
const todayIcon = document.getElementById('today-icon');
const todayHumidity = document.getElementById('today-humidity');
const todayWind = document.getElementById('today-wind');
const todayPressure = document.getElementById('today-pressure');
const todayVisibility = document.getElementById('today-visibility');
const forecastList = document.getElementById('forecast-list');
const getCityBtn = document.getElementById('get-city-btn');
const getLocationBtn = document.getElementById('get-location-btn');
const cityInput = document.getElementById('city-input');

// Initialize the map
const map = L.map('map').setView([0, 0], 2); // Default view (world map)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '© OpenStreetMap'
}).addTo(map);

let marker; // Variable to store the marker

// Function to place a marker at a clicked location
map.on('click', function(e) {
  if (marker) {
    map.removeLayer(marker); // Remove the previous marker
  }
  const { lat, lng } = e.latlng;
  marker = L.marker([lat, lng]).addTo(map); // Place a new marker
  getWeatherDataByCoordinates(lat, lng); // Fetch weather data for the clicked location
});

// Function to fetch weather data by coordinates
async function getWeatherDataByCoordinates(lat, lon) {
  try {
    const response = await fetch(`${baseUrl}weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`);
    const data = await response.json();

    // Check for errors
    if (data.cod !== 200) {
      alert('Unable to retrieve weather data for this location.');
      return;
    }

    // Populate today's weather data
    todayTemp.innerText = `${Math.round(data.main.temp)}°C`;
    todayDesc.innerText = data.weather[0].description;
    todayLocation.innerText = `${data.name}, ${data.sys.country}`;
    todayIcon.innerHTML = `<img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png" alt="${data.weather[0].description}" class="w-24 h-24">`;
    todayHumidity.innerText = `Humidity: ${data.main.humidity}%`;
    todayWind.innerText = `Wind: ${data.wind.speed} km/h`;
    todayPressure.innerText = `Pressure: ${data.main.pressure} hPa`;
    todayVisibility.innerText = `Visibility: ${data.visibility / 1000} km`;

    // Update the map with the current location
    updateMap(lat, lon);

    // Fetch the 5-day forecast for the coordinates
    getWeatherForecast(data.name);
  } catch (error) {
    console.error('Error fetching weather data:', error);
  }
}

// Function to fetch 5-Day Weather Forecast
async function getWeatherForecast(city) {
  try {
    const response = await fetch(`${baseUrl}forecast?q=${city}&units=metric&appid=${apiKey}`);
    const forecastData = await response.json();

    // Check for errors
    if (forecastData.cod !== "200") {
      alert('Forecast data not found. Please try again.');
      return;
    }

    // Clear previous forecast data
    forecastList.innerHTML = '';

    // Process the forecast data
    const forecasts = forecastData.list.filter((entry, index) => index % 8 === 0); // Take one entry every 8 hours (3 hours interval)
    forecasts.forEach(forecast => {
      const date = new Date(forecast.dt * 1000);
      const temp = Math.round(forecast.main.temp);
      const description = forecast.weather[0].description;
      const icon = forecast.weather[0].icon;

      const forecastCard = `
        <div class="bg-gray-100 p-4 rounded-lg shadow-md text-center">
          <h3 class="text-lg font-semibold">${date.toLocaleDateString()}</h3>
          <img src="https://openweathermap.org/img/wn/${icon}.png" alt="${description}" class="w-16 h-16 mx-auto">
          <p class="text-2xl font-bold">${temp}°C</p>
          <p class="text-gray-600 capitalize">${description}</p>
        </div>
      `;
      forecastList.insertAdjacentHTML('beforeend', forecastCard);
    });
  } catch (error) {
    console.error('Error fetching 5-day weather forecast:', error);
  }
}

// Function to update the map with coordinates
function updateMap(lat, lon) {
  map.setView([lat, lon], 13); // Zoom into the location
  if (marker) {
    map.removeLayer(marker); // Remove the previous marker if exists
  }
  marker = L.marker([lat, lon]).addTo(map); // Place a new marker
}

// Fetch weather data for a default city on page load
window.onload = () => {
  const defaultCity = 'London'; // Default city
  getWeatherData(defaultCity);
};

// Button Event Listeners
getCityBtn.addEventListener('click', () => {
  const city = cityInput.value.trim();
  if (city) {
    getWeatherData(city);
  } else {
    alert('Please enter a city name.');
  }
});

getLocationBtn.addEventListener('click', () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      getWeatherDataByCoordinates(latitude, longitude);
      updateMap(latitude, longitude); // Update the map with the current location
    }, () => {
      alert('Unable to retrieve your location.');
    });
  } else {
    alert('Geolocation is not supported by this browser.');
  }
});