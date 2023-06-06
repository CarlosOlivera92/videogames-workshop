export async function getGameData(params) {
  const apiKey = '2e9a5f65615741ebbd2def83f8bcf03a';
  try {
    // URL de la API de RAWG con los parámetros incluidos
    const apiUrl = `https://api.rawg.io/api/games?key=${apiKey}&${params}`;

    // Hacer la solicitud GET a la API
    const response = await fetch(apiUrl);
    const data = await response.json();
    const result = await data;
    return result;
    // Hacer algo con los datos
  } catch (error) {
    console.log('Error al obtener los datos:', error);
  }
}