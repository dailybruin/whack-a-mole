import React, { useState, useEffect, useRef, forwardRef } from 'react';
import { gsap } from 'gsap';
import './App.css';

// Constants
const TOTAL_HOLES = 9;
const TIME_LIMIT = 569; // 20 seconds
const BRUIN_POINTS = 25;
const BOMB_PENALTY = 15;
const TIME_LOWER_BOUND_BRUIN = 200
const TIME_UPPER_BOUND_BRUIN = 400
const TIME_LOWER_BOUND_BOMB = 400
const TIME_UPPER_BOUND_BOMB = 500
const MAX_BRUINS = 2;
const MAX_BOMBS = 1;

// Helper Functions
const getRandomTime = (min, max) => Math.round(Math.random() * (max - min) + min);

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

function StatusBar({ timeLeft, score, hits, escapes }) {
  return (
    <div className="status-bar">
      <Timer timeLeft={timeLeft} />
      <Score score={score} />
      <Hits hits={hits} />
      <Escapes escapes={escapes} />
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
  return ( 
    <div className="score">
      <img src="/score-icon.png" alt="Score Icon" className="score-icon" />
      <span className="score-text">{1919}</span>
    </div>
  );
}

function Hits({ hits }) {
  return (
    <div className="hits">
      <img src="/hit-icon.png" alt="Hit Icon" className="hit-icon" />
      <span className="hit-text">{hits}</span>
    </div>
  );
}

function Escapes({ escapes }) {
  return (
    <div className="escapes">
      <img src="/escapes-icon.png" alt="Escape Icon" className="escapes-icon" />
      <span className="escapes-text">{escapes}</span>
    </div>
  );
}

function Board({
  totalHoles,
  playing,
  onBruinClick,
  onBombClick,
  onBruinEscape,
  activeBruins,
  activeBombs,
  setActiveBruins,
  setActiveBombs,
  maxBruins,
  maxBombs
}) {
  return (
    <div className="board">
      {Array.from({ length: totalHoles }).map((_, id) => (
        <Hole
          key={id}
          holeId={id}
          playing={playing}
          onBruinClick={onBruinClick}
          onBombClick={onBombClick}
          onBruinEscape={onBruinEscape}
          activeBruins={activeBruins}
          activeBombs={activeBombs}
          setActiveBruins={setActiveBruins}
          setActiveBombs={setActiveBombs}
          maxBruins={maxBruins}
          maxBombs={maxBombs}
        />
      ))}
    </div>
  );
}

// === trying to bring back down animation === //
function Hole({
  holeId,
  playing,
  onBruinClick,
  onBombClick,
  onBruinEscape, 
  activeBruins,
  activeBombs,
  setActiveBruins,
  setActiveBombs,
  maxBruins,
  maxBombs
  
}) {
  const [bruinWhacked, setBruinWhacked] = useState(false);
  const [bombWhacked, setBombWhacked] = useState(false);
  const [hasBruin, setHasBruin] = useState(false);
  const [hasBomb, setHasBomb] = useState(false);
  const [isOccupied, setIsOccupied] = useState(false); // Track if the hole is in use
  const [bruinClicked, setBruinClicked] = useState(false);
  const bruinRef = useRef(null);
  const bombRef = useRef(null);

  useEffect(() => {
    let bruinTimer, bombTimer;

    if (playing) {
      const startBruinCycle = () => {
        setBruinClicked(false);
        if (!isOccupied && activeBruins < maxBruins) {
          setHasBruin(true);
          setIsOccupied(true); // Mark the hole as occupied
          setActiveBruins(prev => prev + 1);
        }
        bruinTimer = setTimeout(startBruinCycle, getRandomTime(TIME_LOWER_BOUND_BRUIN, TIME_UPPER_BOUND_BRUIN));
      };

      const startBombCycle = () => {
        if (!isOccupied && activeBombs < maxBombs) {
          setHasBomb(true);
          setIsOccupied(true); // Mark the hole as occupied
          setActiveBombs(prev => prev + 1);
        }
        bombTimer = setTimeout(startBombCycle, getRandomTime(TIME_LOWER_BOUND_BOMB, TIME_UPPER_BOUND_BRUIN));
      };
      // Start cycles after initial delays
      bruinTimer = setTimeout(startBruinCycle, getRandomTime(TIME_LOWER_BOUND_BRUIN, TIME_UPPER_BOUND_BRUIN));
      bombTimer = setTimeout(startBombCycle, getRandomTime(TIME_LOWER_BOUND_BOMB, TIME_UPPER_BOUND_BOMB));
    }
    return () => {
      clearTimeout(bruinTimer);
      clearTimeout(bombTimer);
    };
  }, [playing, isOccupied, activeBruins, activeBombs]);

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
            setActiveBruins(prev => Math.max(prev - 1, 0));
            if (!bruinClicked) {
              onBruinEscape();
            }
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
            setActiveBombs(prev => Math.max(prev - 1, 0));
          },
        }
      );
    }
  }, [hasBomb]);

const handleClick = (type) => {
  if (type === "bruin") {
    gsap.killTweensOf(bruinRef.current);
    setBruinWhacked(true);
    onBruinClick(holeId);
    setBruinClicked(true);

    // Trigger exit animation for bear
    gsap.to(bruinRef.current, {
      yPercent: 100,
      duration: 0.65,
      onComplete: () => {
        setHasBruin(false);
        setIsOccupied(false); // Free the hole on click
        setActiveBruins(prev => Math.max(prev - 1, 0));
        setBruinWhacked(false); // Reset for next appearance
      },
    });
  } else if (type === "bomb") {
    setBombWhacked(true);
    // Trigger exit animation for bomb
    gsap.to(bombRef.current, {
      yPercent: 100,
      duration: 0.65,
      onComplete: () => {
        onBombClick(holeId);
        setHasBomb(false);
        setIsOccupied(false); // Free the hole on click
        setActiveBombs(prev => Math.max(prev - 1, 0));
        setBombWhacked(false); // Reset for next appearance
      },
    });
  }
};
return (
  <div className="hole">
    {hasBruin && (
      <Bruin ref={bruinRef} onClick={() => handleClick("bruin")} whacked={bruinWhacked} />
    )}
    {hasBomb && (
      <Bomb ref={bombRef} onClick={() => handleClick("bomb")} whacked={bombWhacked} />
    )}
  </div>
);
}

const Bruin = forwardRef(({ onClick, whacked }, ref) => (
  <div className="bruin" ref={ref} onClick={onClick}>
    <img src={whacked? "/bruin-whacked-icon.png" : "/bruin-icon.png"} alt="Bruin" />
  </div>
));

const Bomb = forwardRef(({ onClick, whacked }, ref) => (
  <div className="bomb" ref={ref} onClick={onClick}>
    <img src={whacked? "/bee-whacked-icon.png" : "/bee-icon.png"} alt="Bomb" />
  </div>
));

function Game() {
  const [score, setScore] = useState(0);
  const [hits, setHits] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [playing, setPlaying] = useState(false);
  const [finished, setFinished] = useState(false);
  const [bees, setBees] = useState(0);
  const [activeBruins, setActiveBruins] = useState(0);
  const [activeBombs, setActiveBombs] = useState(0);
  const [escapes, setEscapes] = useState(0);

  const startGame = () => {
    setScore(0);
    setHits(0);
    setTimeLeft(TIME_LIMIT);
    setEscapes(0);
    setPlaying(true);
    setFinished(false);
    setBees(0);
    setActiveBruins(0);
    setActiveBombs(0);
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

  const handleBruinEscape = () => {
    if (playing) setEscapes(prev => prev + 1);
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
        <StatusBar timeLeft={timeLeft} score={score} hits={hits} escapes={escapes} />
        <Board
          totalHoles={TOTAL_HOLES}
          playing={playing}
          onBruinClick={handleBruinClick}
          onBombClick={handleBombClick}
          onBruinEscape={handleBruinEscape}
          activeBruins={activeBruins}
          activeBombs={activeBombs}
          setActiveBruins={setActiveBruins}
          setActiveBombs={setActiveBombs}
          maxBruins={MAX_BRUINS}
          maxBombs={MAX_BOMBS}
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
              <p className="stat-value">{escapes}</p>

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

export default function App() {
  return <Game />;
}
