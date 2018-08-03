import {PatternAction} from '../const';
import HighlightPatternPicker from '../highlight-pattern-picker';
import DecorationOperatorFactory from '../decoration-operator-factory';
import {CommandLike} from '../editor-components/vscode';

export default class ToggleWholeMatchCommand implements CommandLike {
    private readonly decorationOperatorFactory: DecorationOperatorFactory;
    private readonly highlightPatternPicker: HighlightPatternPicker;

    constructor(decorationOperatorFactory: DecorationOperatorFactory, highlightPatternPicker: HighlightPatternPicker) {
        this.decorationOperatorFactory = decorationOperatorFactory;
        this.highlightPatternPicker = highlightPatternPicker;
    }

    async execute() {
        const decorationId = await this.highlightPatternPicker.pick('Select a pattern to toggle partial/whole match');
        if (!decorationId) return;

        const decorationOperator = this.decorationOperatorFactory.createForVisibleEditors();
        decorationOperator.updateDecorationWithPatternAction(decorationId, PatternAction.TOGGLE_WHOLE_MATCH);
    }

}
