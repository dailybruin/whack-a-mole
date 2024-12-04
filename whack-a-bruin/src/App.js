import './App.css';
import React, { useRef, useEffect, useState, forwardRef } from 'react';
import { gsap } from 'gsap';

const sampleData = {
  timeLeft: "00:17",
  score: 531,
  hits: 7,
  holes: [
    { id: 1, hasBruin: false, hasBomb: false },
    { id: 2, hasBruin: false, hasBomb: true },
    { id: 3, hasBruin: false, hasBomb: false },
    { id: 4, hasBruin: true, hasBomb: false },
    { id: 5, hasBruin: true, hasBomb: false },
    { id: 6, hasBruin: false, hasBomb: false },
    { id: 7, hasBruin: true, hasBomb: false },
    { id: 8, hasBruin: true, hasBomb: false },
    { id: 9, hasBruin: false, hasBomb: true }
  ]
};

function App() {
  const [score, setScore] =useState(0);
  const [hits, setHits] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20); 
  const [gameActive, setGameActive] = useState(false);
  const [holes, setHoles] = useState(sampleData.holes);

  const handleBruinClick = () => {
    console.log("bruin hit!")
    setScore((prevScore) => prevScore + 1);
    setHits((prevHits) => prevHits + 1);
  };

  const handleBombClick = (holeId) => {
    console.log("bomb hit!");
    setScore((prevScore) => prevScore - 1);
  };

  useEffect(() => {
    let timerId;
  
    if (gameActive && timeLeft > 0) {
      timerId = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000); // 1 second interval
    }
  
    if (timeLeft === 0 && gameActive) {
      setGameActive(false); 
      console.log("game ends");
    }
  
    // cleanup interval when component unmounts or when gameActive/timeLeft changes
    return () => clearInterval(timerId);
  }, [gameActive, timeLeft]);
  
  const startGame = () => {
    // reset score, hits, timer
    setScore(0); 
    setHits(0);  
    setTimeLeft(20); 
    setGameActive(true); 
    console.log("game started!");
  };

  // TODO: change this implementation
  // randomize bruins and bombs
  const randomizeHoles = () => {
  const numBruins = 2; 
  const numBombs = 1;  

  const holeIds = holes.map((hole) => hole.id);
  const shuffledHoleIds = shuffleArray(holeIds);

  // get random hole IDs for bruins and bombs
  const selectedBruinIds = shuffledHoleIds.slice(0, numBruins);
  const selectedBombIds = shuffledHoleIds.slice(numBruins, numBruins + numBombs);

  // update holes state
  setHoles((prevHoles) =>
    prevHoles.map((hole) => {
      if (selectedBruinIds.includes(hole.id)) {
        return { ...hole, hasBruin: true, hasBomb: false };
      } else if (selectedBombIds.includes(hole.id)) {
        return { ...hole, hasBruin: false, hasBomb: true };
      } else {
        return { ...hole, hasBruin: false, hasBomb: false };
      }
    })
  );
};

const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};
useEffect(() => {
  let randomizeInterval;

  if (gameActive) {
    // randomize bruins and bombs every 1 second
    randomizeInterval = setInterval(() => {
      randomizeHoles();
    }, 1000);
  }

  return () => clearInterval(randomizeInterval);
}, [gameActive]);
  return (
    <div className="game-page">
      <Header />
      <StartButton onStart={startGame} disabled={gameActive} />
      <StatusBar timeLeft={timeLeft} score={score} hits={hits} />
      <Board holes={holes} onBruinClick={handleBruinClick} onBombClick={handleBombClick} />
    </div>
  );
}

function StartButton({ onStart, disabled }) {
  return (
    <button className="start-button" onClick={onStart} disabled={disabled}>
      Start Game
    </button>
  );
}
function Header() {
  return (
    <header className="header">
      <h1>Whack-a-Bruin</h1>
    </header>
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
  // format: MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const paddedMinutes = String(minutes).padStart(2, '0');
    const paddedSeconds = String(remainingSeconds).padStart(2, '0');
    return `${paddedMinutes}:${paddedSeconds}`;
  };

  return (
    <div className="timer">
      <span>⏱ {formatTime(timeLeft)}</span>
    </div>
  );
}

function Score({ score }) {
  return (
    <div className="score">
      <span>⭐ {score}</span>
    </div>
  );
}

function Hits({ hits }) {
  return (
    <div className="hits">
      <span>💥 {hits}</span>
    </div>
  );
}

function Board({ holes, onBruinClick, onBombClick}) {
  return (
    <div className="board">
      {holes.map((hole) => (
        // create grid of holes
        <Hole key={hole.id} hasBruin={hole.hasBruin} hasBomb={hole.hasBomb} onBruinClick={onBruinClick}  onBombClick={onBombClick} />
      ))}
    </div>
  );
}

function Hole({ hasBruin, hasBomb, onBruinClick, onBombClick }) {
  const bruinRef = useRef(); // references Bruin DOM element
  const bombRef = useRef(); // references Bomb DOM element

  useEffect(() => {
    if (hasBruin) {
      // animate bruin
      gsap.fromTo(
        bruinRef.current,
        { y: "100%", opacity: 0 }, // move out of visible area of the hole, below visible area?
        {
          y: "0%", // fully visible position
          opacity: 1,
          duration: 0.5,
          yoyo: true, // slide back down
          repeat: -1, // infinite loop
          ease: "power1.inOut",
        }
      );
    }
    if (hasBomb) {
      // animate bee
      gsap.fromTo(
        bombRef.current,
        { y: "100%", opacity: 0 },
        {
          y: "0%",
          opacity: 1,
          duration: 0.5,
          yoyo: true,
          repeat: -1,
          ease: "power1.inOut",
        }
      );
    }
  }, [hasBruin, hasBomb]); // trigger when hasBruin or hasBomb changes 

  return (
    <div className="hole">
      {hasBruin && <Bruin onClick={onBruinClick} ref={bruinRef} />}
      {hasBomb && <Bomb onClick={onBombClick} ref={bombRef} />}
    </div>
  );
}

const Bruin = forwardRef(({ onClick }, ref) => {
  useEffect(() => {
    console.log("bruin component mounted");
  }, []);

  return (
    <div className="bruin" ref={ref} onClick={onClick}>
      <img src="/bruin.png" alt="Bruin" />
    </div>
  );
});

const Bomb = forwardRef(({ onClick }, ref) => {
  useEffect(() => {
    console.log("bee component mounted");
  }, []);

  return (
    <div className="bomb" ref={ref} onClick={onClick}>
      <img src="/bee.jpg" alt="Bee" />
    </div>
  );
});

export default App;