import React from 'react';
import {Menu, Icon} from 'semantic-ui-react';

class Menubar extends React.Component {
    static get defaultProps() {
        return {'onMenuIconClicked':(_)=>{}}
    }

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Menu attached='top'>
                <Menu.Item icon='align justify' simple onClick={this.props.onMenuIconClicked}></Menu.Item>
            </Menu>
        );
    }
}


export default Menubar;