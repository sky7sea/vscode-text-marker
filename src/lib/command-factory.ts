import ColourRegistry from './colour-registry';
import CommandWrapper from './command-wrapper';
import ConfigStore from './config-store';
import ConfigTargetPicker from './config-target-picker';
import Debouncer from './debouncer';
import DecorationOperatorFactory from './decoration-operator-factory';
import DecorationRefresher from './decoration-refresher';
import DecorationRegistry from './decoration-registry';
import HighlightPatternPicker from './highlight-pattern-picker';
import HighlightUsingRegexCommand from './commands/highlight-using-regex';
import MatchingModeRegistry from './matching-mode-registry';
import PatternFactory from './pattern-factory';
import PatternVariationReader from './pattern-variation-reader';
import RegexReader from './regex-reader';
import RemoveAllHighlightsCommand from './commands/remove-all-highlights';
import SaveAllHighlightsCommand from './commands/save-all-highlights';
import SavedHighlightsRestorer from './saved-highlights-restorer';
import TextDecorator from './text-decorator';
import TextEditorFactory from './text-editor-factory';
import TextLocationRegistry from './text-location-registry';
import ToggleCaseSensitivityCommand from './commands/toggle-case-sensitivity';
import ToggleCaseSensitivityModeButton from './statusbar-buttons/toggle-case-sensitivity-mode';
import ToggleCaseSensitivityModeCommand from './commands/toggle-case-sensitivity-mode';
import ToggleHighlightCommand from './commands/toggle-highlight';
import ToggleWholeMatchCommand from './commands/toggle-whole-match';
import ToggleWholeMatchModeButton from './statusbar-buttons/toggle-whole-match-mode';
import ToggleWholeMatchModeCommand from './commands/toggle-whole-match-mode';
import UnhighlightCommand from './commands/unhighlight';
import UpdateHighlightCommand from './commands/update-highlight';
import WindowComponent from './editor-components/window';
import {EventEmitter} from 'events';

const generateUuid = require('uuid/v4');
const BASE_STATUS_BAR_PRIORITY = 100;

export default class CommandFactory {
    private readonly vscode: any;
    private readonly logger: any;
    private eventBus: EventEmitter;
    private decorationOperatorFactory: DecorationOperatorFactory;
    private configStore: ConfigStore;
    private configTargetPicker: ConfigTargetPicker;
    private decorationRegistry: DecorationRegistry;
    private highlightPatternPicker: HighlightPatternPicker;
    private matchingModeRegistry: MatchingModeRegistry;
    private patternFactory: PatternFactory;
    private textEditorFactory: TextEditorFactory;
    private textLocationRegistry: TextLocationRegistry;
    private windowComponent: WindowComponent;

    constructor({vscode, logger}) {
        this.vscode = vscode;
        this.logger = logger;
    }

    createToggleHighlightCommand() {
        const command = new ToggleHighlightCommand(
            this.getDecorationOperatorFactory(),
            this.getPatternFactory(),
            this.getTextEditorFactory(),
            this.getTextLocationRegistry()
        );
        return this._wrapCommand(command);
    }

    createHighlightUsingRegex() {
        const regexReader = new RegexReader({
            patternFactory: this.getPatternFactory(),
            windowComponent: this.getWindowComponent()
        });
        const command = new HighlightUsingRegexCommand(this.getDecorationOperatorFactory(), regexReader);
        return this._wrapCommand(command);
    }

    createUnhighlightCommand() {
        const command = new UnhighlightCommand(this.getDecorationOperatorFactory(), this.getHighlightPatternPicker());
        return this._wrapCommand(command);
    }

    createRemoveAllHighlightsCommand() {
        const command = new RemoveAllHighlightsCommand(this.getDecorationOperatorFactory());
        return this._wrapCommand(command);
    }

    createSaveAllHighlightsCommand() {
        const command = new SaveAllHighlightsCommand(this.getConfigStore(), this.getDecorationRegistry());
        return this._wrapCommand(command);
    }

    createToggleCaseSensitivityCommand() {
        const command = new ToggleCaseSensitivityCommand(this.getDecorationOperatorFactory(), this.getHighlightPatternPicker());
        return this._wrapCommand(command);
    }

    createToggleCaseSensitivityModeCommand() {
        const command = new ToggleCaseSensitivityModeCommand(this.getMatchingModeRegistry());
        return this._wrapCommand(command);
    }

    createToggleWholeMatchCommand() {
        const command = new ToggleWholeMatchCommand(this.getDecorationOperatorFactory(), this.getHighlightPatternPicker());
        return this._wrapCommand(command);
    }

    createToggleWholeMatchModeCommand() {
        const command = new ToggleWholeMatchModeCommand(this.getMatchingModeRegistry());
        return this._wrapCommand(command);
    }

    createUpdateHighlightCommand() {
        const command = new UpdateHighlightCommand(
            this.getDecorationOperatorFactory(),
            this.getDecorationRegistry(),
            new PatternVariationReader({
                windowComponent: this.getWindowComponent()
            }),
            this.getTextEditorFactory(),
            this.getTextLocationRegistry()
        );
        return this._wrapCommand(command);
    }

    private _wrapCommand(command) {
        return new CommandWrapper({
            command,
            logger: this.logger
        });
    }

    createDecorationRefresher() {
        return new DecorationRefresher(
            this.getDecorationOperatorFactory(),
            new Debouncer(this.getConfigStore()),
            this.getTextEditorFactory(),
            this.getWindowComponent(),
            this.logger
        );
    }

    createSavedHighlightsRestorer() {
        return new SavedHighlightsRestorer({
            configStore: this.getConfigStore(),
            decorationOperatorFactory: this.getDecorationOperatorFactory(),
            eventBus: this.getEventBus(),
            patternFactory: this.getPatternFactory()
        });
    }

    createToggleCaseSensitivityModeButton() {
        const alignment = this.vscode.StatusBarAlignment.Right;
        const priority = BASE_STATUS_BAR_PRIORITY + 1;
        return new ToggleCaseSensitivityModeButton(this.getEventBus(), this.vscode.window.createStatusBarItem(alignment, priority));
    }

    createToggleWholeMatchModeButton() {
        const alignment = this.vscode.StatusBarAlignment.Right;
        const priority = BASE_STATUS_BAR_PRIORITY;
        return new ToggleWholeMatchModeButton(this.getEventBus(), this.vscode.window.createStatusBarItem(alignment, priority));
    }

    getEventBus() {
        this.eventBus = this.eventBus || new EventEmitter();
        return this.eventBus;
    }

    private getDecorationOperatorFactory() {
        this.decorationOperatorFactory = this.decorationOperatorFactory || this.createDecorationOperatorFactory();
        return this.decorationOperatorFactory;
    }

    private getConfigStore() {
        this.configStore = this.configStore || this.createConfigStore();
        return this.configStore;
    }

    private createConfigStore() {
        return new ConfigStore(this.vscode.workspace, this.getConfigTargetPicker());
    }

    private getConfigTargetPicker() {
        this.configTargetPicker = this.configTargetPicker || this.createConfigTargetPicker();
        return this.configTargetPicker;
    }

    private createConfigTargetPicker() {
        return new ConfigTargetPicker(this.getWindowComponent());
    }

    private getDecorationRegistry() {
        this.decorationRegistry = this.decorationRegistry || this.createDecorationRegistry();
        return this.decorationRegistry;
    }

    private createDecorationOperatorFactory() {
        return new DecorationOperatorFactory(
            this.getDecorationRegistry(),
            new TextDecorator({
                textLocationRegistry: this.getTextLocationRegistry()
            }),
            this.getWindowComponent()
        );
    }

    private createDecorationRegistry() {
        const configStore = this.getConfigStore();
        const colourRegistry = new ColourRegistry(configStore);
        return new DecorationRegistry({
            colourRegistry,
            configStore,
            generateUuid,
            window: this.vscode.window
        });
    }

    private getHighlightPatternPicker() {
        this.highlightPatternPicker = this.highlightPatternPicker || this.createHighlightPatternPicker();
        return this.highlightPatternPicker;
    }

    private createHighlightPatternPicker() {
        return new HighlightPatternPicker({
            decorationRegistry: this.getDecorationRegistry(),
            windowComponent: this.getWindowComponent()
        });
    }

    private getMatchingModeRegistry() {
        this.matchingModeRegistry = this.matchingModeRegistry || this.createMatchingModeRegistry();
        return this.matchingModeRegistry;
    }

    private createMatchingModeRegistry() {
        const configStore = this.getConfigStore();
        return new MatchingModeRegistry({
            eventBus: this.getEventBus(),
            ignoreCase: configStore.get('enableIgnoreCase'),
            wholeMatch: configStore.get('enableWholeMatch')
        });
    }

    private getPatternFactory() {
        this.patternFactory = this.patternFactory || new PatternFactory({matchingModeRegistry: this.getMatchingModeRegistry()});
        return this.patternFactory;
    }

    private getTextEditorFactory() {
        this.textEditorFactory = this.textEditorFactory || this.createTextEditorFactory();
        return this.textEditorFactory;
    }

    private createTextEditorFactory() {
        return new TextEditorFactory({
            VsRange: this.vscode.Range
        });
    }

    private getTextLocationRegistry() {
        this.textLocationRegistry = this.textLocationRegistry || new TextLocationRegistry();
        return this.textLocationRegistry;
    }

    private getWindowComponent() {
        this.windowComponent = this.windowComponent || this.createWindowComponent();
        return this.windowComponent;
    }

    private createWindowComponent() {
        return new WindowComponent(this.vscode.window, this.getTextEditorFactory());
    }

}
