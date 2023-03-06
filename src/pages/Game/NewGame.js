import { useEffect, useState } from 'react';
import db from "../../firebase";
import { addDoc, collection, doc, getDocs, setDoc } from "firebase/firestore"
import Select from "react-select"
import './NewGame.css';
// import Button from '../../uiParts/button/Button';
import { Link } from "react-router-dom";
import { Game } from './Game';
import Button from '../../uiParts/button/Button';

export function NewGame() {
    const [users, setUsers] = useState([]);
    const [isStart, setIsStart] = useState(false);
    let players = new Array(4);

    useEffect(() => {
        const userData = collection(db, "users");
        getDocs(userData).then((snapShot) => {
            let users = snapShot.docs.map(doc => doc.data())
            users.sort((a, b) => { return a.id - b.id });
            let newUsers = users.map(user => {
                return { value: user.id, label: user.name }
            })
            setUsers(newUsers)
        });

        

        // realtime
        // onSnapshot(statData, (user) => {
        //     setUsers(user.docs.map(doc => ({ ...doc.data() })));
        // })
        
    }, []);

    const onClickAdd = async (players) => {
        // let playerData = collection(db, "players");
        players.forEach((player, index) => {
            setDoc(doc(db, "players", (index).toString()), {
                direction: player.direction,
                value: player.id,
                label: player.name,
                pt: 25000,
                diff: 0
            })
        });
        setDoc(doc(db, "order", (0).toString()), {
            order: players,
        })
    }
    

    
    return (
        <div className="new-game">
            <div className="margin1">
                <span>東家</span>
                <Select
                    options={users}
                    placeholder="東家"
                    onChange={user => { players[0]={direction: 0, id: user.value, name: user.label} }}
                />
            </div>
            <div className="margin1">
                <span>南家</span>
                <Select
                    options={users}
                    placeholder="南家"
                    onChange={user=> { players[1]={direction: 1, id: user.value, name: user.label} }}
                />
            </div>
            <div className="margin1">
                <span>西家</span>
                <Select
                    options={users}
                    placeholder="西家"
                    onChange={user => { players[2]={direction: 2, id: user.value, name: user.label} }}
                    />
            </div>
            <div className="margin1">
                <span>北家</span>
                    <Select
                        options={users}
                        placeholder="南家"
                        onChange={user => { players[3]={direction: 3, id: user.value, name: user.label} }}
                    />
            </div>
            <Link to="/game" onClick={() => { onClickAdd(players) }}><Button buttonName="対局開始"/></Link>
        </div>
    );
}