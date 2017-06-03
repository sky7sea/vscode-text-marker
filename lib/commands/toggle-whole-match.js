
const PatternAction = require('../const').PatternAction;

class ToggleWholeMatchCommand {

    constructor(params) {
        this._vsWindow = params.vsWindow;
        this._logger = params.logger;
        this._decorationOperatorFactory = params.decorationOperatorFactory;
        this._highlightPatternPicker = params.highlightPatternPicker;
    }

    execute() {
        return Promise.resolve()
            .then(() => this._highlightPatternPicker.pick('Select a pattern to toggle partial/whole match'))
            .then(decorationId => {
                if (!decorationId) return;

                const visibleEditors = this._vsWindow.visibleTextEditors;
                const decorationOperator = this._decorationOperatorFactory.create(visibleEditors);
                decorationOperator.updateDecoration(decorationId, PatternAction.TOGGLE_WHOLE_MATCH);
            })
            .catch(e => this._handleError(e));
    }

    _handleError(e) {
        this._logger.error(e.stack);
    }

}

module.exports = ToggleWholeMatchCommand;