import React, {Component} from "react";
import CellToken from "../CellToken";
import Counter from "../Counter";
import Modal from "../Modal";
import {setCookie, getCookie} from "../cookie";

if(Array.prototype.equals)
    console.warn("Overriding existing Array.prototype.equals. Possible causes: New API defines the method, there a framework conflict or you've got double inclusions in your code.");

Array.prototype.equals = function (array) {
    if (!array)
        return false;

    if (this.length !== array.length)
        return false;

    for (let i = 0, l=this.length; i < l; i++) {
        if (this[i] instanceof Array && array[i] instanceof Array) {
            if (!this[i].equals(array[i]))
                return false;
        }
        else if (this[i] !== array[i]) {
            return false;
        }
    }
    return true;
}

const clone = (x) => {
    return JSON.parse(JSON.stringify(x));
}

const getRandomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const random = arr => {
    return arr[getRandomInt(0, arr.length - 1)];
}

const DeskStyles = {
    game_table: {
        marginBottom: "5px",
    },

    game_td: {
        width: "50px",
        height: "50px",
        textAlign: "center",
        verticalAlign: "center",
        border: "1px solid black",
        padding: "5px",
    },

    primary_btn: {
        color: "white",
        backgroundColor: "#0d6efd",
        borderColor: "#0d6efd",

        borderRadius: ".25rem",
        verticalAlign: "middle",
        textAlign: "center",
        border: "1px solid #0d6efd",
        width: "100%",
        height: "30px",
    }
}


class GameDesk extends Component{

    constructor(props) {
        super(props);

        let defSize = 4;
        let defPos = this.getDefaultPos(defSize);

        this.state = {
            size: defSize,
            figPos: defPos,
            stepsCount: 0,
            gameStarted: false,
            modalActive: false,
            record: -1,
            oldRecord: -1
        }

        this.moves = [
            [1, 0],
            [-1, 0],
            [0, 1],
            [0, -1]
        ]
    }

    setModalActive = fl => {
        let newState = this.state;
        newState.modalActive = fl;
        this.setState(newState);
    }

    checkCoord = (coord) => {
        let fl = true;
        coord.forEach(p => {
           if (p < 0 || p >= this.state.size) fl = false;
        });
        return fl;
    }


    getDefaultPos = (sz) => {
        let ans = [];
        for (let i = 0; i < sz; i ++){
            let row = [];
            for (let j = 0; j < sz; j ++){
                row.push((i * sz + j + 1) % (sz ** 2));
            }
            ans.push(row);
        }
        return ans;
    }

    findZero = (desk = this.state.figPos) => {
        for (let i = 0; i < this.state.size; i ++)
            for (let j = 0; j < this.state.size; j ++)
                if (desk[i][j] === 0) return [i, j];
    }

    swap = (c, z) => {
        if (c !== z){
            let nwFigPos = clone(this.state.figPos);
            nwFigPos[z[0]][z[1]] = nwFigPos[c[0]][c[1]];
            nwFigPos[c[0]][c[1]] = 0;

            let newState = this.state;
            newState.figPos = nwFigPos;
            this.setState(newState);
        }
    }

    moveCell = (coord) => {
        if (this.state.figPos[coord[0]][coord[1]] === 0) return;

        let is_swap = false;
        this.moves.forEach(mv => {
            if (is_swap) return;
            let nw = clone(coord);
            nw[0] += mv[0];
            nw[1] += mv[1];

            if (this.checkCoord(nw) && this.state.figPos[nw[0]][nw[1]] === 0){
                this.swap(coord, nw);
                is_swap = true;
            }
        });

        return is_swap;
    }

    randomStep = async (desk = this.state.figPos) => {
        let z = this.findZero(desk);
        let mv = clone(random(this.moves));
        let nw = [z[0] + mv[0], z[1] + mv[1]];
        while (!this.checkCoord(nw) && nw !== z){
            mv = clone(random(this.moves));
            nw = [z[0] + mv[0], z[1] + mv[1]];
        }
        // console.log(z, nw, mv);
        desk[z[0]][z[1]] = desk[nw[0]][nw[1]];
        desk[nw[0]][nw[1]] = 0;
    }

    shuffle = async () => {
        let desk = clone(this.state.figPos);
        for (let i = 0; i < 200; i ++){ //CHANGE MORE THEN 1 MOVE
            await this.randomStep(desk);
        }

        let newState = this.state;
        newState.figPos = desk;
        this.setState(newState);
        // console.log(this.state.figPos);

    }

    makeStep = async (i, j) => {
        if (!this.state.is_game_started) return;
        if (this.moveCell([i, j])){
            let newState = clone(this.state);
            newState.steps_count ++;
            await this.setState(newState);
            if (this.state.figPos.equals(this.getDefaultPos(this.state.size))){
                this.win();
            }
        }
    }

    win = () => {
        let newState = clone(this.state);
        newState.is_game_started = false;

        let oldRecord = getCookie('record');
        if (typeof oldRecord === "undefined"){
            oldRecord = 1e9;
        }
        newState.oldRecord = oldRecord;

        newState.record = Math.min(parseInt(oldRecord), this.state.steps_count);
        setCookie('record', newState.record);

        this.setState(newState);
        this.setModalActive(true);
    }

    startGame = async () =>{
        let newState = clone(this.state);
        newState.steps_count = 0;
        newState.is_game_started = true;
        this.setState(newState);

        await this.shuffle();
    }

    render() {
        let strs = [];
        for (let i = 0; i < this.state.size; i ++){
            let cols = [];
            for (let j = 0; j < this.state.size; j ++){
                cols.push(
                    <td key = {"game_desk_td_" + (i * this.state.size + j)} style={DeskStyles.game_td} onClick={() => {this.makeStep(i, j)}}>
                        <CellToken value = {this.state.figPos[i][j]}/>
                    </td>
                );
            }
            let str = <tr key={"table_str_" + i}>{cols}</tr>
            strs.push(str);
        }

        return (
            <>
                <Modal active={this.state.modalActive} setActive={this.setModalActive}>
                    <h3>Congratulations! You are winner!</h3>
                    {this.state.record < this.state.oldRecord?
                        <p>You bit your record!!! Now your record is
                            <span style={{textDecoration: "line-through"}}>{this.state.oldRecord === 1e9? " ∞": " " + this.state.oldRecord}</span> {this.state.record}</p>:
                        <p>Your result is {this.state.steps_count}. Work harder to bit your record({this.state.record})</p>
                    }
                </Modal>
                <Counter count={this.state.steps_count} />
                <table cellSpacing="0" style={DeskStyles.game_table}>
                    <tbody>
                    {strs}
                    </tbody>
                </table>
                <button onClick={this.startGame} style={DeskStyles.primary_btn}>{this.state.is_game_started? "Start new game": "Start!"}</button>
            </>
        );
    }
}


export default GameDesk;