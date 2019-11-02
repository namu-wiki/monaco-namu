/*
 * QuickAccess for monaco/namumark
 * Copyright (C) 2019 umanle S.R.L.
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
define(['vs/editor/editor.main'], () => {
    window.namu = window.namu || {};
    window.namu.toolbar = window.namu.toolbar || {};
    window.namu.toolbar.QuickAccess = function(TargetEditor) {
        /* Private Properties */
        let QuickAccess = this;
        /* Private Methods */
        let execute = function(describer) {
            let TextModel = TargetEditor.getModel();
            let selections = TargetEditor.getSelections();
            let operations = [];
            let selections_new = [];
            TargetEditor.focus();

            /* if type is not provided */
            if(!describer.type) {
                if(describer.bracket) describer.type = 'bracket';
            }
            switch(describer.type) {
                case 'bracket':
                    /* if bracket is declared as shorthand */
                    if(typeof describer.bracket === 'string') {
                        describer.bracket = {
                            'open': describer.bracket,
                            'close': describer.bracket
                        };
                    }
                    for(let selection of selections) {
                        selections_new.push(new monaco.Selection(selection.selectionStartLineNumber, selection.selectionStartColumn + describer.bracket.open.length, selection.endLineNumber, selection.endColumn + describer.bracket.open.length));
                        operations.push({
                            range: selection,
                            text: describer.bracket.open + TextModel.getValueInRange(selection) + describer.bracket.close
                        });
                    }
                    break;
                default:
                    throw new Error(`Unknown describer type '${describer.type}'`);
            }
            TargetEditor.executeEdits('quickaccess', operations);
            TargetEditor.setSelections(selections_new);
        }
        /* Public Methods */
        QuickAccess.apply = function(event) {
            event.preventDefault();
            if(!arguments[0]) throw new TypeError(`Failed to execute 'namu.QuickAccess::apply': at least 1 argument required, but only 0 present.`);
            if(arguments[0] instanceof Event) {
                if(!(event instanceof Event) || !event.target) throw new Error('Invalid event fired');
                let describer = JSON.parse(event.target.getAttribute('data-editor-job'));
                if(!describer) throw new Error('Event fired but no describer');
                execute(describer);
            } else if(typeof arguments[0] === 'object') {
                execute(arguments[0]);
            }
        };

        /* Constructor */
        if(!TargetEditor) throw new Error('Invalid target element');
    }
});
