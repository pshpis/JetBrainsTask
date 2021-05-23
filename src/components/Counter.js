import React, {Component} from "react";

const counterStyle = {
    topPosition: {
        position: "fixed",
        top: "10px",
        right: "10px",
    }
}
class Counter extends Component{
    render() {
        return <div style={counterStyle.topPosition}>
            Steps: {typeof this.props.count === 'undefined'? 0: this.props.count}
        </div>
    }
}

export default Counter;
