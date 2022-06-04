import { state, watch, component, setup } from "../../../lib/Elaine.ts";

const fetchPokemonData = (stupState) => {
    const pokemon = stupState.data.pokemon;
    const loading = state(false);
    const pokemonData = state(null);
    const fetchPokemonData = () => {
        if (!pokemon.value || !pokemon.value.url) {
            pokemonData.value = null;
            return;
        }
        loading.value = true;
        fetch(pokemon.value.url)
            .then(r => r.json())
            .then(d => pokemonData.value = d)
            .finally(() => loading.value = false);
    };

    console.log("added watcher", stupState.data.pokemon);
    watch(() => {
        console.log("pokemon changed... gonna fetch");
        fetchPokemonData();
    }, stupState.data.pokemon);

    fetchPokemonData();

    const selectedPokemon = () => {
        console.log("pokemon-selected")
        stupState.dispatchEvent("pokemon-selected", pokemon.value);
    };
    return {
        state: {
            pokemonData,
            selectedPokemon,
            loading
        }
    };
};

const pokemon = component({
    name: "pokemon",
    template: `
    <div class="pokemon">
    <div @@if="!@@loading && @@pokemonData != null" class="pokemon-content" ++click="selectedPokemon">
        <img @@src="@@pokemonData.sprites.front_default" class="pokemon-sprite" />
        <div class="pokemon-name">@@{pokemonData.name}</div>
        <div @@if="@@pokemonData.types != null" class="types">
            <div @@for="type in @@pokemonData.types" class="type" @@class="@@type.type.name">
                @@{type.type.name}
            </div>
        </div>
    </div>
    <div @@if="!@@loading && @@pokemonData == null" class="pokemon-content">
        Nothing loaded yet.
    </div>
    <img @@if="@@loading" src="./loading.gif" class="loading" />
</div>
    `,
    props: [{
        name: "pokemon",
        type: Object
    }],
    setup: fetchPokemonData
});

(async () => {
    const response = await fetch("https://pokeapi.co/api/v2/pokemon/?limit=151'");
    const pokemonsResponse = await response.json();
    const pokemons = pokemonsResponse.results;

    const detailPokemon = state(null);
    const selectPokemon = (pokemon) => {
        console.log("pokemon select", pokemon);
        detailPokemon.value = pokemon;
        console.log(detailPokemon);
    };

    const onPokemonSelected = (event) => {
        console.log(event);
        selectPokemon(event.detail);
    };

    setup(document.getElementById("app"), {
        state: {
            pokemons,
            fetchPokemonData,
            detailPokemon,
            selectPokemon,
            onPokemonSelected
        },
        components: [pokemon]
    });
})();