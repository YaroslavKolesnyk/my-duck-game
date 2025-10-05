interface GameResult {
  time: string;
  seed: string;
}

interface WinScreenProps {
  gameResult: GameResult;
  onDailySeed: () => void;
  onRandomSeed: () => void;
  onPlayAgain: () => void;
}

export default function WinScreen({
  gameResult,
  onDailySeed,
  onRandomSeed,
  onPlayAgain,
}: WinScreenProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-gradient-to-br from-green-400 to-blue-600 p-6 rounded-lg shadow-lg text-center text-white">
        <p className="text-xl mb-2">
          You sorted the ducks in <span className="font-bold">{gameResult.time}</span> seconds
        </p>
        <p className="text-lg mb-2">
          on seed: <span className="font-bold">{gameResult.seed}</span>
        </p>
        <p className="text-lg mb-4">
          <span className="font-bold">{gameResult.seed}</span>
        </p>
        <div className="space-x-4">
          <button
            onClick={onDailySeed}
            className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
          >
            daily seed
          </button>
          <button
            onClick={onRandomSeed}
            className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
          >
            random seed
          </button>
          <button
            onClick={onPlayAgain}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            play!
          </button>
        </div>
      </div>
    </div>
  );
}