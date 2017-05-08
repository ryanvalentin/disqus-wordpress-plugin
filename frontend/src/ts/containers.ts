import * as React from 'react';
import * as ReactRedux from 'react-redux';
import * as Redux from 'redux';
import {
    setMessageAction,
    toggleLocalOptionAction,
    updateAdminOptionsAction,
    updateLocalOptionAction,
} from './actions';
import Install from './components/Install';
import Main from './components/Main';
import SiteConfigForm from './components/SiteConfigForm';
import SSOConfigForm from './components/SSOConfigForm';
import SyncConfigForm from './components/SyncConfigForm';
import { IAdminOptions, IAdminState } from './reducers/AdminState';
import { IRestResponse, restGet, restPut } from './rest';

const UPDATABLE_FIELDS: string[] = [
    'disqus_forum_url',
    'disqus_public_key',
    'disqus_secret_key',
    'disqus_admin_access_token',
    'disqus_sso_button',
    'disqus_sso_enabled',
    'disqus_manual_sync',
    'disqus_sync_token',
];

const mapStateToProps = (state: IAdminState) => {
    return {
        data: state,
    };
};

const mapDispatchToProps = (dispatch: Redux.Dispatch<Redux.Action>) => {
    return {
        onInputChange: (key: string, event: React.SyntheticEvent<HTMLInputElement>) => {
            const isCheckbox: boolean = event.currentTarget.type === 'checkbox';
            let value: string;
            if (isCheckbox)
                value = event.currentTarget.checked ? '1' : null;
            else
                value = event.currentTarget.value;
            dispatch(updateLocalOptionAction(key, value));
        },
        onSubmit: (event: React.SyntheticEvent<HTMLFormElement>) => {
            event.preventDefault();

            const fields = (UPDATABLE_FIELDS as any).reduce((previousValue: any, currentIdKey: string) => {
                if (currentIdKey in event.currentTarget.elements) {
                    const currentField: Element | HTMLCollection = event.currentTarget.elements.namedItem(currentIdKey);
                    const currentInputElement = currentField as HTMLInputElement;
                    return (Object as any).assign({
                        [previousValue[currentInputElement.name]]: currentInputElement.value,
                    }, previousValue);
                }
                return previousValue;
            }, {});

            restPut('settings', fields, (response: IRestResponse<IAdminOptions>) => {
                if (!response)
                    return;

                if (response.code !== 'OK') {
                    dispatch(setMessageAction({ text: response.message, type: 'error' }));
                    return;
                }

                dispatch(updateAdminOptionsAction(response.data));
                dispatch(setMessageAction({ text: __('Changes saved successfully.'), type: 'success' }));
            });
        },
        onToggleState: (key: string) => {
            dispatch(toggleLocalOptionAction(key));
        },
    };
};

export const MainContainer = ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps,
)(Main);

export const InstallContainer = ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps,
)(Install);

export const SiteConfigContainer = ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps,
)(SiteConfigForm);

export const SSOConfigContainer = ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps,
)(SSOConfigForm);

export const SyncConfigContainer = ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps,
)(SyncConfigForm);