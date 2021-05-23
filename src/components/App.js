import React, {Component} from 'react'
import GameDesk from "./GameDesk";


const appStyles = {
    parentCenter: {
        display: "grid",
        placeItems: "center",
        width: "100%",
        height: "100%",
    },

    appH: {
        marginBottom: "5px",
        textAlign: "center"
    }
}
class App extends Component{
    render() {
        return(
            <div style={appStyles.parentCenter}>
                <div>
                    <h1 style={appStyles.appH}>15 Puzzle</h1>
                    <GameDesk />
                </div>
            </div>
        );
    }
}

export default App;