import './App.css';

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
  return (
    <div className="game-page">
      <Header />
      <StartButton />
      <StatusBar timeLeft={sampleData.timeLeft} score={sampleData.score} hits={sampleData.hits} />
      <Board holes={sampleData.holes} />
    </div>
  );
}

function StartButton() {
  return (
    <button className="start-button">
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
  return (
    <div className="timer">
      <span>⏱ {timeLeft}</span>
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

function Board({ holes }) {
  return (
    <div className="board">
      {holes.map((hole) => (
        // create grid of holes
        <Hole key={hole.id} hasBruin={hole.hasBruin} hasBomb={hole.hasBomb} />
      ))}
    </div>
  );
}

function Hole({ hasBruin, hasBomb }) {
  return (
    <div className="hole">
      {hasBruin && <Bruin />}
      {hasBomb && <Bomb />}
    </div>
  );
}

function Bruin() {
  return (
    <div className="bruin">
      <img src="/bruin.png" alt="Bruin" />
    </div>
  );
}

function Bomb() {
  return (
    <div className="bomb">
      <img src="/bee.jpg" alt="Bomb" />
    </div>
  );
}

export default App;