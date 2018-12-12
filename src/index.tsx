import './index.scss';

import { createBrowserHistory } from 'history';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Route, Router } from 'react-router';
import { routerMiddleware, routerReducer } from 'react-router-redux';
import { applyMiddleware, combineReducers, compose, createStore, Reducer } from 'redux';
import thunk from 'redux-thunk';

import { UserReport } from '@app/core';

import * as Reducers from '@app/wireframes/model/actions';

import {
    createInitialAssetsState,
    createInitialLoadingState,
    createInitialUIState,
    EditorState,
    SELECT_DIAGRAM,
    SELECT_ITEMS,
    Serializer
} from '@app/wireframes/model';

import { RendererContext, SerializerContext } from '@app/context';
import { registerRenderers } from '@app/wireframes/shapes';

const rendererService = registerRenderers();

const serializer = new Serializer(rendererService);

const reducers: Reducer<EditorState>[] = [
    Reducers.alignment(),
    Reducers.appearance(),
    Reducers.items(rendererService, serializer),
    Reducers.diagrams(),
    Reducers.grouping(),
    Reducers.ordering()
];

const editorReducer: Reducer<EditorState> = (state: EditorState, action: any) => {
    for (const nested of reducers) {
        const newState = nested(state, action);

        if (newState !== state) {
            return newState;
        }
    }

    return state;
};

const undoableReducer = Reducers.undoable(editorReducer,
    EditorState.empty(),
    [
        SELECT_DIAGRAM,
        SELECT_ITEMS
    ]
);

const history = createBrowserHistory();

const composeEnhancers = window['__REDUX_DEVTOOLS_EXTENSION_COMPOSE__'] || compose;

const store = createStore(
    Reducers.rootLoading(
        combineReducers({
             assets: Reducers.assets(createInitialAssetsState(rendererService)),
             editor: undoableReducer,
            loading: Reducers.loading(createInitialLoadingState()),
            routing: routerReducer,
                 ui: Reducers.ui(createInitialUIState())
    }), undoableReducer, editorReducer),
    composeEnhancers(applyMiddleware(thunk, Reducers.toastMiddleware(), routerMiddleware(history)))
);

import { AppContainer } from './App';

const Root = (
    <>
        <SerializerContext.Provider value={serializer}>
            <RendererContext.Provider value={rendererService}>
                <Provider store={store}>
                    <Router history={history}>
                        <Route path='/:token?' render={props => (
                            <AppContainer token={props.match.params.token} />
                        )} />
                    </Router>
                </Provider>
            </RendererContext.Provider>
        </SerializerContext.Provider>

        <UserReport />
    </>
);

ReactDOM.render(Root, document.getElementById('root') as HTMLElement);
