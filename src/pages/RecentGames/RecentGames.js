import { useEffect, useState } from 'react';
import db from "../../firebase";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore"
import './RecentGames.css';
import { Link } from 'react-router-dom';
import Button from '../../uiParts/button/Button';

export function RecentGames(props) {
    const [recentGames, setRecentGames] = useState([]);
    const [isRender, setIsRender] = useState(false);
    const [totalPts, setTotalPts] = useState([]);
    
    const calcTotalPts = (recentGames) => {
        let totalPts = [];
        recentGames.forEach(rg => {
            let total = 0;
            rg.pts.forEach(pt => {
                if (pt !== null) {
                    total += pt;
                }
            })
            totalPts.push(total);
        })
        setTotalPts(totalPts);
    }

    const deleteRecent = () => {
        for (let i = 0; i < recentGames.length; i++){
            deleteDoc(doc(db, "recent", (i+1).toString())) //IDが飛んでいる時に消せない
        }
    }

    useEffect(() => {
        const recentGameData = collection(db, "recent");
        getDocs(recentGameData).then((snapShot) => {
            let recentGames = snapShot.docs.map(doc => doc.data())
            recentGames.sort((a, b) => { return a.timestamp - b.timestamp });
            calcTotalPts(recentGames);
            setRecentGames(recentGames);
            setIsRender(true);
        });

        // addDoc(statData, {
        //     year        : 2022,
        //     id          : 1,
        //     hora        : 234,
        //     tsumo       : 96,
        //     horareach   : 112,
        //     daten       : 142200,
        //     hoju        : 156,
        //     hojuten     : 893400,
        //     hojureach   : 20,
        //     reach       : 208,
        //     tenpai      : 87,
        //     ryukyoku    : 176,
        //     times       : 1110,
        // })


        // realtime
        // onSnapshot(statData, (user) => {
        //     setUsers(user.docs.map(doc => ({ ...doc.data() })));
        // })
        
    }, []);

    
    return (
        <div className="center">
            <div className="width100">
                <h3>最近の対局結果</h3>
                <table className="table-recent">
                    <thead>
                        <tr>
                            <th>No.</th>
                            {recentGames.map((recentGame) => (
                                <th key={recentGame.name}>{ recentGame.name }</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {isRender && recentGames.length !== 0 && recentGames[0].pts.map((noUsed, index) => (
                            <tr key={index}>
                            <th>#{index+1}</th>
                            {recentGames.map((recentGame) => (
                                <td key={recentGame.name}>{ recentGame.pts[index] }</td>
                            ))}
                            </tr>
                        ))}
                        <tr>
                            <th className="border-top">合計</th>
                            {totalPts.map((totalPt) => (
                                <td className="border-top" key={ totalPt } >{ totalPt }</td>
                            ))}
                        </tr>
                    </tbody>
                </table>
                <Button buttonName="終了" onClick={() => {
                    if (window.confirm("終了しますか？")) {
                        deleteRecent();
                    }}}/>
            </div>
        </div>
    );
}