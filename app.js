
const API_KEY = "302510fb327bc617b6dd9f6d4a03d120"; 
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";


function montarUrl(cidade) {
  return `${BASE_URL}?q=${encodeURIComponent(cidade)}&appid=${API_KEY}&units=metric&lang=pt_br`;
}


function mensagemPorStatus(status) {
  if (status === 401) return "Chave de API inválida ou ainda não ativada. Aguarde alguns minutos.";
  if (status === 404) return "Cidade não encontrada. Verifique a digitação.";
  if (status === 429) return "Limite de requisições excedido. Tente novamente em instantes.";
  if (status >= 500) return "O servidor da API está com problemas. Tente mais tarde.";
  return "Ocorreu um erro inesperado na requisição.";
}

// ===== 2) REQUISIÇÃO COM FETCH =====
async function fetchWeather(cidade) {
  try {

    const response = await fetch(montarUrl(cidade), { signal: AbortSignal.timeout(8000) });

    // ATENÇÃO: o fetch NÃO joga erro em 404/401. Precisamos verificar manualmente!
    if (!response.ok) {
      throw new Error(mensagemPorStatus(response.status));
    }

    const data = await response.json(); 
    displayWeather(data, "fetch");
  } catch (error) {
    if (error.name === "TimeoutError") {
      displayError("A requisição demorou demais. Verifique sua conexão.");
    } else if (error.name === "TypeError") {
      displayError("Falha de conexão. Verifique sua internet.");
    } else {
      displayError(error.message);
    }
  }
}


async function axiosWeather(cidade) {
  try {
    const response = await axios.get(montarUrl(cidade), { timeout: 8000 });
    displayWeather(response.data, "axios"); // axios já converte o JSON sozinho
  } catch (error) {
    if (error.response) {
      // O servidor respondeu com erro (404, 401, 429...)
      displayError(mensagemPorStatus(error.response.status));
    } else if (error.request) {
      // O pedido saiu, mas não houve resposta
      displayError("Sem resposta da API. Verifique sua conexão com a internet.");
    } else {
      displayError("Erro ao montar a requisição: " + error.message);
    }
  }
}


function displayWeather(data, metodo) {
  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = `
    <h2>Clima em ${data.name} (${data.sys.country})</h2>
    <p><strong>Temperatura:</strong> ${data.main.temp} °C</p>
    <p><strong>Sensação térmica:</strong> ${data.main.feels_like} °C</p>
    <p><strong>Descrição:</strong> ${data.weather[0].description}</p>
    <p><strong>Umidade:</strong> ${data.main.humidity}%</p>
    <p><strong>Pressão:</strong> ${data.main.pressure} hPa</p>
    <p><strong>Vento:</strong> ${data.wind.speed} m/s</p>
    <p><em>Consulta feita com: ${metodo}</em></p>
  `;
  document.getElementById("error").innerHTML = ""; // limpa erros antigos
}

function displayError(message) {
  document.getElementById("error").innerHTML = `⚠️ ${message}`;
  document.getElementById("result").innerHTML = ""; // limpa resultados antigos
}


async function getWeather() {
  const cidade = document.getElementById("city").value.trim();
  const metodo = document.getElementById("method").value;
  const loading = document.getElementById("loading");

  if (cidade === "") {
    displayError("Por favor, insira o nome de uma cidade.");
    return;
  }

  if (API_KEY === "SUA_CHAVE_AQUI") {
    displayError("Você esqueceu de colocar sua chave da API no arquivo app.js!");
    return;
  }

  loading.classList.remove("oculto"); 
  document.getElementById("error").innerHTML = "";
  document.getElementById("result").innerHTML = "";

  if (metodo === "fetch") {
    await fetchWeather(cidade);
  } else {
    await axiosWeather(cidade);
  }

  loading.classList.add("oculto"); 
}


document.getElementById("btnBuscar").addEventListener("click", getWeather);

document.getElementById("city").addEventListener("keydown", (e) => {
  if (e.key === "Enter") getWeather();
});
