import React, {Component, ReactElement, ReactFragment, ReactPortal} from 'react';
import {IpBlock} from "../common/Contract";

interface Props {
    ipBlocks: IpBlock[];
    children?: ReactElement | ReactFragment | ReactPortal | boolean | null | undefined;
}

interface State {
    isPopupVisible: boolean;
}

export default class Popup extends Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            isPopupVisible: false,
        };
    }

    handleMouseEnter = () => {
        this.setState({...this.state, isPopupVisible: true});
    };

    handleMouseLeave = () => {
        this.setState({...this.state, isPopupVisible: false});
    };

    render() {
        const {ipBlocks} = this.props;
        const {isPopupVisible} = this.state;

        return (
            // TODO this styling might cause problems later, apply it to the CSS file instead
            <div
                onMouseEnter={this.handleMouseEnter}
                onMouseLeave={this.handleMouseLeave}
                style={{/*display: 'inline-block',*/ position: 'relative'}}
            >
                {this.props.children}
                {isPopupVisible && (
                    <div
                        style={{
                            position: 'absolute',
                            top: '30px',
                            left: '15px',
                            backgroundColor: '#666666',
                            padding: '10px 10px',
                            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
                            zIndex: 999,
                            color: 'white',
                            borderRadius: '5px',
                            width:'200px'
                        }}
                    >
                        {ipBlocks && ipBlocks.map((ipBlock, index) =>
                            <>
                                <p className='m-0'>Name: {ipBlock.ipblockName}</p>
                            </>
                        )}
                        {ipBlocks == undefined && 
                            <>
                                <p className='m-0'>No purchase</p>
                            </>
                        }

                    </div>
                )}
            </div>
        );
    }
}
