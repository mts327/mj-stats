
import './App.css';
import Button from "./uiParts/button/Button.js";

import { Link, Routes, Route } from "react-router-dom";
import { Stats } from './pages/Stats/Stats';
import { NewGame } from './pages/Game/NewGame';
import { Log } from './pages/Game/Log';
import { Game } from './pages/Game/Game';
import { Results } from './pages/Results/Results';
import { StatsYear } from './pages/Stats/Stats-year';
import { ResultsYear } from './pages/Results/Results-year';
import { RecentGames } from './pages/RecentGames/RecentGames';
import { StatsTotal } from './pages/Stats/Stat-total';
import { ResultsTotal } from './pages/Results/Results-total';
import { EndGame } from './pages/Game/EndGame';

function App() {

    const closeMenu = () => {
        let menuBtnCheck = document.getElementById("menu-btn-check");
        menuBtnCheck.checked = false;
    }

    return (
        <div className="App">
            <div className="horizonal">
                <div className="hamburger-menu">
                    <input type="checkbox" id="menu-btn-check" />
                    <label htmlFor="menu-btn-check" className="menu-btn"><span></span></label>
                    <div className="side-menu">
                        <ul className="parent-ul">
                            <li>
                            <Link className="link" to="/recent" onClick={() => { closeMenu() }}>対局結果</Link>
                            </li>
                            <li>
                            <Link className="link" to="/game/new" onClick={() => { closeMenu() }}>新規対局</Link>
                            </li>
                            <li>
                                <Link className="link" to="/stats" onClick={() => { closeMenu() }}>スタッツ</Link>
                                <ul className="child-ul">
                                    <li>
                                    <Link className="link" to="/stats/total" onClick={() => { closeMenu() }}>通算</Link>
                                    </li>
                                    <li>
                                    <Link className="link" to="/stats/2021" onClick={() => { closeMenu() }}>2021年</Link>
                                    </li>
                                    <li>
                                    <Link className="link" to="/stats/2022" onClick={() => { closeMenu() }}>2022年</Link>
                                    </li>
                                    <li>
                                    <Link className="link" to="/stats/2023" onClick={() => { closeMenu() }}>2023年</Link>
                                    </li>
                                </ul>
                            </li>
                            <li>
                            <Link className="link" to="/results" onClick={() => { closeMenu() }}>順位成績表</Link>
                                <ul className="child-ul">
                                    <li>
                                    <Link className="link" to="/results/total" onClick={() => { closeMenu() }}>通算</Link>
                                    </li>
                                    <li>
                                    <Link className="link" to="/results/2021" onClick={() => { closeMenu() }}>2021年</Link>
                                    </li>
                                    <li>
                                    <Link className="link" to="/results/2022" onClick={() => { closeMenu() }}>2022年</Link>
                                    </li>
                                    <li>
                                    <Link className="link" to="/results/2023" onClick={() => { closeMenu() }}>2023年</Link>
                                    </li>
                                </ul>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="content">
                    <Routes>
                        <Route path="/game/new" element={<NewGame />} />
                        <Route path="/game/end" element={<EndGame />} />
                        <Route path="/game/log" element={<Log />} />
                        <Route path="/game" element={<Game />} />
                        <Route path="/" element={<NewGame />} />
                        <Route path="stats" element={<StatsYear />} />
                        <Route path="stats/total" element={<StatsTotal year="通算" />} />
                        <Route path="stats/2021" element={<Stats year={2021} />} />
                        <Route path="stats/2022" element={<Stats year={2022}/>} />
                        <Route path="stats/2023" element={<Stats year={2023}/>} />
                        <Route path="/results" element={<ResultsYear />} />
                        <Route path="results/total" element={<ResultsTotal year="通算" />} />
                        <Route path="results/2021" element={<Results year={2021} />} />
                        <Route path="results/2022" element={<Results year={2022}/>} />
                        <Route path="results/2023" element={<Results year={2023}/>} />
                        <Route path="/recent" element={<RecentGames />} />
                    </Routes>
                </div>
            </div>
        </div>
    );
}

export default App;
