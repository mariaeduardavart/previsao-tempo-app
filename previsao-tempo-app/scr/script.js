const api = {
    key: "421cf58d2b06456e521c08ed20274bb7",
    base: "https://api.openweathermap.org/data/2.5/",
    lang: "pt_br",
    units: "metric"
};

const cityElement = document.querySelector('.city');
const dateElement = document.querySelector('.date');
const containerImgElement = document.querySelector('.container-img');
const containerTempElement = document.querySelector('.container-temp');
const tempNumberElement = document.querySelector('.container-temp div');
const tempUnitElement = document.querySelector('.container-temp span');
const weatherElement = document.querySelector('.weather');
const searchInputElement = document.querySelector('.form-control');
const searchButtonElement = document.querySelector('.btn');
const lowHighElement = document.querySelector('.low-high');

const capitalizeFirstLetter = (string) => string.charAt(0).toUpperCase() + string.slice(1);

const getWeatherData = async (url) => {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error: status ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(error);
        return null; // Retorna null em caso de erro
    }
};

const updateWeather = (weatherData) => {
    cityElement.innerText = `${weatherData.name}, ${weatherData.sys.country}`;

    const now = new Date();
    dateElement.innerText = dateBuilder(now);

    const iconName = weatherData.weather[0].icon;
    containerImgElement.innerHTML = `<img src="./icons/${iconName}.png">`;

    const temperature = Math.round(weatherData.main.temp);
    tempNumberElement.innerText = temperature;
    tempUnitElement.innerText = `°c`;

    const weatherDescription = weatherData.weather[0].description;
    weatherElement.innerText = capitalizeFirstLetter(weatherDescription);

    lowHighElement.innerText = `${Math.round(weatherData.main.temp_min)}°c / ${Math.round(weatherData.main.temp_max)}°c`;

};

const dateBuilder = (date) => {
    const days = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
    const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

    const day = days[date.getDay()];
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${day}, ${date.getDate()} ${month} ${year}`;
};

const getGeolocation = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(handleGeolocation, showError);
    } else {
        alert('Navegador não suporta geolocalização');
    }
};

const handleGeolocation = (position) => {
    const { latitude, longitude } = position.coords;
    const geolocationWeatherUrl = `${api.base}weather?lat=${latitude}&lon=${longitude}&lang=${api.lang}&units=${api.units}&APPID=${api.key}`;
    getWeatherData(geolocationWeatherUrl)
        .then((weatherData) => {
            if (weatherData !== null) {
                updateWeather(weatherData);
            } else {
                showError("Erro ao obter os dados da API.");
            }
        })
        .catch((error) => {
            showError(error.message);
        });
};

const showError = (message) => {
    alert(`Erro: ${message}`);
};

const searchWeather = () => {
    const city = searchInputElement.value.trim();
    if (city) {
        const searchWeatherUrl = `${api.base}weather?q=${city}&lang=${api.lang}&units=${api.units}&APPID=${api.key}`;
        getWeatherData(searchWeatherUrl)
            .then((weatherData) => {
                if (weatherData !== null) {
                    updateWeather(weatherData);
                    clearInputAndFocus();
                } else {
                    showError("Cidade não encontrada. Verifique o nome digitado.");
                }
            })
            .catch((error) => {
                showError(error.message);
            });
    }
};

const clearInputAndFocus = () => {
    searchInputElement.value = '';
    searchInputElement.focus(); 
};

window.addEventListener('load', () => {
    iniciarAtualizacaoPeriodica();
});

function iniciarAtualizacaoPeriodica() {
    getGeolocation();
    setInterval(atualizarDadosPeriodicamente, 5 * 60 * 1000); // 5 minutos (em milissegundos)
}

searchButtonElement.addEventListener('click', searchWeather);
searchInputElement.addEventListener('keypress', (event) => {
    const key = event.keyCode;
    if (key === 13) {
        searchWeather();
    }
});

containerTempElement.addEventListener('click', () => {
    const tempNumberNow = tempNumberElement.innerText;
    if (tempUnitElement.innerText === '°c') {
        const fahrenheit = (tempNumberNow * 1.8) + 32;
        tempUnitElement.innerText = '°f';
        tempNumberElement.innerText = Math.round(fahrenheit);
    } else {
        const celsius = (tempNumberNow - 32) / 1.8;
        tempUnitElement.innerText = '°c';
        tempNumberElement.innerText = Math.round(celsius);
    }
});
