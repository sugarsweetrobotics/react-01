import React from 'react';
import {Menu} from 'semantic-ui-react';

class Menubar extends React.Component {
    static get defaultProps() {
        return {'onMenuIconClicked':(_)=>{}}
    }

    render() {
        return (
            <Menu attached='top'>
                <Menu.Item icon='align justify' onClick={this.props.onMenuIconClicked}></Menu.Item>
            </Menu>
        );
    }
}


export default Menubar;