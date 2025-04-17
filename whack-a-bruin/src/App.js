import React, { useState, useEffect, useRef, forwardRef } from 'react';
import { gsap } from 'gsap';
import './App.css';

// Constants
const TOTAL_HOLES = 9;
const TIME_LIMIT = 40; // 20 seconds
const BRUIN_POINTS = 50;
const BOMB_PENALTY = 25;
// const APPEARANCE_INTERVAL = 1000; // Interval in milliseconds for new appearances
// const NUM_BRUINS = 3;
// const NUM_BOMBS = 4;

// Helper Functions
const getRandomTime = (min, max) => Math.round(Math.random() * (max - min) + min);

// const initializeHoles = () => {
//   return Array.from({ length: TOTAL_HOLES }, (_, id) => ({
//     id: id + 1,
//     hasBruin: false,
//     hasBomb: false,
//   }));
// };

// Modular Components
function Header() {
  return (
    <header className="header">
      <h1>Whack-a-Bruin</h1>
    </header>
  );
}

function StartButton({ playing, onStart, onEnd }) {
  return (
    <button className="start-button" onClick={playing ? onEnd : onStart}>
      {playing ? 'end game' : 'start game'}
    </button>
  );
}

function StatusBar({ timeLeft, score, hits }) {
  return (
    <div className="status-bar">
      <Timer timeLeft={timeLeft} />
      <Score score={score} />
      <Hits hits={hits} />
    </div>
  );
}

function Timer({ timeLeft }) {
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };
  return (
    <div className="timer">
      <img src="/timer-icon.png" alt="Timer Icon" className="timer-icon" />
      <span className="timer-text">{formatTime(timeLeft)}</span>
    </div>
  );
}

function Score({ score }) {
  return <div className="score">⭐ {score}</div>;
}

function Hits({ hits }) {
  return <div className="hits">💥 {hits}</div>;
}
function Board({ totalHoles, playing, onBruinClick, onBombClick }) {
  return (
    <div className="board">
      {Array.from({ length: totalHoles }).map((_, id) => (
        <Hole
          key={id}
          holeId={id}
          playing={playing}
          onBruinClick={onBruinClick}
          onBombClick={onBombClick}
        />
      ))}
    </div>
  );
}


// === trying to bring back down animation === //
function Hole({ holeId, playing, onBruinClick, onBombClick }) {
  const [hasBruin, setHasBruin] = useState(false);
  const [hasBomb, setHasBomb] = useState(false);
  const [isOccupied, setIsOccupied] = useState(false); // Track if the hole is in use
  const bruinRef = useRef(null);
  const bombRef = useRef(null);

  useEffect(() => {
    let bruinTimer, bombTimer;

    if (playing) {
      const startBruinCycle = () => {
        if (!isOccupied) {
          setHasBruin(true);
          setIsOccupied(true); // Mark the hole as occupied
        }
        bruinTimer = setTimeout(startBruinCycle, getRandomTime(2000, 4000)); // Random interval
      };

      const startBombCycle = () => {
        if (!isOccupied) {
          setHasBomb(true);
          setIsOccupied(true); // Mark the hole as occupied
        }
        bombTimer = setTimeout(startBombCycle, getRandomTime(2000, 4000)); // Random interval
      };

      // Start cycles after initial delays
      bruinTimer = setTimeout(startBruinCycle, getRandomTime(500, 2000));
      bombTimer = setTimeout(startBombCycle, getRandomTime(1000, 3000));
    }

    return () => {
      clearTimeout(bruinTimer);
      clearTimeout(bombTimer);
    };
  }, [playing, isOccupied]);

  // Trigger animations for bears
  useEffect(() => {
    if (hasBruin) {
      gsap.fromTo(
        bruinRef.current,
        { yPercent: 100 },
        {
          yPercent: 0,
          duration: 0.8,
          yoyo: true,
          repeat: 1,
          onComplete: () => {
            setHasBruin(false);
            setIsOccupied(false); // Free the hole after animation
          },
        }
      );
    }
  }, [hasBruin]);

  // Trigger animations for bombs
  useEffect(() => {
    if (hasBomb) {
      gsap.fromTo(
        bombRef.current,
        { yPercent: 100 },
        {
          yPercent: 0,
          duration: 0.8,
          yoyo: true,
          repeat: 1,
          onComplete: () => {
            setHasBomb(false);
            setIsOccupied(false); // Free the hole after animation
          },
        }
      );
    }
  }, [hasBomb]);

  const handleClick = (type) => {
    if (type === "bruin") {
      // Trigger exit animation for bear
      gsap.to(bruinRef.current, {
        yPercent: 100,
        duration: 0.5,
        onComplete: () => {
          onBruinClick(holeId);
          setHasBruin(false);
          setIsOccupied(false); // Free the hole on click
        },
      });
    } else if (type === "bomb") {
      // Trigger exit animation for bomb
      gsap.to(bombRef.current, {
        yPercent: 100,
        duration: 0.5,
        onComplete: () => {
          onBombClick(holeId);
          setHasBomb(false);
          setIsOccupied(false); // Free the hole on click
        },
      });
    }
  };

  return (
    <div className="hole">
      {hasBruin && (
        <Bruin ref={bruinRef} onClick={() => handleClick("bruin")} />
      )}
      {hasBomb && (
        <Bomb ref={bombRef} onClick={() => handleClick("bomb")} />
      )}
    </div>
  );
}


const Bruin = forwardRef(({ onClick }, ref) => (
  <div className="bruin" ref={ref} onClick={onClick}>
    <img src="/bruin.png" alt="Bruin" />
  </div>
));

const Bomb = forwardRef(({ onClick }, ref) => (
  <div className="bomb" ref={ref} onClick={onClick}>
    <img src="/bee.jpg" alt="Bomb" />
  </div>
));

function Game() {
  const [score, setScore] = useState(0);
  const [hits, setHits] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [playing, setPlaying] = useState(false);
  const [finished, setFinished] = useState(false);
  const [bees, setBees] = useState(0);

  const startGame = () => {
    setScore(0);
    setHits(0);
    setTimeLeft(TIME_LIMIT);
    setPlaying(true);
    setFinished(false);
  };

  const endGame = () => {
    setPlaying(false);
    setFinished(true);
  };

  const handleBruinClick = (id) => {
    if (playing) {
      setScore((prev) => prev + BRUIN_POINTS);
      setHits((prev) => prev + 1);
    }
  };

  const handleBombClick = (id) => {
    if (playing) {
      setScore((prev) => prev - BOMB_PENALTY);
      setBees((prev) => prev + 1);
    }
  };

    // Countdown Timer Logic
    useEffect(() => {
      let timer;
      if (playing && timeLeft > 0) {
        timer = setInterval(() => {
          setTimeLeft((prev) => prev - 1);
        }, 1000);
      } else if (timeLeft === 0) {
        endGame(); // End the game when the timer hits zero
      }
      return () => clearInterval(timer); // Clean up the timer
    }, [playing, timeLeft]);

    return (
      <div className="game-page">
        <Header />
        <StartButton playing={playing} onStart={startGame} onEnd={endGame} />
        <StatusBar timeLeft={timeLeft} score={score} hits={hits} />
        <Board
          totalHoles={TOTAL_HOLES}
          playing={playing}
          onBruinClick={handleBruinClick}
          onBombClick={handleBombClick}
        />
    
        {/* End Game Pop-up Overlay */}
        {finished && (
          <div className="overlay">
            <div className="popup">
              <p className="time-over">TIME OVER</p>
              {/* Grid for aligning stats */}
              <div className="stats-container">
              <p className="stat-label">score:</p>
              <p className="stat-value">{score}</p>

              <p className="stat-label">whacked:</p>
              <p className="stat-value">{hits}</p>

              <p className="stat-label">escaped:</p>
              <p className="stat-value">0</p>

              <p className="stat-label">bees:</p>
              <p className="stat-value">{bees}</p>

              </div>
              <button className="popup-btn" onClick={startGame}>play again</button>
            </div>
          </div>
        )}
      </div>
    );
    
}


// Export the App Component
export default function App() {
  return <Game />;
}

