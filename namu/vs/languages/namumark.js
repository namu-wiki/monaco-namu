/*
 * NamuMark Language Definition for monaco-editor
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
export default function(monaco) {
    monaco.languages.register({
        id: 'namumark',
        aliases: [
            'namumark',
            'Namumark',
            'NamuMark'
        ]
    });
    monaco.languages.setLanguageConfiguration('namumark', {
        comments: {
            lineComment: '##'
        },
        brackets: [
            ['{', '}'],
            // ['[[', ']]'],
            ['[', ']'],
            ['(', ')'],
        ],
        surroundingPairs: [
            ['{', '}'],
            ['[', ']'],
            ['(', ')'],
            ['\'', '\''],
            ['~', '~'],
            ['-', '-'],
            ['_', '_'],
            ['^', '^'],
            [',', ','],
        ],
        autoClosingPairs: [
            {open: '{', close: '}'},
            {open: '[', close: ']'},
            {open: '(', close: ')'},
            {open: '\'\'\'', close: '\'\'\''},
            {open: '~~', close: '~~'},
            {open: '--', close: '--'},
            {open: '__', close: '__'},
            {open: '^^', close: '^^'},
            {open: ',,', close: ',,'},
        ],
        wordPattern: /(-?\d.\d\w)|([^`~!@#%^&*()-=+\[{\]}\|;:'",.<>/?\s]+)/g,
    });
    monaco.languages.registerLinkProvider('namumark', {
        provideLinks:function(TextModel, _) {
            let ResolvedLinks = [];
            let LineIndex, LineCount;

            LineCount = TextModel.getLineCount();
            for(LineIndex = 1;LineIndex <= LineCount;LineIndex++) {
                let LineContent = TextModel.getLineContent(LineIndex);
                let URIRegExp = /(\w+)\:\/\/(?:www\.)?([^\s\|\]\'\"]+)/g;
                /* URI */ {
                    let LineURI;
                    while(null != (LineURI = URIRegExp.exec(LineContent))) {
                        ResolvedLinks.push({
                            range: new monaco.Range(LineIndex,LineURI.index+1,LineIndex,LineURI.index+1+LineURI[0].length),
                            tooltip: LineURI[2],
                            url: LineURI[0]
                        });
                    }
                }
                /* wiki link */ {
                    let LineWikiRegExp = /(\[\[)([^\]\|]+)/g;
                    let LineWiki;
                    while(null != (LineWiki = LineWikiRegExp.exec(LineContent))) {
                        if(URIRegExp.test(LineWiki[2])) continue;
                        ResolvedLinks.push({
                            range: new monaco.Range(LineIndex,LineWiki.index+1+LineWiki[1].length,LineIndex,LineWiki.index+1+LineWiki[0].length),
                            tooltip: LineWiki[2],
                            url: new URL(`/w/${encodeURIComponent(LineWiki[2])}`, window.location.href).href
                        });
                    }
                }
            }
            return {
                links: ResolvedLinks,
                dispose:()=>{ }
            };
        }
    });
    monaco.languages.setMonarchTokensProvider('namumark', {
        defaultToken: '',
        tokenPostfix: '.namumark',
    
        tokenizer: {
            root: [
                /* 문단 */
                [/^(={1,6})(#?)(\s.+\s)(#?)(\1)(\s*)$/, 'keyword'],

                /* 주석 */
                [/##.*/, 'comment'],

                /* 인용문 */
                [/^\s*>+/, 'comment'],

                /* 수평줄 */
                [/^\s*-{4,9}\s*$/, 'meta.separator'],

                /* 링크 */
                [/(\[{2})(.*?)(\|?)/, {
                    cases: {
                        '$3==|': [{token: 'keyword', bracket: '@open'}, 'string.link', {token: 'keyword', next: '@link'}],
                        '@default': [{token: 'keyword', bracket: '@open'}, 'string.link', 'keyword'],
                    }
                }],
                [/\]{2}/, {token: 'keyword', bracket: '@close'}],

                /* code */
                [/(\{{3})(\#\!)(\w+)/, {
                    cases: {
                        '$3==syntax': ['keyword', 'delimiter', {token: 'attribute.value', next: '@codeSyntax.$3', bracket: '@open'}],
                        '$3==html': ['keyword', 'delimiter', {token: 'attribute.value', next: '@codeWithType.$3', nextEmbedded: 'html', bracket: '@open'}],
                        '$3==wiki': ['keyword', 'delimiter', {token: 'attribute.value', next: '@codeWiki.$3', bracket: '@open'}],
                        '$3==folding': ['keyword', 'delimiter', {token: 'attribute.value', next: '@codeWiki.$3', bracket: '@open'}],
                        '@default': ['keyword', 'white', {token: 'white', switchTo: '@code', bracket: '@open'}],
                    }
                }],
                [/(\{{3})(\+|\-)([0-9]+)/, ['keyword', 'delimiter', {token: 'attribute.value', next: '@codeWiki.$3', bracket: '@open'}]],
                [/\{{3}/, {token: 'keyword', next: '@code', bracket: '@open'}],
                [/\}{3}/, {token: 'keyword', bracket: '@close'}],

                /* 기타 텍스트 속성 */
                [/(\'{3}).*?\'{3}/, 'strong'],
                [/(\'{2}).*?\'{2}/, 'emphasis']
            ],
            link: [
                [/\]{2}/, {token: '@rematch', next: '@pop'}],
            ],
            code: [
                [/\{{3}/, {token: 'white', next: '@codeInDepth', bracket: '@open'}],
                [/\}{3}/, {token: '@rematch', next: '@pop', bracket: '@close'}],
            ],
            codeInDepth: [
                [/\{{3}/, {token: 'white', next: '@codeInDepth', bracket: '@open'}],
                [/\}{3}/, {token: 'white', next: '@pop', bracket: '@close'}],
            ],
            codeSyntax: [
                [/\s+(\w+)/, {
                    cases: {
                        '@default': {token: 'attribute.value', next: '@codeWithType.$1', nextEmbedded: '$1'}
                    }
                }],
                [/\}{3}/, {token: '@rematch', next: '@pop'}],
            ],
            codeWiki: [
                [/\}{3}/, {token: '@rematch', next: '@pop'}],
                {include: '@root'}
            ],
            codeWithType: [
                [/\}{3}/, {token: '@rematch', next: '@pop', nextEmbedded: '@pop'}],
            ]
        }
    });
}
