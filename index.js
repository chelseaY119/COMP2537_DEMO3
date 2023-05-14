const PAGE_SIZE = 10
let currentPage = 1;
let pokemons = []
let selected_number = 0;
let filterType = [];
let selected_pokemons = [];
let filteredPokemons = [];
let numPages = 0;

$(document).ready(function () {
  $('input[name="type-filter"]').on('change', function () {
    // Get the selected filter types
    filterType = $('input[name="type-filter"]:checked').map(function () {
      return $(this).val();
    }).get();

    console.log(filterType);
    paginate(currentPage, PAGE_SIZE, pokemons, filterType);
  });
});

//update the page based on selection
const updatePaginationDiv = (currentPage, numPages, filterType) => {
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
      updatePaginationDiv(currentPage, numPages, filterType);
      paginate(currentPage, PAGE_SIZE, pokemons, filterType)
    }
  });
  $('#pagination').append(previousButton);

  // Create page buttons
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
      console.log(currentPage);

      updatePaginationDiv(currentPage, numPages, filterType);
      paginate(currentPage, PAGE_SIZE, pokemons, filterType);
    }
  });

  $('#pagination').append(nextButton);

  $('input[name="type-filter"]').val([filterType]);
};

const paginate = async (currentPage, PAGE_SIZE, pokemons, filterType) => {

  console.log("filtertype", filterType)
  $('input[name="type-filter"]').prop('checked', true);

  if (filterType.length !== 0) {

    // Filter the pokemons based on the selected type
    filteredPokemons = await Promise.all(pokemons.map(async (pokemon) => {
      const res = await axios.get(pokemon.url);
      const types = res.data.types.map(type => type.type.name);
      if (filterType.every((filterType) => types.includes(filterType))) {
        return pokemon;
      }
    }));
    selected_pokemons = filteredPokemons.filter(pokemon => pokemon !== undefined);
    // console.log(selected_pokemons);
  } else {
    selected_pokemons = pokemons;
  }

  selected_number = selected_pokemons.length;
  last_page_size = selected_number % PAGE_SIZE;
  numPages = Math.ceil(selected_number / PAGE_SIZE);

  updatePaginationDiv(currentPage, numPages, filterType);
  $(document).ready(function () {
    const pageSizeElement = $("#total-pokemon");

    if (last_page_size !== 10 && numPages === currentPage) {
      pageSizeElement.text(`Showing ${last_page_size} of ${selected_number} ${filterType} Pokemons`);
    } else if(filterType.length == 0){
      console.log("ok")
      pageSizeElement.text(`Showing ${last_page_size} of ${selected_number} Pokemons`);
    } else {
      pageSizeElement.text(`Showing ${PAGE_SIZE} of ${selected_number} ${filterType} Pokemons`);
    }
  });

  // Calculate the start and end indices for the current page
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;

  // Get the Pokemon cards for the current page
  const pokemonsForPage = selected_pokemons.slice(startIndex, endIndex);

  $('#pokeCards').empty();

  for (const pokemon of pokemonsForPage) {
    const res = await axios.get(pokemon.url);
    const types = res.data.types.map(type => type.type.name);

    $('#pokeCards').append(`
      <div class="pokeCard card" pokeName=${res.data.name}>
        <h3>${res.data.name.toUpperCase()}</h3> 
        <img src="${res.data.sprites.front_default}" alt="${res.data.name}"/>
        <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#pokeModal">
          More
        </button>
      </div>  
    `);
  }

  updatePaginationDiv(currentPage, numPages, filterType)
};


const setup = async () => {
  // test out poke api using axios here

  $('#pokeCards').empty();
  let response = await axios.get('https://pokeapi.co/api/v2/pokemon?offset=0&limit=810');
  pokemons = response.data.results;

  $('input[name="type-filter"]').on('change', function () {
    filterType = $(this).val();
    console.log(filterType)
    currentPage = 1; // Reset to the first page when applying a new filter
    updatePaginationDiv(currentPage, numPages, filterType)

  });

  paginate(currentPage, PAGE_SIZE, pokemons, filterType)

  updatePaginationDiv(currentPage, numPages, filterType)

  // pop up modal when clicking on a pokemon card
  // add event listener to each pokemon card
  $('body').on('click', '.pokeCard', async function (e) {
    const pokemonName = $(this).attr('pokeName')
    // console.log("pokemonName: ", pokemonName);
    const res = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`)
    // console.log("res.data: ", res.data);
    const types = res.data.types.map((type) => type.type.name)
    // console.log("types: ", types);
    $('.modal-body').html(`
        <div style="width:200px">
        <img src="${res.data.sprites.other['official-artwork'].front_default}" alt="${res.data.name}"/>
        <div>
        <h3>Abilities</h3>
        <ul>
        ${res.data.abilities.map((ability) => `<li>${ability.ability.name}</li>`).join('')}
        </ul>
        </div>

        <div>
        <h3>Stats</h3>
        <ul>
        ${res.data.stats.map((stat) => `<li>${stat.stat.name}: ${stat.base_stat}</li>`).join('')}
        </ul>

        </div>

        </div>
          <h3>Types</h3>
          <ul>
          ${types.map((type) => `<li>${type}</li>`).join('')}
          </ul>
      
        `)
    $('.modal-title').html(`
        <h2>${res.data.name.toUpperCase()}</h2>
        <h5>${res.data.id}</h5>
        `)
  })

  // add event listener to pagination buttons
  $('body').on('click', ".numberedButtons", async function (e) {
    currentPage = Number(e.target.value)
    filterTypes = $('input[name="type-filter"]:checked').map(function () {
      return $(this).val();
    }).get();

    updatePaginationDiv(currentPage, numPages, filterType);

    paginate(currentPage, PAGE_SIZE, pokemons, filterType);

    updatePaginationDiv(currentPage, numPages, filterType);

  })
}

$(document).ready(setup);