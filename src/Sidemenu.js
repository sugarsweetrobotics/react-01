import React from 'react';
import {Menu, Button, Icon} from 'semantic-ui-react';


export default class Sidemenu extends React.Component {
    constructor(props) {
        super(props);

    }

    onAddButtonClicked(e) {
        fetch(url, {
            method: 'GET', mode:'cors'
        }).then(response => {

        })
    }

    onSyncButtonClicked(e) {
        fetch(url, {
            method: 'GET', mode:'cors'
        }).then(response => {

        })
    }


    render() {
        return (
            <Menu secondary>
                <Menu.Item>
                    Process
                </Menu.Item>

                <Menu.Menu position={'right'}>
                    <Button icon compact onClick={this.onAddButtonClicked.bind(this)}>
                        <Icon name={'add'}/>
                    </Button>
                    <Button icon compact onClick={this.onSyncButtonClicked.bind(this)}>
                        <Icon name={'sync'}/>
                    </Button>
                </Menu.Menu>
            </Menu>
        );
    }
}