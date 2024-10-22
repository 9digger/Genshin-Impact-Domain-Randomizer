import { Component, createSignal, For, Show, onMount } from 'solid-js';
import styles from './App.module.css';

import { Card } from '../Card';
import { Button } from '../Button';
import { Container } from '../Container';
import { Filters } from '../Filters';
import { characters } from '../../data/characters';
import {
  filterElements,
  filterGender,
  filterRarity,
  filterWeapons,
  selectedCharacters,
  setSelectedCharacters,
} from '../../data/store';
import { Gender, GenshinCharacter, GenshinElement } from '../../types/types';
import { shuffle } from '../../utils/utils';
import { teamSize } from '../../utils/const';

interface Player {
  name: string;
  characters: GenshinCharacter['id'][]; 
}

const idToCard =
  (offset: number = 0) =>
  (id: GenshinCharacter['id'], index: number) => (
    <Card
      index={index + offset}
      character={characters.find(c => c.id === id)}
    />
  );

const App: Component = () => {
  const [teams, setTeams] = createSignal<GenshinCharacter['id'][]>([]);
  const [isModalOpen, setIsModalOpen] = createSignal(false);
  const [savedPlayers, setSavedPlayers] = createSignal<{ name: string; characters: GenshinCharacter['id'][] }[]>([]);
  const [currentPlayer, setCurrentPlayer] = createSignal<{ name: string; characters: GenshinCharacter['id'][] } | null>(null);
  const [selectedPlayers, setSelectedPlayers] = createSignal<string[]>([]);
  const [loading, setLoading] = createSignal(true);

  const fetchPlayers = async () => {
    setLoading(true);
    const response = await fetch('/api/players');
    const data = await response.json();
    setSavedPlayers(data);
    setLoading(false);
  };

  const toggleModal = () => {
    if (currentPlayer()) {
      setSelectedCharacters({ selectedCharacters: currentPlayer()!.characters });
    } else {
      setSelectedCharacters({ selectedCharacters: [] });
    }
    
    setIsModalOpen(!isModalOpen());
  };

  const saveOrUpdatePlayer = async () => {
    if (currentPlayer()) {
      const updatedPlayer = {
        name: currentPlayer()!.name,
        characters: selectedCharacters.selectedCharacters,
      };
      setSavedPlayers(savedPlayers().map(player => player.name === updatedPlayer.name ? updatedPlayer : player));
    } else {
      const playerName = prompt('Enter a name for the player:');
      if (playerName) {
        const newPlayer = { name: playerName, characters: selectedCharacters.selectedCharacters };
        setSavedPlayers([...savedPlayers(), newPlayer]);

        await fetch('/api/players', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newPlayer),
        });
      }
    }

    setSelectedCharacters({ selectedCharacters: [] });
    setCurrentPlayer(null);
    setIsModalOpen(false);
  };

  // Moved filtering functions outside of the loop
  const isSameElement = (character) => 
    filterElements.length === 0 || filterElements.some(e => character.elements.includes(e as GenshinElement));
  
  const isSameWeapon = (character) => 
    filterWeapons.length === 0 || filterWeapons.some(w => character.weapon.includes(w));
  
  const isSameGender = (character) => 
    filterGender.length === 0 || filterGender.some(g => character.gender.includes(g as Gender));
  
  const isSameRarity = (character) => 
    filterRarity.length === 0 || filterRarity.includes(character.stars);
  
  const selectAllCharacters = () => {
    const visibleCharacters = characters.filter(character => {
      return (
        isSameElement(character) &&
        isSameWeapon(character) &&
        isSameGender(character) &&
        isSameRarity(character)
      );
    }).map(character => character.id);
  
    setSelectedCharacters({ selectedCharacters: [...new Set([...selectedCharacters.selectedCharacters, ...visibleCharacters])] });
  };
  
  const deselectAllCharacters = () => {
    setSelectedCharacters({ selectedCharacters: [] });
  };

  onMount(() => {
    fetchPlayers();
  });

  const closeModal = () => {
    setCurrentPlayer(null);
    setIsModalOpen(false);
  };

  const editPlayer = (player: Player) => {
    setCurrentPlayer(player);
    setSelectedCharacters({ selectedCharacters: player.characters });
    toggleModal();
  };

  const removePlayer = (playerName: string) => {
    setSavedPlayers(savedPlayers().filter(player => player.name !== playerName));
  };

  const totalOwnedCharacters = () => {
    return savedPlayers().reduce((total, player) => total + player.characters.length, 0);
  };

  const togglePlayerSelection = (playerName: string) => {
    const isSelected = selectedPlayers().includes(playerName);
    if (isSelected) {
      setSelectedPlayers(selectedPlayers().filter(name => name !== playerName));
    } else {
      if (selectedPlayers().length < 4) {
        setSelectedPlayers([...selectedPlayers(), playerName]);
      }
    }
  };

  const generateTeams = () => {
    const allSelectedCharacters = selectedPlayers().flatMap(playerName => {
      const player = savedPlayers().find(p => p.name === playerName);
      return player ? player.characters : [];
    });

    const uniqueCharacters = Array.from(new Set(allSelectedCharacters));
    const teamCharacters = shuffle(uniqueCharacters).slice(0, teamSize);

    setTeams(teamCharacters);
  };

  return (
    <>
      <header class={styles.header}></header>
      <main>
        <h1 class={styles.title}>Genshin Impact Domain Randomizer</h1>
  
        <div class={styles.teams}>
          <div class={`${styles.grid} ${styles.team}`}>
            {Array.from({ length: teamSize }, (_, i) => teams()[i]).map(idToCard(0))}
          </div>
        </div>
        <div class={styles.buttons}>
          <Button onClick={generateTeams}>Generate teams</Button>
          <Button onClick={toggleModal}>Add Player</Button>
        </div>

        <Show when={loading()}>
          <div>Loading...</div>
        </Show>
  
        <div class={styles.savedPlayers}>
          <h2>Saved Players</h2>
          <For each={savedPlayers()}>
            {player => (
              <div 
                class={`${styles.playerCard} ${selectedPlayers().includes(player.name) ? styles.selected : ''}`}
                onClick={() => togglePlayerSelection(player.name)}
              >
                <span>{player.name} (Total Characters: {player.characters.length})</span>
                <Button onClick={() => editPlayer(player)}>Edit Player</Button>
                <Button onClick={() => removePlayer(player.name)}>Remove</Button>
              </div>
            )}
          </For>
        </div>
  
        <Show when={isModalOpen()}>
          <div class={styles.modalBackdrop}>
            <div class={styles.modal}>
              <div class={styles.modalHeader}>
                <h2>{currentPlayer() ? 'Edit Player' : 'Add Player'}</h2>
                <div class={styles.buttonGroup}>
                  <Button onClick={selectAllCharacters}>Select All</Button>
                  <Button onClick={deselectAllCharacters}>Deselect All</Button>
                  <Button onClick={closeModal}>Cancel</Button>
                </div>
              </div>
              <Container>
                <Filters />
              </Container>
              <div class={`${styles.grid} ${styles.mainGrid}`}>
                <For each={characters}>
                  {character => {
                    const isShown = () =>
                      isSameElement(character) &&
                      isSameWeapon(character) &&
                      isSameGender(character) &&
                      isSameRarity(character);
  
                    return (
                      <Card
                        classList={{ [styles.hidden]: !isShown() }}
                        onClick={() => {
                          setSelectedCharacters(state => {
                            const selected = state.selectedCharacters.includes(character.id);
                            return {
                              ...state,
                              selectedCharacters: selected
                                ? state.selectedCharacters.filter(id => id !== character.id)
                                : [...state.selectedCharacters, character.id],
                            };
                          });
                        }}
                        character={character}
                      />
                    );
                  }}
                </For>
              </div>
              <Button onClick={saveOrUpdatePlayer}>
                {currentPlayer() ? 'Override Player' : 'Save Player'}
              </Button>
            </div>
          </div>
        </Show>
      </main>
    </>
  );  
};

export { App };
