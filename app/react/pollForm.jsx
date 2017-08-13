
var React = require('react');
var ReactDOM = require('react-dom');


class App extends React.Component {
    constructor() {
        super();
        this.addOption = this.addOption.bind(this);
        this.deleteOption = this.deleteOption.bind(this);
        this.state = {
            options: {  0: (<div key={"container"+0} className="inputOption"><input type="text" name="option" key={"option"+0} /><div onClick={this.deleteOption} id={0} key={"delete"+0}>x</div></div>),
                        1: (<div key={"container"+1} className="inputOption"><input type="text" name="option" key={"option"+1} /><div onClick={this.deleteOption} id={1} key={"delete"+1}>x</div></div>)
            }
        }
    }
    
    componentDidMount() {
        
    }
    
    addOption(e) {
        e.preventDefault();
        let options = this.state.options;
        let keys = Object.keys(options);
        let long = keys.length -1;
        let final = Number(keys[long]) + 1;

        options[final] = ((<div className="inputOption" key={"container"+final}><input type="text" name="option" key={"option"+final} /><div onClick={this.deleteOption} id={final} key={"delete"+final}>x</div></div>));
        this.setState({options});
    }
    
    deleteOption(e) {
        e.preventDefault();
        let options = this.state.options;
        //options.splice doesnt work cos its an object
        let keys = Object.keys(options);
        if(e.target.id in keys) {
            delete options[e.target.id]
        }
       this.setState({options});
    }
    
    render() {
        return (
            <form method="POST" className="createPollForm">
                <label>Question</label>
                <input type="text" name="title" defaultValue = {askedQuestion || ''}/>
                <label className="optionsHeading">
                    <span> Options </span>
                    <div onClick={this.addOption} className="addOptionButton"> +  </div>
                </label>
                {Object.values(this.state.options)}
                <button type="submit" className="createPollFinal">Create Poll</button>
            </form>
            )
    }
}

ReactDOM.render(<App />, document.getElementById("createPollFormContainer"));