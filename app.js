
const plannerForm = document.getElementById("planner-form");
const departureDate = document.getElementById("departure-date");
const returnDate = document.getElementById("return-date");
const formMessage = document.getElementById("form-message");

const getTrips = () => {
    return JSON.parse(localStorage.getItem("planify-trips")) || [];
};

departureDate.addEventListener("change", () => {
    returnDate.min = departureDate.value;

    if (returnDate.value && returnDate.value < departureDate.value) {
        returnDate.value = "";
    }
});

plannerForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (returnDate.value < departureDate.value) {
        formMessage.textContent = "La fecha de regreso debe ser igual o posterior a la salida.";
        return;
    }

    const trip = {
        id: Date.now(),
        name: document.getElementById("trip-name").value.trim(),
        destination: document.getElementById("trip-destination").value.trim(),
        departure: departureDate.value,
        returnDate: returnDate.value,
        travelers: Number(document.getElementById("travelers").value),
        budget: Number(document.getElementById("budget").value),
        comments: document.getElementById("trip-comments").value.trim()
    };

    const trips = getTrips();
    trips.push(trip);

    localStorage.setItem("planify-trips", JSON.stringify(trips));
renderTrips();
    formMessage.textContent = "¡Tu viaje se ha guardado correctamente!";
    plannerForm.reset();
    returnDate.min = "";
});

const tripsList = document.getElementById("trips-list");

function renderTrips() {
    const trips = getTrips();

    tripsList.replaceChildren();

    if (trips.length === 0) {
        const message = document.createElement("p");
        message.className = "empty-trips";
        message.textContent = "Todavía no tienes viajes guardados. ¡Crea tu primera aventura!";
        tripsList.appendChild(message);
        return;
    }

    trips.forEach((trip) => {
        const card = document.createElement("article");
        card.className = "trip-card";

        const title = document.createElement("h3");
        title.textContent = trip.name;

        const destination = document.createElement("p");
        destination.textContent = `Destino: ${trip.destination}`;

        const dates = document.createElement("p");
        dates.textContent = `Salida: ${trip.departure} | Regreso: ${trip.returnDate}`;

        const travelers = document.createElement("p");
        travelers.textContent = `Viajeros: ${trip.travelers}`;

        const budget = document.createElement("p");
        budget.textContent = `Presupuesto: ${Number(trip.budget).toLocaleString("es-CO")} COP`;

        const comments = document.createElement("p");
        comments.textContent = `Preferencias: ${trip.comments || "Sin comentarios"}`;

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-trip";
        deleteButton.textContent = "Eliminar viaje";
        deleteButton.addEventListener("click", () => {
            const updatedTrips = getTrips().filter((item) => item.id !== trip.id);
            localStorage.setItem("planify-trips", JSON.stringify(updatedTrips));
            renderTrips();
        });

        card.append(title, destination, dates, travelers, budget, comments, deleteButton);
        tripsList.appendChild(card);
    });
}

renderTrips();


const favoritesList = document.getElementById("favorites-list");

function getFavorites() {
    return JSON.parse(localStorage.getItem("planify-favorites")) || [];
}

function renderFavorites() {
    const favorites = getFavorites();

    favoritesList.replaceChildren();

    if (favorites.length === 0) {
        const message = document.createElement("p");
        message.className = "empty-favorites";
        message.textContent = "Todavía no tienes destinos favoritos.";
        favoritesList.appendChild(message);
        return;
    }

    favorites.forEach((destination) => {
        const card = document.createElement("article");
        card.className = "favorite-card";

        const title = document.createElement("h3");
        title.textContent = destination;

        const button = document.createElement("button");
        button.className = "favorite-button";
        button.textContent = "Quitar de favoritos";

        button.addEventListener("click", () => {
            const updatedFavorites = getFavorites().filter(
                (item) => item !== destination
            );

            localStorage.setItem("planify-favorites", JSON.stringify(updatedFavorites));
            renderFavorites();
            updateFavoriteButtons();
        });

        card.append(title, button);
        favoritesList.appendChild(card);
    });
}

function updateFavoriteButtons() {
    const favorites = getFavorites();

    document.querySelectorAll("[data-destination]").forEach((button) => {
        const destination = button.dataset.destination;
        const isFavorite = favorites.includes(destination);

        button.textContent = isFavorite
            ? "♥ En favoritos"
            : "♡ Añadir a favoritos";
    });
}

document.querySelectorAll("[data-destination]").forEach((button) => {
    button.addEventListener("click", () => {
        const destination = button.dataset.destination;
        const favorites = getFavorites();

        if (favorites.includes(destination)) {
            const updatedFavorites = favorites.filter(
                (item) => item !== destination
            );
            localStorage.setItem("planify-favorites", JSON.stringify(updatedFavorites));
        } else {
            favorites.push(destination);
            localStorage.setItem("planify-favorites", JSON.stringify(favorites));
        }

        renderFavorites();
        updateFavoriteButtons();
    });
});

renderFavorites();
updateFavoriteButtons();



const weatherDestination = document.getElementById("weather-destination");
const weatherResult = document.getElementById("weather-result");

const weatherCities = {
    Paris: { latitude: 48.8566, longitude: 2.3522 },
    Rome: { latitude: 44.1194, longitude: 9.7073 },
    "New York": { latitude: 40.7128, longitude: -74.006 }
};

async function loadWeather() {
    const city = weatherDestination.value;
    const location = weatherCities[city];

    weatherResult.textContent = "Consultando el clima actual...";

    try {
const url = `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&forecast_days=5&timezone=auto`;


        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("No se pudo consultar el clima.");
        }

        const data = await response.json();
        const weather = data.current;
        const forecast = data.daily;

        

weatherResult.innerHTML = "";

const weatherMetrics = [
    {
        label: "Temperatura actual",
        value: `${weather.temperature_2m} °C`,
        icon: '<img src="temperature-high.svg" alt="" class="weather-icon-img">'
    },
    {
        label: "Sensación térmica",
        value: `${weather.apparent_temperature} °C`,
        icon: '<img src="clouds-sun.svg" alt="" class="weather-icon-img">'
    },
    {
        label: "Humedad",
        value: `${weather.relative_humidity_2m}%`,
        icon: '<img src="skin-drop.svg" alt="" class="weather-icon-img">'
    },
    {
        label: "Viento",
        value: `${weather.wind_speed_10m} km/h`,
        icon: '<img src="wind.svg" alt="" class="weather-icon-img">'
    }
];
const metricsGrid = document.createElement("div");
metricsGrid.className = "weather-metrics";

weatherMetrics.forEach((metric) => {
    const card = document.createElement("article");
    card.className = "weather-metric";

    const icon = document.createElement("span");
icon.className = "weather-metric-icon";
icon.innerHTML = metric.icon;

    const label = document.createElement("p");
    label.textContent = metric.label;

    const value = document.createElement("strong");
    value.textContent = metric.value;

    card.append(icon, label, value);
    metricsGrid.appendChild(card);
});

weatherResult.appendChild(metricsGrid);


const forecastTitle = document.createElement("h4");
forecastTitle.textContent = "Pronóstico de los próximos días";

const forecastList = document.createElement("div");
forecastList.className = "forecast-grid";

data.daily.time.forEach((date, index) => {
    const item = document.createElement("article");
    item.className = "forecast-day";

    const formattedDate = new Date(`${date}T12:00:00`).toLocaleDateString("es-CO", {
        weekday: "long",
        day: "numeric",
        month: "short"
    });

    const dateLabel = document.createElement("h5");
    dateLabel.textContent = formattedDate;

    const temperatureLabel = document.createElement("p");
    temperatureLabel.className = "forecast-temperature";
    temperatureLabel.textContent =
        `${data.daily.temperature_2m_max[index]} °C`;

    const minimumLabel = document.createElement("p");
    minimumLabel.className = "forecast-minimum";
    minimumLabel.textContent =
        `Mín. ${data.daily.temperature_2m_min[index]} °C`;

    item.append(dateLabel, temperatureLabel, minimumLabel);
    forecastList.appendChild(item);
});

        weatherResult.append(forecastTitle, forecastList);
    } catch (error) {
        weatherResult.textContent =
            "No pudimos consultar el clima. Revisa tu conexión e inténtalo de nuevo.";
    }
}

weatherDestination.addEventListener("change", loadWeather);

loadWeather();

async function loadParisCountryInfo() {
    try {
        const response = await fetch("https://countries.dev/alpha/FR");

        if (!response.ok) {
            throw new Error("No se pudo consultar Francia.");
        }

        const country = await response.json();

        document.getElementById("paris-country").textContent =
            country.name || "Francia";

        document.getElementById("paris-capital").textContent =
            country.capital || "París";

        
document.getElementById("paris-language").textContent = "Francés";

const currencies = country.currencies;
const currency = Array.isArray(currencies)
    ? currencies[0]
    : Object.values(currencies || {})[0];

document.getElementById("paris-currency").textContent =
    typeof currency === "string"
        ? currency
        : currency
            ? `${currency.name || currency.code} (${currency.code || ""})`
            : "Euro (EUR)";
} catch (error) {
    console.error("Error al consultar Francia:", error);
}
}

loadParisCountryInfo();


const themeToggle = document.getElementById("theme-toggle");

function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);

    const isDark = theme === "dark";

    themeToggle.textContent = "Tema";
    themeToggle.setAttribute(
        "aria-label",
        isDark ? "Activar modo claro" : "Activar modo oscuro"
    );
}

const savedTheme = localStorage.getItem("planify-theme") || "light";

applyTheme(savedTheme);

themeToggle.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";

    localStorage.setItem("planify-theme", newTheme);
    applyTheme(newTheme);
});
