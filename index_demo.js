const PAGE_SIZE = 10
let currentPage = 1;
let pokemons = []
// let numPages;
// Array to store selected checkbox
let selectedValues = [];
let selected_pokemons = [];


function handleCheckboxChange(checkbox) {
    if (checkbox.checked) {
        selectedValues.push(checkbox.value);
        console.log('Selected values:', selectedValues);
        // Perform further actions with the selected values here
    } else {
        const index = selectedValues.indexOf(checkbox.value);
        if (index !== -1) {
            selectedValues.splice(index, 1);
        }
        console.log('Selected values:', selectedValues);
        // Perform further actions when a checkbox is unchecked here
    }
    paginate(currentPage, PAGE_SIZE, pokemons, selectedValues);
}

const updatePaginationDiv = (currentPage, numPages, selectedValues, selectedPokemons) => {
    const startPage = Math.max(currentPage - 2, 1);
    const endPage = Math.min(startPage + 4, numPages);
    $('#pagination').empty();
  
    // Create previous button
    const previousButton = $(`
      <button class="btn btn-primary page ml-1 numberedButtons" value="previous" style="margin: 1%;">Previous</button>
    `);
    if (currentPage === 1) {
      previousButton.hide();
    }
    previousButton.on('click', () => {
      if (currentPage > 1) {
        currentPage--;
        updatePaginationDiv(currentPage, numPages, selectedValues, selectedPokemons);
        paginate(currentPage, PAGE_SIZE, pokemons, selectedValues);
      }
    });
    $('#pagination').append(previousButton);
  
    // Highlight the current page
    for (let i = startPage; i <= endPage; i++) {
      const buttonClass = i === currentPage ? 'btn btn-warning page ml-1 numberedButtons' : 'btn btn-primary page ml-1 numberedButtons';
      const button = $(`
        <button class="${buttonClass}" value="${i}" style="margin: 1%;">${i}</button>
      `);
      $('#pagination').append(button);
    }
  
    // Create next button
    const nextButton = $(`
      <button class="btn btn-primary page ml-1 numberedButtons" value="next" style="margin: 1%;">Next</button>
    `);
  
    if (currentPage === numPages) {
      nextButton.hide();
    }
    nextButton.on('click', () => {
      if (currentPage < numPages) {
        currentPage++;
        updatePaginationDiv(currentPage, numPages, selectedValues, selectedPokemons);
        paginate(currentPage, PAGE_SIZE, pokemons, selectedValues);
      }
    });
  
    $('#pagination').append(nextButton);
  };
  

//get the desired pokemons on this page
const paginate = async (currentPage, PAGE_SIZE, pokemons, selectedValues) => {
    if (selectedValues.length !== 0) {
        // Filter the pokemons based on the selected type
        filteredPokemons = await Promise.all(pokemons.map(async (pokemon) => {
            const res = await axios.get(pokemon.url);
            const types = res.data.types.map(type => type.type.name);
            if (selectedValues.every((selectedValue) => types.includes(selectedValue))) {
                return pokemon;
            }
        }));
        selected_pokemons = filteredPokemons.filter(pokemon => pokemon !== undefined);
        console.log("selected:", selected_pokemons);
    } else {
        selected_pokemons = pokemons.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

        console.log("current page:", selected_pokemons)
    }

    // Calculate the start and end indices for the current page
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    // Get the Pokemon cards for the current page
    const pokemonsForPage = selected_pokemons.slice(startIndex, endIndex);


    $('#pokeCards').empty()
    selected_pokemons.forEach(async (pokemon) => {
        const res = await axios.get(pokemon.url)
        $('#pokeCards').append(`
      <div class="pokeCard card" pokeName=${res.data.name}   >
        <h3>${res.data.name.toUpperCase()}</h3> 
        <img src="${res.data.sprites.front_default}" alt="${res.data.name}"/>
        <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#pokeModal">
          More
        </button>
        </div>  
        `)
    })
   

}

const setup = async () => {
    $('#pokeCards').empty();
  
    let response = await axios.get('https://pokeapi.co/api/v2/pokemon?offset=0&limit=810');
    pokemons = response.data.results;
  
    paginate(currentPage, PAGE_SIZE, pokemons, selectedValues);
  
    let numPages;
    let selectedPokemons;
    if (selectedValues.length !== 0) {
      selectedPokemons = await filterPokemonsByType(selectedValues);
      numPages = Math.ceil(selectedPokemons.length / PAGE_SIZE);
    } else {
      selectedPokemons = pokemons;
      numPages = Math.ceil(pokemons.length / PAGE_SIZE);
    }
  
    updatePaginationDiv(currentPage, numPages, selectedValues, selectedPokemons);
  
    // Rest of the code...
  };
  


$(document).ready(setup)