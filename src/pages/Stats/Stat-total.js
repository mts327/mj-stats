import { useEffect, useState } from 'react';
import db from "../../firebase";
import { collection, getDocs } from "firebase/firestore"
import './Stats.css';

function setTotal(stats) {
    let totalStats = [];
    stats.forEach(stat => {
        let index = totalStats.findIndex(({ id }) => id == stat.id);
        if (index == -1) {
            let newStat = stat;
            newStat.year = "通算";
            totalStats.push(newStat);
        }
        else {
            totalStats[index].hora += stat.hora;
            totalStats[index].tsumo += stat.tsumo;
            totalStats[index].horareach += stat.horareach;
            totalStats[index].daten += stat.daten;
            totalStats[index].hoju += stat.hoju;
            totalStats[index].hojuten += stat.hojuten;
            totalStats[index].hojureach += stat.hojureach;
            totalStats[index].reach += stat.reach;
            totalStats[index].tenpai += stat.tenpai;
            totalStats[index].ryukyoku += stat.ryukyoku;
            totalStats[index].times += stat.times;
        }
    })

    return totalStats;
}

export function StatsTotal(props) {
    const [stats, setStats] = useState([]);
    
    useEffect(() => {
        // get data
        const statData = collection(db, "stats");
        getDocs(statData).then((snapShot) => {
            let stats = snapShot.docs.map(doc => doc.data())
            stats.sort((a, b) => { return a.id - b.id });
            setTotal(stats);
            setStats(stats)
        });


        // realtime
        // onSnapshot(statData, (user) => {
        //     setUsers(user.docs.map(doc => ({ ...doc.data() })));
        // })
        
    }, []);

    
    return (
        <div className="center">
            <div className="width100">
                <h3>{props.year}</h3>
                <table className="record-table">
                    <thead>
                        <tr>
                            {/* <th>Id</th> */}
                            <th>Name</th>
                            <th>強さ指数</th>
                            <th>和了率</th>
                            <th>ツモ率</th>
                            <th>平均打点</th>
                            <th>放銃率</th>
                            <th>平均放銃点</th>
                            <th>放銃時リーチ率</th>
                            <th>リーチ率</th>
                            <th>リーチ成功率</th>
                            <th>リーチ和了率</th>
                            <th>リーチ時放銃率</th>
                            <th>流局時聴牌率</th>
                        </tr>   
                    </thead>
                    <tbody>
                        {stats.map((stat) => (
                            stat.year == props.year && stat.times != 0 &&
                            <tr key={stat.id + stat.hora}>
                                {/* <td>{stat.id}</td> */}
                                <td>{stat.name}</td>
                                <td>{Math.round((stat.daten/stat.hora)*(stat.hora/stat.times)-(stat.hojuten/stat.hoju)*(stat.hoju/stat.times))}</td>
                                <td>{Math.round((stat.hora/stat.times)*1000)/10} %</td>
                                <td>{Math.round((stat.tsumo/stat.hora)*1000)/10} %</td>
                                <td>{Math.round((stat.daten/stat.hora))} 点</td>
                                <td>{Math.round((stat.hoju/stat.times)*1000)/10} %</td>
                                <td>{Math.round((stat.hojuten/stat.hoju))} 点</td>
                                <td>{Math.round((stat.hojureach/stat.hoju)*1000)/10}%</td>
                                <td>{Math.round((stat.reach/stat.times)*1000)/10} %</td>
                                <td>{Math.round((stat.horareach/stat.reach) * 1000) / 10} %</td>
                                <td>{Math.round((stat.horareach/stat.hora)*1000)/10} %</td>
                                <td>{Math.round((stat.hojureach/stat.reach)*1000)/10}%</td>
                                <td>{Math.round((stat.tenpai/stat.ryukyoku)*1000)/10} %</td>
                        </tr>
                        ))} 
                    </tbody>
                </table>
            </div>
        </div>
        
    );
}