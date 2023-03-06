import { useEffect, useState } from 'react';
import db from "../../firebase";
import { addDoc, collection, getDoc, doc, getDocs, updateDoc, deleteDoc, deleteField } from "firebase/firestore"
import Select from "react-select"
import './NewGame.css';
// import Button from '../../uiParts/button/Button';
import { Link } from "react-router-dom";
import { Game } from './Game';
import Button from '../../uiParts/button/Button';
import { GameComponent } from "./GameComponent";


export function Log() {
    const [logNo, setLogNo] = useState(-1);
    const [logs, setLogs] = useState([]);
    const [horaType, sethoraType] = useState("");
    const [players, setPlayers] = useState([]);
    const [reachPlayers, setReachPlayers] = useState([]);
    const [horaPlayer, setHoraPlayer] = useState("");
    const [hojuPlayer, setHojuPlayer] = useState("");
    const [tenpaiPlayers, setTenpaiPlayers] = useState([]);
    const [ptElm, setPtElm] = useState({});
    const [displayFus, setDisplayFus] = useState(false);
    const [oyaOrder, setOyaOrder] = useState([]);
    const [pt, setPt] = useState(0);
    const [handInfo, setHandInfo] = useState({});
    const [isDraw, setIsDraw] = useState(false);


    const gameComponent = new GameComponent();


    useEffect(() => {
        const logData = collection(db, "logs");
        const orderData = collection(db, "order");

        getDocs(logData).then(snapShot => {
            let logs = snapShot.docs.map(doc => doc.data());
            logs.sort((a, b) => { return a.time - b.time });
            // logs.splice(logs.length - 1, 1);
            setLogs(logs);
            console.log(logs);
        });

        getDocs(orderData).then((snapShot) => {
            let order = snapShot.docs.map(doc => doc.data());
            // players.sort((a, b) => { return b.pt - a.pt });
            // setPlayers(players);
            let oyaOrder = order[0].order.map(o => o.name);
            setOyaOrder(oyaOrder);
        });
    }, []); 

    const setLogInfo = (i) => {
        console.log(logs[i]);
        setLogNo(i);
        setPlayers(logs[i + 1].handInfo.playersInfo);
        setHandInfo(logs[i].handInfo);
    };

    const deleteStatsFromLog = async (log) => {
        console.log(log)
        for (let i = 0; i < log.handInfo.playersInfo.length; i++){
            let playerRef = doc(db, "stats", (new Date().getFullYear()).toString() + (log.handInfo.playersInfo[i].value).toString());
            let playerSnap = await getDoc(playerRef);
            if (playerSnap.exists()) {
                let data = playerSnap.data();
                updateDoc(playerRef, {
                    times: data.times - 1,
                })
                if (log.reachs.includes(log.handInfo.playersInfo[i].label)) {
                    updateDoc(playerRef, {
                        reach: data.reach - 1,
                    })
                }
                switch (log.type) {
                    case gameComponent.Types.ron:
                        if (log.hora == log.handInfo.playersInfo[i].label) {
                            updateDoc(playerRef, {
                                hora: data.hora - 1,
                                daten: data.daten - pt,
                            })
                            if (log.reachs.includes(log.handInfo.playersInfo[i].label)) {
                                updateDoc(playerRef, {
                                    horareach: data.horareach - 1
                                })
                            }
                        }
                        else if (log.hoju == log.handInfo.playersInfo[i].label) {
                            updateDoc(playerRef, {
                                hoju: data.hoju - 1,
                                hojuten: data.hojuten - pt,
                            })
                            if (log.reachs.includes(log.handInfo.playersInfo[i].label)) {
                                updateDoc(playerRef, {
                                    hojureach: data.hojureach - 1
                                })
                            }
                        }
                        break;
                    case gameComponent.Types.tsumo:
                        if (log.hora == log.handInfo.playersInfo[i].label) {
                            updateDoc(playerRef, {
                                hora: data.hora - 1,
                                tsumo: data.tsumo - 1,
                                daten: data.daten - pt,
                            })
                            if (log.reachs.includes(log.handInfo.playersInfo[i].label)) {
                                updateDoc(playerRef, {
                                    horareach: data.horareach - 1
                                })
                            }
                        }
                        break;
                    case gameComponent.Types.ryukyoku:
                        updateDoc(playerRef, {
                            ryukyoku: data.ryukyoku - 1
                        })
                        if (log.tenpais.includes(log.handInfo.playersInfo[i].label)) {
                            updateDoc(playerRef, {
                                tenpai: data.tenpai - 1
                            })
                        }
                        break;
                }
            }
        }
    }

    const returnLog = () => {
        for (let i = 0; i < logs[logNo].handInfo.playersInfo.length; i++){
            updateDoc(doc(db, "players", (i).toString()), {
                value       : logs[logNo].handInfo.playersInfo[i].value,
                label       : logs[logNo].handInfo.playersInfo[i].label,
                pt          : logs[logNo].handInfo.playersInfo[i].pt,
                diff        : logs[logNo].handInfo.playersInfo[i].diff,
                direction   : logs[logNo].handInfo.playersInfo[i].direction,
            })
        }
        for (let i = logNo; i < logs.length; i++){
            if (i < logs.length - 1) {
                deleteStatsFromLog(logs[i]);
            }
            
            if (i === logNo) {
                let logRef = (logs[i].handInfo.ba).toString() + (logs[i].handInfo.hand).toString() + (logs[i].handInfo.honba).toString();
                updateDoc(doc(db, "logs", logRef), {
                    hoju: deleteField(),
                    hora: deleteField(),
                    pt: deleteField(),
                    reachs: deleteField(),
                    tenpais: deleteField(),
                    type: deleteField()
                })
            }
            else {
                let logRef = (logs[i].handInfo.ba).toString() + (logs[i].handInfo.hand).toString() + (logs[i].handInfo.honba).toString();
                deleteDoc(doc(db, "logs", logRef));
            }

        }
    }

    return (
        <div className="new-game">
            <div>
                <div className="horizonal-button">
                    <Link to="/game/"><Button buttonName="対局画面に戻る"/></Link>
                </div>
            </div>
            <table className="log width95 log-table">
                <thead>
                    <tr>
                        <th>場</th>
                        <th>局</th>
                        <th>本場</th>
                        <th>供託</th>
                        <th>結果</th>
                        <th>和了</th>
                        <th>放銃</th>
                        <th>リーチ者</th>
                        <th>聴牌者</th>
                        <th>打点</th>
                        <th>点数表示</th>
                    </tr>
                </thead>
                    <tbody>
                    {logs.map((log, index) => (
                            index !== logs.length-1 &&
                            <tr key={index}>
                                <td>{gameComponent.Bas[log.handInfo.ba]}</td>
                                <td>{log.handInfo.hand}</td>
                                <td>{log.handInfo.honba}</td>
                                <td>{log.handInfo.kyotaku}</td>
                                <td>{log.type}</td>
                                <td>{log.hora}</td>
                                <td>{log.hoju}</td>
                                <td>{log.reachs}</td>
                                <td>{log.tenpais}</td>
                                <td>{log.pt}</td>
                                <td><Button buttonName="表示" onClick={() => { 
                                    setLogInfo(index);
                                }} /></td>
                            </tr>
                        ))}
                    </tbody>
            </table>
            <div className="new-game">
                {logNo !== -1 &&
                    <div className='width95'>
                       <div>
                            <p>{gameComponent.Bas[handInfo.ba]}{handInfo.hand}局{handInfo.honba}本場 供託{handInfo.kyotaku}本</p>
                            <p>親: {oyaOrder[handInfo.hand-1]}</p>  
                        </div>
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
                }
            </div>
            <div>
                {logNo !== -1 && 
                    <div className="horizonal-button">
                        <Button buttonName="ここからやり直す" onClick={() => {
                            if (window.confirm("この局から入力し直しますか？")) {
                                returnLog();
                                window.location.href = "/game";
                            }
                        }} />
                    </div>
                }
            </div>
        </div>
    );
}