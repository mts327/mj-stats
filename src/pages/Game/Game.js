import { useEffect, useState } from 'react';
import db from "../../firebase";
import { setDoc, collection, doc, getDoc, getDocs, updateDoc, onSnapshot, query } from "firebase/firestore"
import Select from "react-select"
import './NewGame.css';
// import Button from '../../uiParts/button/Button';
import { Link, Routes, Route } from "react-router-dom";
import { GameComponent } from "./GameComponent";
import Button from '../../uiParts/button/Button';
import { EndGame } from './EndGame';

export function Game(props) {
    const [players, setPlayers] = useState([]);
    const [oyaOrder, setOyaOrder] = useState([]);
    const [handInfo, setHandInfo] = useState({});
    const [isOpenLogs, setIsOpenLogs] = useState(false);
    const [horaType, sethoraType] = useState("");
    const [displayFus, setDisplayFus] = useState(false);
    const [horaPlayer, setHoraPlayer] = useState("");
    const [hojuPlayer, setHojuPlayer] = useState("");
    const [reachPlayers, setReachPlayers] = useState([]);
    const [tenpaiPlayers, setTenpaiPlayers] = useState([]);
    const [pt, setPt] = useState(0);
    const [isDraw, setIsDraw] = useState(false);
    const [ptElm, setPtElm] = useState({});
    const [logs, setLogs] = useState([]);
    const gameComponent = new GameComponent();
    
    useEffect(() => {
        const playerData = collection(db, "players");
        const logData = collection(db, "logs");
        const orderData = collection(db, "order");

        getDocs(playerData).then((snapShot) => {
            let players = snapShot.docs.map(doc => doc.data());
            console.log(players);
            players.sort((a, b) => { return b.pt - a.pt });
            setPlayers(players);
            getDocs(logData).then(snapShot => {
                let logs = snapShot.docs.map(doc => doc.data());
                logs.sort((a, b) => { return a.time - b.time });
                setLogs(logs);
                if (logs.length > 0) {
                    setHandInfo(logs[logs.length - 1].handInfo);
                }
                else {
                    setHandInfo({
                        ba: 0,
                        hand: 1,
                        honba: 0,
                        kyotaku: 0
                    });
                    setDoc(doc(db, "logs", (0).toString() + (1).toString() + (0).toString()), {
                        handInfo: {
                            ba          : 0,
                            hand        : 1,
                            honba       : 0,
                            kyotaku     : 0,
                            playersInfo : players,
                            time        : new Date().getTime()
                        }
                    });
                }
            });
            // let oyaOrder = players.map(player => player.label)
            // setOyaOrder(oyaOrder);
        });

        getDocs(orderData).then((snapShot) => {
            let order = snapShot.docs.map(doc => doc.data());
            // players.sort((a, b) => { return b.pt - a.pt });
            // setPlayers(players);
            let oyaOrder = order[0].order.map(o => o.name);
            setOyaOrder(oyaOrder);
        });

        // realtime
        onSnapshot(logData, (log) => {
            // setUsers(user.docs.map(doc => ({ ...doc.data() })));
            let logs = log.docs.map(log => ({ ...log.data() }))
            logs.sort((a, b) => { return a.time - b.time });
            setLogs(logs);
        })
        
    }, []);

    useEffect(() => {
        if (ptElm.han >= 4 || (ptElm.han < 4 && ptElm.fu !== 0)) {
            let pt = gameComponent.getPt(
                horaPlayer.label === oyaOrder[handInfo.hand - 1],
                horaType,
                ptElm.han,
                ptElm.fu
            )
            setPt(pt);
        }
    }, [horaType, horaPlayer, ptElm]);

    const resetState = () => {
        sethoraType("");
        setDisplayFus(false)
        setHoraPlayer("");
        setHojuPlayer("");
        setReachPlayers([]);
        setTenpaiPlayers([]);
        setPt(0);
        setIsDraw(false);
        setPtElm({});
    }

    const toggleLogs = (isOpenFlg) => {
        isOpenFlg ? setIsOpenLogs(false) : setIsOpenLogs(true);
    }

    const checkBaAndHand = (ba, hand) => {
        if (hand === 4) {
            if (ba !== 2) {
                return [++ba, 1]
            }
            else {
                return [0, 1]
            }
        }
        else {
            return [ba, ++hand]
        }
    }

    const updateStatus = () => {
        if (horaPlayer.label === oyaOrder[handInfo.hand - 1] || tenpaiPlayers.some(tp => tp.label === oyaOrder[handInfo.hand - 1]) || isDraw) {
            return [handInfo.ba, handInfo.hand, ++handInfo.honba];
        }
        else if (horaType === gameComponent.Types.ryukyoku && !tenpaiPlayers.some(tp => tp.label === oyaOrder[handInfo.hand - 1])) {
            let [ba, hand] = checkBaAndHand(handInfo.ba, handInfo.hand);
            return [ba, hand, ++handInfo.honba];
        }
        else {
            let [ba, hand] = checkBaAndHand(handInfo.ba, handInfo.hand);
            return [ba, hand, 0];
        }
    }

    const setHandInfoState = (cp) => {
        let [ba, hand, honba] = updateStatus();
        let kyotaku = 0;
        if (horaType === gameComponent.Types.ryukyoku) {
            kyotaku += handInfo.kyotaku + reachPlayers.length;
        }
        setHandInfo({ ba: ba, hand: hand, honba: honba, kyotaku: kyotaku });
        setDoc(doc(db, "logs", (ba).toString() + (hand).toString() + (honba).toString()), {
            handInfo: {
                ba          : ba,
                hand        : hand,
                honba       : honba,
                kyotaku     : kyotaku,
                playersInfo : cp,
                time        : new Date().getTime()
            }
        });
        resetState();
    }

    const setPlayersState = (cp, isEnd) => {
        cp.sort((a, b) => { return b.pt - a.pt });
        // console.log(isEnd)
        if (isEnd) {
            cp[0].pt = 100000 - (cp[1].pt + cp[2].pt + cp[3].pt)
            for (let i = cp.length - 1; i >= 0; i--){
                if (i == 0) {
                    cp[i].result = -(cp[1].result + cp[2].result + cp[3].result);
                }
                else {
                    cp[i].result = Math.round(((cp[i].pt - 30000) / 1000) - 0.1) + gameComponent.Uma[i];
                }
                console.log(cp[i]);
            }
            setDoc(doc(db, "result", (0).toString()), {
                result: cp
            });
        }
        else {
            for (let i = 0; i < cp.length; i++) {
                if (i == 0) {
                    cp[0].diff = "-";
                }
                else {
                    cp[i].diff = cp[i - 1].pt - cp[i].pt;
                }
                updateDoc(doc(db, "players", (i).toString()), {
                    value       : cp[i].value,
                    label       : cp[i].label,
                    pt          : cp[i].pt,
                    diff        : cp[i].diff,
                    direction   : cp[i].direction,
                })
            }
            setPlayers(cp);
            setHandInfoState(cp);
        }
    }

    const setReachPlayersState = (cp, isEnd) => {
        reachPlayers.forEach(rp => {
            cp.find(p => p.value === rp.value).pt -= 1000;
        })
        setPlayersState(cp, isEnd);
    }

    const setPlayersStateIfRon = (cp, isEnd) => {
        cp.map(p => {
            if (p.value === horaPlayer.value) {
                p.pt += pt + handInfo.honba*300 + handInfo.kyotaku*1000 + reachPlayers.length*1000;
            }
            if (p.value === hojuPlayer.value) {
                p.pt -= pt + handInfo.honba*300;
            }
        })
        setReachPlayersState(cp, isEnd);
    }

    const setPlayersStateIfTsumo = (cp, isEnd) => {
        cp.map(p => {
            if (p.value === horaPlayer.value) {
                if (horaPlayer.label === oyaOrder[handInfo.hand - 1]) {
                    p.pt += pt*3 + handInfo.honba*300 + handInfo.kyotaku*1000 + reachPlayers.length*1000;
                }
                else {
                    p.pt += pt[0]*2 + pt[1] + handInfo.honba*300 + handInfo.kyotaku*1000 + reachPlayers.length*1000;
                }
            }
            else {
                if (horaPlayer.label === oyaOrder[handInfo.hand - 1]) {
                    p.pt -= pt + handInfo.honba*100;
                }
                else {
                    if (p.label === oyaOrder[handInfo.hand - 1]) {
                        p.pt -= pt[1] + handInfo.honba*100;
                    }
                    else {
                        p.pt -= pt[0] + handInfo.honba*100;
                    }
                }
            }
        })
        setReachPlayersState(cp, isEnd);
    }
    
    const setPlayersStateIfRyukyoku = (cp, isEnd) => {
        if (0 < tenpaiPlayers.length && tenpaiPlayers.length < 4) {
            let tenpaiPt = 3000 / tenpaiPlayers.length;
            let notenPt = 3000 / (cp.length - tenpaiPlayers.length);
            cp.map(p => {
                if (tenpaiPlayers.some(tp => tp.label == p.label)) {
                    p.pt += tenpaiPt;
                }
                else {
                    p.pt -= notenPt;
                }
            })
        }
        setReachPlayersState(cp, isEnd);
    }

    const addLog = () => {
        let hora = "";
        let hoju = "";
        let _pt = pt;
        switch (horaType) {
            case gameComponent.Types.ron:
                hoju = hojuPlayer.label;
            case gameComponent.Types.tsumo:
                hora = horaPlayer.label;
                horaPlayer.label === oyaOrder[handInfo.hand - 1] ? _pt = pt*3 : _pt = pt[0] * 2 + pt[1];
                break;
        }
        setDoc(doc(db, "logs", (handInfo.ba).toString() + (handInfo.hand).toString() + (handInfo.honba).toString()), {
            type: horaType,
            hora: hora,
            hoju: hoju,
            pt: _pt,
            reachs: reachPlayers.map(rp => rp.label),
            tenpais: tenpaiPlayers.map(tp => tp.label),
        }, { merge: true });
    }

    const updateStats = async () => {
        for (let i = 0; i < players.length; i++) {
            // console.log((new Date().getFullYear()).toString() + (players[i].value).toString())
            let playerRef = doc(db, "stats", (new Date().getFullYear()).toString() + (players[i].value).toString());
            let playerSnap = await getDoc(playerRef);
            if (playerSnap.exists()) {
                let data = playerSnap.data();
                // console.log(data.time+1);
                updateDoc(playerRef, {
                    times: data.times + 1,
                })
                if (reachPlayers.some(rp => rp.value == players[i].value)) {
                    updateDoc(playerRef, {
                        reach: data.reach + 1,
                    })
                }
                switch (horaType) {
                    case gameComponent.Types.ron:
                        if (horaPlayer.value == players[i].value) {
                            updateDoc(playerRef, {
                                hora: data.hora + 1,
                                daten: data.daten + pt,
                            })
                            if (reachPlayers.some(rp => rp.value == players[i].value)) {
                                updateDoc(playerRef, {
                                    horareach: data.horareach + 1
                                })
                            }
                        }
                        else if (hojuPlayer.value == players[i].value) {
                            updateDoc(playerRef, {
                                hoju: data.hoju + 1,
                                hojuten: data.hojuten + pt,
                            })
                            if (reachPlayers.some(rp => rp.value == players[i].value)) {
                                updateDoc(playerRef, {
                                    hojureach: data.hojureach + 1
                                })
                            }
                        }
                        break;
                    case gameComponent.Types.tsumo:
                        if (horaPlayer.value == players[i].value) {
                            if (horaPlayer.label === oyaOrder[handInfo.hand - 1]) {
                                updateDoc(playerRef, {
                                    hora: data.hora + 1,
                                    tsumo: data.tsumo + 1,
                                    daten: data.daten + pt*3,
                                })
                            }
                            else {
                                updateDoc(playerRef, {
                                    hora: data.hora + 1,
                                    tsumo: data.tsumo + 1,
                                    daten: data.daten + pt[0] * 2 + pt[1],
                                })
                            }
                            if (reachPlayers.some(rp => rp.value == players[i].value)) {
                                updateDoc(playerRef, {
                                    horareach: data.horareach + 1
                                })
                            }
                        }
                        break;
                    case gameComponent.Types.ryukyoku:
                        updateDoc(playerRef, {
                            ryukyoku: data.ryukyoku + 1
                        })
                        if (tenpaiPlayers.some(tp => tp.value == players[i].value)) {
                            updateDoc(playerRef, {
                                tenpai: data.tenpai + 1
                            })
                        }
                        break;
                }
            }
            else {
                setDoc(doc(db, "stats", (new Date().getFullYear()).toString() + (players[i].value).toString()), {
                    year: new Date().getFullYear(),
                    id: players[i].value,
                    name: players[i].label,
                    daten: 0,
                    hoju: 0,
                    hojureach: 0,
                    hojuten: 0,
                    hora: 0,
                    horareach: 0,
                    reach: 0,
                    ryukyoku: 0,
                    tenpai: 0,
                    times: 0,
                    tsumo: 0,
                });
                updateDoc(playerRef, {
                    times: 1,
                })
                if (reachPlayers.some(rp => rp.value == players[i].value)) {
                    updateDoc(playerRef, {
                        reach: 1,
                    })
                }
                switch (horaType) {
                    case gameComponent.Types.ron:
                        if (horaPlayer.value == players[i].value) {
                            updateDoc(playerRef, {
                                hora: 1,
                                daten: pt,
                            })
                            if (reachPlayers.some(rp => rp.value == players[i].value)) {
                                updateDoc(playerRef, {
                                    horareach: 1
                                })
                            }
                        }
                        else if (hojuPlayer.value == players[i].value) {
                            updateDoc(playerRef, {
                                hoju: 1,
                                hojuten: pt,
                            })
                            if (reachPlayers.some(rp => rp.value == players[i].value)) {
                                updateDoc(playerRef, {
                                    hojureach: 1
                                })
                            }
                        }
                        break;
                    case gameComponent.Types.tsumo:
                        if (horaPlayer.value == players[i].value) {
                            if (horaPlayer.label === oyaOrder[handInfo.hand - 1]) {
                                updateDoc(playerRef, {
                                    hora: 1,
                                    tsumo: 1,
                                    daten: pt*3,
                                })
                            }
                            else {
                                updateDoc(playerRef, {
                                    hora: 1,
                                    tsumo: 1,
                                    daten: pt[0] * 2 + pt[1],
                                })
                            }
                            if (reachPlayers.some(rp => rp.value == players[i].value)) {
                                updateDoc(playerRef, {
                                    horareach: 1
                                })
                            }
                        }
                        break;
                    case gameComponent.Types.ryukyoku:
                        updateDoc(playerRef, {
                            ryukyoku: 1
                        })
                        if (tenpaiPlayers.some(tp => tp.value == players[i].value)) {
                            updateDoc(playerRef, {
                                tenpai: 1
                            })
                        }
                        break;
                }
            }
        }
    }

    const categorize = (isEnd) => {
        updateStats();
        let copyPlayers = JSON.parse(JSON.stringify(players));
        switch (horaType) {
            case gameComponent.Types.ron:
                setPlayersStateIfRon(copyPlayers, isEnd);
                break;
            case gameComponent.Types.tsumo:
                setPlayersStateIfTsumo(copyPlayers, isEnd);
                break;
            case gameComponent.Types.ryukyoku:
                setPlayersStateIfRyukyoku(copyPlayers, isEnd);
                break;
            default:
                setPlayersState(copyPlayers, isEnd);
                break;
        }
    }

    return (
        <div className="new-game">
            <div>
                <p>{gameComponent.Bas[handInfo.ba]}{handInfo.hand}局{handInfo.honba}本場 供託{handInfo.kyotaku}本</p>
                <p>親: {oyaOrder[handInfo.hand-1]}</p>  
            </div>
            <hr />
            <div className="width95">
                <div>
                    <table>
                        <thead>
                            <tr>
                                <th>着順</th>
                                <th>名前</th>
                                <th>点数</th>
                                <th>点差</th>
                            </tr>
                        </thead>
                        <tbody>
                            {players.map((player, index) => (
                                <tr key={index}>
                                    <th>{ index+1 }</th>
                                    <td>{ player.label }</td>
                                    <td>{ player.pt }</td>
                                    <td>{ player.diff }</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <div>
                <div className="horizonal tab">
                    <ul>
                        <li onClick={() => { sethoraType(gameComponent.Types.ron); }} className={horaType === gameComponent.Types.ron ? "active" : ""}>ロン</li>
                        <li onClick={() => { sethoraType(gameComponent.Types.tsumo);}} className={horaType === gameComponent.Types.tsumo ? "active" : ""}>ツモ</li>
                        <li onClick={() => { sethoraType(gameComponent.Types.ryukyoku);}} className={horaType === gameComponent.Types.ryukyoku ? "active" : ""}>流局</li>
                    </ul>
                </div>
                
                <div>
                    {(horaType === gameComponent.Types.ron || horaType === gameComponent.Types.tsumo) &&
                        <div>
                            <div className='width300px horizonal center-item'>
                                <p className="margin3 width90">リーチ者</p>
                                <Select
                                    className="margin3 width170"
                                    options={players}
                                    placeholder="リーチ者"
                                    isMulti
                                    onChange={player => { setReachPlayers(player) }}
                                />
                            </div>
                            <div className='width300px horizonal center-item'>
                                <p className="margin3 width90">和了者</p>
                                <Select
                                    className="margin3 width170"
                                    options={players}
                                    placeholder="和了者"
                                    onChange={player => { setHoraPlayer(player) }}
                                />
                            </div>
                        </div>
                    }
                </div>
                <div>
                    {horaType === gameComponent.Types.ron &&
                        <div>
                            <div className='width300px horizonal center-item'>
                                <p className="margin3 width90">放銃者</p>
                                <Select
                                    className="margin3 width170"
                                    options={players}
                                    placeholder="放銃者"
                                    onChange={player => { setHojuPlayer(player) }}
                                />
                            </div>
                        </div>
                    }
                </div>
                <div> 
                    {horaType === gameComponent.Types.ryukyoku &&
                        <div>
                            <div className='width300px horizonal center-item'>
                                <p className="margin3 width90">リーチ者</p>
                                <Select
                                    className="margin3 width170"
                                    options={players}
                                    placeholder="リーチ者"
                                    isMulti
                                    onChange={player => { setReachPlayers(player) }}
                                />
                            </div>
                            <div className='width300px horizonal center-item'>
                                <p className="margin3 width90">聴牌者</p>
                                <Select
                                    className="margin3 width170"
                                    options={players}
                                    placeholder="聴牌者"
                                    isMulti
                                    onChange={player => { setTenpaiPlayers(player) }}
                                />
                            </div>
                            <div className="margin3">
                                <input type="checkbox" id="halfway-draw" onChange={(e) => { setIsDraw(e.target.checked); }}/>
                                <label htmlFor="halfway-draw">途中流局</label>
                            </div>
                        </div>
                    }
                </div>
                <div>
                    {(horaType === gameComponent.Types.ron || horaType === gameComponent.Types.tsumo) && 
                        <div>
                            <div>
                                <Select
                                    className="margin3 width290"
                                    options={gameComponent.Hans}
                                    placeholder="翻"
                                    onChange={han => {
                                        setPtElm({ ...ptElm, han: han.value });
                                        if (han.value <= 3) {
                                            setDisplayFus(true);
                                        }
                                        else {
                                            setDisplayFus(false);
                                            let pt = gameComponent.getPt(
                                                horaPlayer.label === oyaOrder[handInfo.hand - 1],
                                                horaType,
                                                han.value
                                            );
                                            setPt(pt);
                                        }
                                    }}
                                />
                            </div>
                            <div>
                                {displayFus && 
                                    <Select
                                        className="margin3 width290"
                                        options={gameComponent.Fus}
                                        placeholder="符"
                                        onChange={fu => { 
                                            setPtElm({ ...ptElm, fu: fu.value });
                                            let pt = gameComponent.getPt(
                                                horaPlayer.label === oyaOrder[handInfo.hand - 1],
                                                horaType,
                                                ptElm.han,
                                                fu.value
                                            )
                                            setPt(pt);
                                        }}
                                    />
                                }
                            </div>
                            <div>
                                {horaType === gameComponent.Types.ron && 
                                    <p>{ pt } 点</p>
                                }
                                {horaType === gameComponent.Types.tsumo && 
                                    <div>
                                        {horaPlayer.label === oyaOrder[handInfo.hand - 1] && 
                                            <p>{pt * 3} 点 （{ pt }オール）</p>
                                        } 
                                        {horaPlayer.label !== oyaOrder[handInfo.hand - 1] && 
                                            <p>{ pt[0]*2 + pt[1] }点（{pt[0]} - { pt[1] }）</p>
                                        } 
                                    </div>
                                }
                            </div>
                        </div>
                    }
                </div>
            </div>
            <div>
                <div className="horizonal-button">
                    <Button buttonName="対局終了" onClick={() => {
                        if (window.confirm("対局終了しますか？")) {
                            categorize(true);
                            window.location.href = "/game/end";
                        }
                    }} />
                    <Link to="/game/log"><Button buttonName="ログ"/></Link>
                    <Button buttonName="次局" onClick={() => {
                        addLog();
                        categorize(false);
                    }} />
                </div>
            </div>
        </div>
    );
}