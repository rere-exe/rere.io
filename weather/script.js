// script.js (ES module)
const API_BACKEND = null; 
// If you have a backend proxy, set to e.g. '/weather' and backend will accept ?q=city
// For quick testing you can call OpenWeather directly (not recommended for prod).
const OPENWEATHER_DIRECT = true; // set to false if using backend proxy
const OPENWEATHER_KEY = '6be8ec28f51ea657dc1886e4e1b9ecc3';

const fetchBtn = document.getElementById('fetchBtn');
const cityInput = document.getElementById('cityInput');
const currentEl = document.getElementById('current');
const ctx = document.getElementById('tempChart').getContext('2d');

let chart = null;

fetchBtn.addEventListener('click', () => {
  const city = cityInput.value.trim();
  if(!city) return showMessage('Type a city name first');
  getWeatherForCity(city);
});
cityInput.addEventListener('keypress', (e)=>{ if(e.key==='Enter') fetchBtn.click() });

function showMessage(msg){
  currentEl.innerHTML = `<div class="loading">${msg}</div>`;
}

// Build fetch helper - calls backend proxy if configured, otherwise calls OpenWeather directly
async function fetchWeather(city){
  if(!OPENWEATHER_DIRECT && API_BACKEND){
    const res = await fetch(`${API_BACKEND}?q=${encodeURIComponent(city)}`);
    return res.json();
  } else {
    // 1) current weather
    const curUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${OPENWEATHER_KEY}`;
    const cur = await fetch(curUrl).then(r=>r.json());
    // 2) forecast (5 day / 3 hour)
    const fUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&units=metric&appid=${OPENWEATHER_KEY}`;
    const forecast = await fetch(fUrl).then(r=>r.json());
    return { current: cur, forecast };
  }
}

function formatTime(ts){
  const d = new Date(ts*1000);
  return d.toLocaleString([], {month:'short', day:'numeric', hour:'numeric', minute:'2-digit'});
}

async function getWeatherForCity(city){
  try{
    showMessage('Loading...');
    const data = await fetchWeather(city);

    // Handle OpenWeather error codes
    if(data.current && data.current.cod && data.current.cod !== 200){
      return showMessage(`Error: ${data.current.message||'cannot fetch'}`);
    }
    if(data.forecast && data.forecast.cod && data.forecast.cod !== "200"){
      return showMessage(`Error: ${data.forecast.message||'cannot fetch'}`);
    }

    // When using direct mode, we have current & forecast as separate props
    const cur = data.current || data.currentWeather || data.current;
    const forecast = data.forecast || data.forecast;

    // populate current weather block
    const icon = cur.weather?.[0]?.icon;
    const desc = cur.weather?.[0]?.description || '—';
    currentEl.innerHTML = `
      <div class="icon">
        ${icon ? `<img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${desc}" />` : ''}
      </div>
      <div class="metrics">
        <h2>${cur.name}, ${cur.sys?.country || ''} — ${Math.round(cur.main.temp)}°C</h2>
        <p>${desc} • Feels: ${Math.round(cur.main.feels_like)}°C</p>
        <p>Humidity: ${cur.main.humidity}% • Wind: ${cur.wind?.speed ?? '?'} m/s</p>
        <p class="muted">Updated: ${formatTime(cur.dt)}</p>
      </div>
    `;

    // Build chart data: pick forecast.list items and map time -> temp
    const list = (forecast.list || []).slice(0, 24); // next ~3 days (24 * 3-hour entries = 72h); adjust as needed
    const labels = list.map(i => {
      const d = new Date(i.dt * 1000);
      return d.toLocaleString([], {month:'short', day:'numeric', hour:'numeric'});
    });
    const temps = list.map(i => Math.round(i.main.temp * 10) / 10);

    // create/update chart
    if(chart) {
      chart.data.labels = labels;
      chart.data.datasets[0].data = temps;
      chart.update();
    } else {
      chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: 'Temperature (°C)',
            data: temps,
            fill: true,
            tension: 0.35,
            pointRadius: 3,
          }]
        },
        options: {
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { maxRotation: 0, minRotation: 0 } },
            y: { beginAtZero: false }
          },
          responsive: true,
          maintainAspectRatio: false
        }
      });
    }

  }catch(err){
    console.error(err);
    showMessage('Failed to fetch weather. Open console for details.');
  }
}
