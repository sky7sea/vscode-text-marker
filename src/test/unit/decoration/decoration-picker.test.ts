import {any, mock, mockType, verify, when} from '../../helpers/mock';

import DecorationPicker from '../../../lib/decoration/decoration-picker';
import PatternFactory from '../../../lib/pattern/pattern-factory';
import MatchingModeRegistry from '../../../lib/matching-mode-registry';
import DecorationRegistry from '../../../lib/decoration/decoration-registry';
import WindowComponent from '../../../lib/vscode/window';
import * as assert from 'assert';

suite('DecorationPicker', () => {

    const matchingModeRegistry = mockType<MatchingModeRegistry>({});
    const patternFactory = new PatternFactory(matchingModeRegistry);

    test('it lets user to pick a highlight pattern', async () => {
        const windowComponent = mock(WindowComponent);
        when(windowComponent.showQuickPick(
            [
                {label: 'TEXT_1', detail: 'String', id: 'DECORATION_ID_1'},
                {label: '/TEXT_2/i', detail: 'RegExp', id: 'DECORATION_ID_2'}
            ],
            {placeHolder: 'PLACEHOLDER_MESSAGE'}
        )).thenResolve({
            label: 'TEXT_1', detail: 'String', id: 'DECORATION_ID_1'
        });
        const decorationRegistry = mock(DecorationRegistry);
        when(decorationRegistry.retrieveAll()).thenReturn(
            [
                {
                    id: 'DECORATION_ID_1',
                    decorationType: 'DECORATION_TYPE_1',
                    pattern: patternFactory.create({phrase: 'TEXT_1', ignoreCase: true})
                },
                {
                    id: 'DECORATION_ID_2',
                    decorationType: 'DECORATION_TYPE_2',
                    pattern: patternFactory.create({phrase: 'TEXT_2', type: 'RegExp', ignoreCase: true})
                }
            ]
        );
        const picker = new DecorationPicker(decorationRegistry, windowComponent);
        const decorationId = await picker.pick('PLACEHOLDER_MESSAGE');

        assert.deepEqual(decorationId, 'DECORATION_ID_1');
    });

    test('it shows "[Aa]" symbol if a pattern is case sensitive', async () => {
        const windowComponent = mock(WindowComponent);
        const decorationRegistry = mock(DecorationRegistry);
        when(decorationRegistry.retrieveAll()).thenReturn(
            [
                {
                    id: 'DECORATION_ID_1',
                    decorationType: 'DECORATION_TYPE_1',
                    pattern: patternFactory.create({phrase: 'TEXT_1'})
                },
                {
                    id: 'DECORATION_ID_2',
                    decorationType: 'DECORATION_TYPE_2',
                    pattern: patternFactory.create({phrase: 'TEXT_2', type: 'RegExp'})
                }
            ]
        );
        const picker = new DecorationPicker(decorationRegistry, windowComponent);
        await picker.pick('PLACE_HOLDER_TEXT');

        verify(windowComponent.showQuickPick(
            [
                {label: 'TEXT_1', detail: 'String [Aa]', id: 'DECORATION_ID_1'},
                {label: '/TEXT_2/', detail: 'RegExp [Aa]', id: 'DECORATION_ID_2'}
            ],
            {placeHolder: 'PLACE_HOLDER_TEXT'}
        ));
    });

    test('it shows /i flag on regex if a pattern is case insensitive', async () => {
        const windowComponent = mock(WindowComponent);
        const decorationRegistry = mock(DecorationRegistry);
        when(decorationRegistry.retrieveAll()).thenReturn(
            [
                {
                    id: 'DECORATION_ID',
                    decorationType: 'DECORATION_TYPE',
                    pattern: patternFactory.create({phrase: 'TEXT', type: 'RegExp', ignoreCase: true})
                }
            ]
        );
        const picker = new DecorationPicker(decorationRegistry, windowComponent);

        await picker.pick('PLACE_HOLDER_TEXT');

        verify(windowComponent.showQuickPick(
            [{label: '/TEXT/i', detail: 'RegExp', id: 'DECORATION_ID'}],
            {placeHolder: 'PLACE_HOLDER_TEXT'}
        ));
    });

    test('it shows "[Aal]" symbol if a pattern is case sensitive', async () => {
        const windowComponent = mock(WindowComponent);
        const decorationRegistry = mock(DecorationRegistry);
        when(decorationRegistry.retrieveAll()).thenReturn(
            [
                {
                    id: 'DECORATION_ID',
                    decorationType: 'DECORATION_TYPE',
                    pattern: patternFactory.create({phrase: 'TEXT', wholeMatch: true})
                }
            ]
        );
        const picker = new DecorationPicker(decorationRegistry, windowComponent);
        await picker.pick('PLACE_HOLDER_TEXT');

        verify(windowComponent.showQuickPick(
            [{label: 'TEXT', detail: 'String [Aa] [Ab|]', id: 'DECORATION_ID'}],
            {placeHolder: 'PLACE_HOLDER_TEXT'}
        ));
    });

    test('it returns null if nothing selected', async () => {
        const windowComponent = mock(WindowComponent);
        when(windowComponent.showQuickPick(any(), any())).thenResolve();
        const decorationRegistry = mock(DecorationRegistry);
        when(decorationRegistry.retrieveAll()).thenReturn(
            [
                {id: 'DECORATION_ID_1', pattern: patternFactory.create({phrase: 'TEXT_1'}), decorationType: 'DECORATION_TYPE_1'}
            ]
        );
        const picker = new DecorationPicker(decorationRegistry, windowComponent);
        const decorationId = await picker.pick('PLACE_HOLDER_TEXT');

        assert.equal(decorationId, null);
    });

    test('it shows a message instead of picker if no patterns are registered yet', async () => {
        const windowComponent = mock(WindowComponent);
        const decorationRegistry = mock(DecorationRegistry);
        when(decorationRegistry.retrieveAll()).thenReturn([]);
        const picker = new DecorationPicker(decorationRegistry, windowComponent);
        const decorationId = await picker.pick('PLACE_HOLDER_TEXT');

        assert.equal(decorationId, undefined);
        verify(windowComponent.showQuickPick(any(), any()), {times: 0});
        verify(windowComponent.showInformationMessage('No highlight is registered yet'));
    });

});