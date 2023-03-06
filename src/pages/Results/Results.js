import { useEffect, useState } from 'react';
import db from "../../firebase";
import { addDoc, collection, doc, getDocs, setDoc} from "firebase/firestore"
// import './Stats.css';

export function Results(props) {
    const [results, setResults] = useState([]);
    
    useEffect(() => {
        const resultData = collection(db, "results");
        getDocs(resultData).then((snapShot) => {
            let results = snapShot.docs.map(doc => doc.data())
            results.sort((a, b) => { return a.id - b.id });
            setResults(results);
            // console.log(results);
            // setDoc(doc(db, "results", "1"), results[0]);
            // for (let i = 0; i < results.length; i++){
            //     setDoc(doc(db, "results", (results[i].year).toString() + (results[i].id).toString()), results[i]);
            // }
        });


        // addDoc(resultData, {
        //     id          : 1,
        //     name        : "浅野",
        //     first       : 22,
        //     second      : 18,
        //     third       : 23,
        //     fourth      : 22,
        //     pt          : -131,
        //     times       : 85,
        //     year        : 2022
        // })

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
                            <th>1着</th>
                            <th>2着</th>
                            <th>3着</th>
                            <th>4着</th>
                            <th>平均着順</th>
                            <th>連対率</th>
                            <th>合計pt</th>
                            <th>平均pt</th>
                            <th>対局数</th>
                        </tr>   
                    </thead>
                    <tbody>
                        {results.map((result) => (
                            result.year == props.year && result.times != 0 &&
                            <tr key={result.id * result.pt}>
                                {/* <td>{result.id}</td> */}
                                <td>{result.name}</td>
                                <td>{Math.round((result.first/result.times)*1000)/10}%<br />({result.first})</td>
                                <td>{Math.round((result.second/result.times)*1000)/10}%<br />({result.second})</td>
                                <td>{Math.round((result.third/result.times)*1000)/10}%<br />({result.third})</td>
                                <td>{Math.round((result.fourth/result.times)*1000)/10}%<br />({result.fourth})</td>
                                <td>{Math.round(((result.first+result.second*2+result.third*3+result.fourth*4)/result.times)*100)/100}</td>
                                <td>{Math.round(((Number(result.first)+Number(result.second))/result.times)*1000)/10}%</td>
                                <td>{result.pt}</td>
                                <td>{Math.round((result.pt/result.times)*10)/10}</td>
                                <td>{result.times}</td>
                            </tr>
                        ))} 
                    </tbody>
                </table>
            </div>
        </div>
        
    );
}