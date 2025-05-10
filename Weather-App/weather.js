    const weatherEmojis = {
      Clear: "☀️", Clouds: "☁️", Rain: "🌧", Snow: "❄️", Drizzle: "🌦",
      Thunderstorm: "⛈", Fog: "🌫"
    };

    const weatherDescriptions = {
      0: "Clear", 1: "Clear", 2: "Partly Cloudy", 3: "Clouds",
      45: "Fog", 48: "Fog", 51: "Drizzle", 53: "Drizzle", 55: "Drizzle",
      56: "Drizzle", 57: "Drizzle", 61: "Rain", 63: "Rain", 65: "Rain",
      66: "Rain", 67: "Rain", 71: "Snow", 73: "Snow", 75: "Snow",
      77: "Snow", 80: "Rain", 81: "Rain", 82: "Rain", 85: "Snow", 86: "Snow",
      95: "Thunderstorm", 96: "Thunderstorm", 99: "Thunderstorm"
    };

    async function getWeather() {
      const city = document.getElementById("cityInput").value.trim();
      const result = document.getElementById("weatherResult");
      const forecastEl = document.getElementById("forecastResult");
      if (!city) {
        result.innerHTML = "<p>Please enter a city name.</p>";
        return;
      }

      result.innerHTML = '<div class="spinner"><i class="fas fa-spinner fa-spin"></i></div>';
      forecastEl.innerHTML = "";
      localStorage.setItem("lastCity", city);

      try {
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}`);
        const geoData = await geoRes.json();
        if (!geoData.results || geoData.results.length === 0) throw new Error("City not found");

        const { latitude, longitude, name, country } = geoData.results[0];

        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weathercode&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`);
        const data = await res.json();

        const temp = data.current.temperature_2m;
        const code = data.current.weathercode;
        const desc = weatherDescriptions[code] || "Unknown";
        const emoji = weatherEmojis[desc] || "";

        result.innerHTML = `
          <p><strong>${name}, ${country}</strong></p>
          <p>🌡 ${temp} °C</p>
          <p>${emoji} ${desc}</p>
        `;

        let forecastHTML = `<div class="forecast-card">`;
        const days = data.daily.time;
        for (let i = 0; i < 5; i++) {
          const date = new Date(days[i]).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
          const max = data.daily.temperature_2m_max[i];
          const min = data.daily.temperature_2m_min[i];
          const wcode = data.daily.weathercode[i];
          const wdesc = weatherDescriptions[wcode] || "Unknown";
          const wemoji = weatherEmojis[wdesc] || "❔";
          forecastHTML += `
            <div class="day">
              <p><strong>${date}</strong></p>
              <p>${wemoji} ${wdesc}</p>
              <p>⬆ ${max}°C</p>
              <p>⬇ ${min}°C</p>
            </div>
          `;
        }
        forecastHTML += `</div>`;
        forecastEl.innerHTML = forecastHTML;
      } catch (error) {
        result.innerHTML = `<p>Error: ${error.message}</p>`;
      }
    }

    function toggleTheme() {
      const html = document.documentElement;
      html.setAttribute("data-theme", html.getAttribute("data-theme") === "light" ? "dark" : "light");
    }

    window.onload = () => {
      const lastCity = localStorage.getItem("lastCity");
      if (lastCity) {
        document.getElementById("cityInput").value = lastCity;
        getWeather();
      }
    };