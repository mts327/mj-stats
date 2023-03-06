import { useEffect, useState } from 'react';
import db from "../../firebase";
import { collection, doc, getDocs, getDoc, updateDoc, setDoc, deleteDoc } from "firebase/firestore"
import { Link } from "react-router-dom";
import Button from '../../uiParts/button/Button';
import './NewGame.css';

export function EndGame() {
    const [result, setResult] = useState([]);

    useEffect(() => {
        const resultData = collection(db, "result");
        getDocs(resultData).then((snapShot) => {
            let results = snapShot.docs.map(doc => doc.data())
            results[0].result.sort((a, b) => { return b.result - a.result });
            setResult(results[0].result);
            // console.log(results[0].result)
        });
        
    }, []);

    const resetPlayers = () => {
        for (let i = 0; i < 4; i++){
            deleteDoc(doc(db, "players", (i).toString()))
        }
        deleteDoc(doc(db, "result", (0).toString()));
        const logData = collection(db, "logs");
        getDocs(logData).then((snapShot) => {
            let logs = snapShot.docs.map(doc => doc.data())
            for (let i = 0; i < logs.length; i++){
                let logRef = (logs[i].handInfo.ba).toString() + (logs[i].handInfo.hand).toString() + (logs[i].handInfo.honba).toString();
                deleteDoc(doc(db, "logs", logRef))
            }
        });
    }

    const updateRecent = async (recentGames) => {
        let gameIndex = recentGames[0].pts.length;
        for (let i = 0; i < result.length; i++){
            let recentSnap = await getDoc(doc(db, "recent", (result[i].value).toString()));
            if (recentSnap.exists()) {
                let data = recentSnap.data();
                let newPts = data.pts;
                newPts.push(result[i].result);
                updateDoc(doc(db, "recent", (result[i].value).toString()), {
                    pts: newPts,
                })
            }
            else {
                let newPts = new Array(gameIndex).fill(null);
                newPts.push(result[i].result);
                setDoc(doc(db, "recent", (result[i].value).toString()), {
                    id: result[i].value,
                    name: result[i].label,
                    pts:  newPts
                })
            }
        }
        let noPlayers = recentGames.filter(rg => result.findIndex(({ value }) => value === rg.id) === -1);
        for (let i = 0; noPlayers.length; i++){
            // console.log(noPlayers[i].id)
            let recentSnap = await getDoc(doc(db, "recent", (noPlayers[i].id).toString()));
            if (recentSnap.exists()) {
                let data = recentSnap.data();
                let newPts = data.pts;
                newPts.push(null);
                updateDoc(doc(db, "recent", (noPlayers[i].id).toString()), {
                    pts: newPts,
                })
            }
        }
    }

    const addRecent = () => {
        const recentData = collection(db, "recent");
        getDocs(recentData).then((snapShot) => {
            let recentGames = snapShot.docs.map(doc => doc.data());
            if (recentGames.length === 0) {
                result.forEach(r => {
                    console.log(r)
                    setDoc(doc(db, "recent", (r.value).toString()), {
                        id: r.value,
                        name: r.label,
                        pts:  [r.result]
                    })
                })
            }
            else {
                updateRecent(recentGames); 
            }
        });
    }

    const addResults = async () => {
        for (let i = 0; i < result.length; i++) {
            let playerRef = doc(db, "results", (new Date().getFullYear()).toString() + (result[i].value).toString());
            let playerSnap = await getDoc(playerRef);
            if (playerSnap.exists()) {
                let data = playerSnap.data();
                updateDoc(playerRef, {
                    times: data.times + 1,
                    pt: data.pt + result[i].result,
                })
                switch (i) {
                    case 0:
                        updateDoc(playerRef, {
                            first: data.first + 1,
                        })
                        break;
                    case 1:
                        updateDoc(playerRef, {
                            second: data.second + 1,
                        })
                        break;
                    case 2:
                        updateDoc(playerRef, {
                            third: data.third + 1,
                        })
                        break;
                    case 3:
                        updateDoc(playerRef, {
                            fourth: data.fourth + 1,
                        })
                        break;
                }
            }
            else {
                setDoc(doc(db, "results", (new Date().getFullYear()).toString() + (result[i].value).toString()), {
                    id: result[i].value,
                    name: result[i].label,
                    first: 0,
                    second: 0,
                    third: 0,
                    fourth: 0,
                    pt: 0,
                    times: 0,
                    year: new Date().getFullYear(),
                });
                updateDoc(playerRef, {
                    times: 1,
                    pt: result[i].result,
                })
                switch (i) {
                    case 0:
                        updateDoc(playerRef, {
                            first: 1,
                        })
                        break;
                    case 1:
                        updateDoc(playerRef, {
                            second: 1,
                        })
                        break;
                    case 2:
                        updateDoc(playerRef, {
                            third: 1,
                        })
                        break;
                    case 3:
                        updateDoc(playerRef, {
                            fourth: 1,
                        })
                        break;
                }
            }
        }
    }
    
    return (
        <div className="new-game">
            <table className="width95 end-table">
                <thead>
                    <tr>
                        <th>着順</th>
                        <th>名前</th>
                        <th>点数</th>
                        <th>ポイント</th>
                    </tr>
                </thead>
                <tbody>
                    {result.map((player, index) => (
                        <tr key={index}>
                            <th>{ index+1 }</th>
                            <td>{ player.label }</td>
                            <td>{ player.pt }</td>
                            <td>{ player.result }</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <Link to="/recent"><Button buttonName="終局" onClick={() => { addResults(); addRecent(); resetPlayers(); }}/></Link>
        </div>
    );
}