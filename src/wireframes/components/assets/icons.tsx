import { Input } from 'antd';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import './icons.scss';

import { Grid } from '@app/core';

import {
    addIcon,
    AssetsState,
    EditorState,
    filterIcons,
    IconInfo,
    UndoableState
} from '@app/wireframes/model';

import { Icon } from './icon';

interface IconsProps {
    // The filtered icons.
    iconsFiltered: IconInfo[];

    // The icons filter.
    iconsFilter: string;

    // The selected diagram.
    selectedDiagramId: string | null;

    // Filter the icons.
    filterIcons: (value: string) => any;

    // Adds an Icon.
    addIconToPosition: (diagram: string, char: string) => any;
}

const addIconToPosition = (diagram: string, char: string) => {
    return addIcon(diagram, char, 100, 100);
};

const mapStateToProps = (state: { assets: AssetsState, editor: UndoableState<EditorState> }) => {
    return {
        selectedDiagramId: state.editor.present.selectedDiagramId,
        iconsFiltered: state.assets.iconsFiltered,
        iconsFilter: state.assets.iconsFilter
    };
};

const mapDispatchToProps = (dispatch: Dispatch) => bindActionCreators({
    filterIcons, addIconToPosition
}, dispatch);

class Icons extends React.PureComponent<IconsProps> {
    private cellRenderer = (icon: IconInfo) => {
        const doAdd = () => {
            const diagramId = this.props.selectedDiagramId;

            if (diagramId) {
                this.props.addIconToPosition(diagramId, icon.text);
            }
        };

        return (
            <div className='asset-icon'>
                <div className='asset-icon-preview' onDoubleClick={doAdd}>
                    <Icon icon={icon} />
                </div>

                <div className='asset-icon-title'>{icon.label}</div>
            </div>
        );
    }

    public render() {
        return (
            <>
                <div className='asset-icons-search'>
                    <Input placeholder='Find icon' value={this.props.iconsFilter} onChange={event => this.props.filterIcons(event.target.value)} />
                </div>

                <Grid className='asset-icons-list' renderer={this.cellRenderer} columns={3} items={this.props.iconsFiltered} keyBuilder={icon => icon.name} />
            </>
        );
    }
}

export const IconsContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(Icons);