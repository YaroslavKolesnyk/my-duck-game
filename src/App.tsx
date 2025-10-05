import React, { useState, useEffect } from 'react';
import GameCanvas from './components/GameCanvas';
import { generateSeedFromDate } from './utils/seed';

export default function App() {
  const [numColors, setNumColors] = useState(3);
  const [numDucks, setNumDucks] = useState(8);
  const [gameKey, setGameKey] = useState(0);
  const [currentSeed, setCurrentSeed] = useState(generateSeedFromDate());
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');

  useEffect(() => {
    if (numDucks < numColors) {
      setError('Кількість куль повинна бути більшою за кількість кольорів!');
      setWarning('');
    } else if (numDucks === numColors) {
      setError('');
      setWarning('Попередження: з однаковою кількістю куль і кольорів гра не може бути виграна.');
    } else {
      setError('');
      setWarning('');
    }
  }, [numColors, numDucks]);

  const handleColorsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 4;
    setNumColors(Math.min(Math.max(value, 2), 10));
  };

  const handleDucksChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 12;
    setNumDucks(Math.min(Math.max(value, 4), 50));
  };

  const handleStart = () => {
    if (error) return;
    setGameKey(prev => prev + 1);
  };

  const handleDailySeed = () => {
    if (error) return;
    const dailySeed = generateSeedFromDate();
    setCurrentSeed(dailySeed);
    console.log('Daily seed set to:', dailySeed);
    setGameKey(prev => prev + 1);
  };

  const handleRandomSeed = () => {
    if (error) return;
    const randomSeed = Math.floor(Math.random() * 1000000000).toString();
    setCurrentSeed(randomSeed);
    console.log('Random seed set to:', randomSeed);
    setGameKey(prev => prev + 1);
  };

  return (
    <>
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 p-4 bg-black bg-opacity-70 rounded-lg shadow-lg">
        <div className="flex items-center gap-4 flex-wrap justify-center">
          <label className="text-white">
            Кількість кольорів:
            <input
              type="number"
              value={numColors}
              onChange={handleColorsChange}
              min="2"
              max="10"
              className="ml-2 p-1 rounded bg-gray-800 text-white border border-gray-600 w-16"
            />
          </label>
          <label className="text-white">
            Кількість куль:
            <input
              type="number"
              value={numDucks}
              onChange={handleDucksChange}
              min="4"
              max="50"
              className="ml-2 p-1 rounded bg-gray-800 text-white border border-gray-600 w-16"
            />
          </label>
          <button
            onClick={handleStart}
            disabled={!!error}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            Старт гри
          </button>
        </div>
        {error && <p className="text-red-500 text-center mt-2">{error}</p>}
        {warning && <p className="text-yellow-500 text-center mt-2">{warning}</p>}
      </div>
      
      <GameCanvas
        key={gameKey}
        numColors={numColors}
        numDucks={numDucks}
        currentSeed={currentSeed}
        onDailySeed={handleDailySeed}
        onRandomSeed={handleRandomSeed}
        onPlayAgain={handleStart}
      />
    </>
  );
}