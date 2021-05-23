import React, {PureComponent} from "react";



class CellToken extends PureComponent{
    tokenStyle = {
        width: '100%',
        height: '100%',
        textAlign: "center",
        lineHeight: "40px",
        color: "white",
        borderRadius: "3px",
    }

    render() {
        let style = Object.assign({}, this.tokenStyle, {backgroundColor: this.props.value? '#6ba4ff': 'inherit'});
        return (
            <div style={style} key={"token_" + this.props.value}>
                {this.props.value ? this.props.value: ""}
            </div>
        );
    }
}

export default CellToken;