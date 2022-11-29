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
            ['{{{', '}}}'],
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
                let LineWikiRegExp = /(\[\[)((?:\\.|[^\]\|])+)|(\[(include|youtube|nicovideo|kakaotv)\()((?:\\.|[^,])+?)(?:,.*?)?\)\]/g;
                let URIRegExp = /(\w+)\:\/\/(?:www\.)?([^\s\|\]\'\"]+)/;
                let LineWiki;
                while(null != (LineWiki = LineWikiRegExp.exec(LineContent))) {
                    let range, tooltip, url;
                    let LineURI;
                    let VideoURIFormatter = (ServiceId, VideoId) => {
                        switch(ServiceId) {
                            case 'youtube':
                                return `https://www.youtube.com/watch?v=${VideoId}`;
                                break;
                            case 'kakaotv':
                                return `https://tv.kakao.com/v/${VideoId}`;
                                break;
                            case 'nicovideo':
                                return `https://www.nicovideo.jp/watch/${VideoId}`;
                                break;
                            default:
                                console.warn(`VideoURIFormatter: Undefined ServiceId "${ServiceId}"`);
                                return;
                        }
                    };

                    switch(LineWiki[4]) {
                        case 'youtube':
                        case 'kakaotv':
                        case 'nicovideo':
                            LineWiki[0] = LineWiki[3] + LineWiki[5];
                            range = new monaco.Range(
                                LineIndex,
                                LineWiki.index+1+LineWiki[3].length,
                                LineIndex,
                                LineWiki.index+1+LineWiki[0].length
                            );
                            tooltip = `${LineWiki[4]}:${LineWiki[5]}`;
                            url = VideoURIFormatter(LineWiki[4], LineWiki[5]);
                            break;
                        case 'include':
                            /* 재정렬 */
                            LineWiki[0] = LineWiki[3] + LineWiki[5];
                            LineWiki[1] = LineWiki[1] || LineWiki[3];
                            LineWiki[2] = LineWiki[2] || LineWiki[5];
                            LineWiki[3] = LineWiki[4] || null;
                            LineWiki[4] = LineWiki[5] = null;
                        default:
                            if(LineURI = URIRegExp.exec(LineWiki[2])) {
                                range = new monaco.Range(
                                    LineIndex,
                                    LineWiki.index+1+LineWiki[1].length,
                                    LineIndex,
                                    LineWiki.index+1+LineWiki[0].length
                                );
                                tooltip = LineURI[2];
                                url = LineURI[0];
                            }
                            else {
                                if(LineWiki[2].length>1 && LineWiki[2].match(/^:(파일|분류):/)) {
                                    let WikiName = LineWiki[2].substr(1);
                                    range = new monaco.Range(
                                        LineIndex,
                                        LineWiki.index+1+LineWiki[1].length+1,
                                        LineIndex,
                                        LineWiki.index+1+LineWiki[0].length
                                    );
                                    tooltip = WikiName;
                                    url = window.location.protocol + '//' + window.location.host + '/w/' + encodeURIComponent(WikiName);
                                }
                                else {
                                    let WikiName = LineWiki[2].replace(/\\(.)/, '$1');
                                    range = new monaco.Range(
                                        LineIndex,
                                        LineWiki.index+1+LineWiki[1].length,
                                        LineIndex,
                                        LineWiki.index+1+LineWiki[0].length
                                    );
                                    tooltip = WikiName;
                                    url = window.location.protocol + '//' + window.location.host + '/w/' + encodeURIComponent(WikiName);
                                }
                            }
                    }

                    ResolvedLinks.push({
                        range: range,
                        tooltip: tooltip,
                        url: url
                    });
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
        escapes: /\\./,
        tokenizer: {
            root: [
                /* escapes */
                [/@escapes/, 'string.escape'],

                /* 문단 */
                [/^(={1,6})(#?)(\s.+\s)(#?)(\1)(\s*)$/, 'keyword'],

                /* 주석 */
                [/##.*/, 'comment'],

                /* 인용문 */
                [/^\s*>+/, 'comment'],

                /* 수평줄 */
                [/^\s*-{4,9}\s*$/, 'meta.separator'],

                /* 링크 */
                [/\[{2}/, {token: 'delimiter', bracket: '@open', next: '@link'}],
                [/\]{2}/, {token: 'delimiter', bracket: '@close'}],

                /* 각주 */
                [/(\[)(\*)/, ['delimiter', {token: 'comment', bracket: '@open', next: '@reference'}]],

                /* 매크로 */
                [/\[/, {token: 'delimiter', bracket: '@open', next: '@macro'}],
                [/\]/, {token: 'delimiter', bracket: '@close'}],

                /* code */
                [/(\{{3})(\#\!)(\w+)/, {
                    cases: {
                        '$3==syntax': ['keyword', 'delimiter', {token: 'attribute.value', next: '@codeSyntax.$3', bracket: '@open'}],
                        '$3==html': ['keyword', 'delimiter', {token: 'attribute.value', next: '@codeWithType.$3', nextEmbedded: 'html', bracket: '@open'}],
                        '$3==latex': ['keyword', 'delimiter', {token: 'attribute.value', next: '@codeWithType.$3', nextEmbedded: 'latex', bracket: '@open'}],
                        '$3==wiki': ['keyword', 'delimiter', {token: 'attribute.value', next: '@codeWikiAttributes', bracket: '@open'}],
                        '$3==folding': ['keyword', 'delimiter', {token: 'attribute.value', next: '@codeWikiAttributes', bracket: '@open'}],
                        '@default': ['keyword', 'white', {token: 'white', next: '@code', bracket: '@open'}],
                    }
                }],
                [/(\{{3})(\+|\-)([0-9]+)/, ['keyword', 'delimiter', {token: 'attribute.value', next: '@codeWiki', bracket: '@open'}]],
                [/(\{{3})(#)(aliceblue|antiquewhite|aqua|aquamarine|azure|beige|bisque|black|blanchedalmond|blue|blueviolet|brown|burlywood|cadetblue|chartreuse|chocolate|coral|cornflowerblue|cornsilk|crimson|cyan|darkblue|darkcyan|darkgoldenrod|darkgray|darkgreen|darkgrey|darkkhaki|darkmagenta|darkolivegreen|darkorange|darkorchid|darkred|darksalmon|darkseagreen|darkslateblue|darkslategray|darkslategrey|darkturquoise|darkviolet|deeppink|deepskyblue|dimgray|dimgrey|dodgerblue|firebrick|floralwhite|forestgreen|fuchsia|gainsboro|ghostwhite|gold|goldenrod|gray|green|greenyellow|grey|honeydew|hotpink|indianred|indigo|ivory|khaki|lavender|lavenderblush|lawngreen|lemonchiffon|lightblue|lightcoral|lightcyan|lightgoldenrodyellow|lightgray|lightgreen|lightgrey|lightpink|lightsalmon|lightseagreen|lightskyblue|lightslategray|lightslategrey|lightsteelblue|lightyellow|lime|limegreen|linen|magenta|maroon|mediumaquamarine|mediumblue|mediumorchid|mediumpurple|mediumseagreen|mediumslateblue|mediumspringgreen|mediumturquoise|mediumvioletred|midnightblue|mintcream|mistyrose|moccasin|navajowhite|navy|oldlace|olive|olivedrab|orange|orangered|orchid|palegoldenrod|palegreen|paleturquoise|palevioletred|papayawhip|peachpuff|peru|pink|plum|powderblue|purple|rebeccapurple|red|rosybrown|royalblue|saddlebrown|salmon|sandybrown|seagreen|seashell|sienna|silver|skyblue|slateblue|slategray|slategrey|snow|springgreen|steelblue|tan|teal|thistle|tomato|turquoise|violet|wheat|white|whitesmoke|yellow|yellowgreen|[0-9a-f]{3}|[0-9a-f]{6})(\s)/, ['keyword', 'attribute.value', {token: 'attribute.value', next: '@codeWiki.$3', bracket: '@open'}, 'white']],
                [/\{{3}/, {token: 'keyword', next: '@code', bracket: '@open'}],
                [/\}{3}/, {token: 'keyword', bracket: '@close'}],

                /* 기타 텍스트 속성 */
                [/\'{3}/, {
                    cases: {
                        '$S2==strong': {token: 'strong', next: '@pop', bracket: '@close'},
                        '@default': {token: 'strong', next: '@root.strong', bracket: '@open'},
                    }
                }],
                [/\'{2}/, {
                    cases: {
                        '$S2==emphasis': {token: 'emphasis', next: '@pop', bracket: '@close'},
                        '@default': {token: 'emphasis', next: '@root.emphasis', bracket: '@open'},
                    }
                }],
                [/.$/, {
                    cases: {
                        '$S2==strong': {token: '$S2', next: '@pop', bracket: '@close'},
                        '$S2==emphasis': {token: '$S2', next: '@pop', bracket: '@close'},
                        '@default': {token: 'white'},
                    }
                }],
                [/./, {token:'$S2'}],
            ],
            reference: [
                [/\s+/, {token: 'white', next: '@referenceContent'}],
                [/\]/, {token: 'delimiter', next: '@pop', bracket: '@close'}],
                [/./, 'attribute.value'],
            ],
            referenceContent: [
                [/\]/, {token: '@rematch', next: '@pop', bracket: '@close'}],
                {include: '@root'}
            ],
            macro: [
                [/@escapes/, 'string.escape'],
                [/\]/, {token: 'delimiter', next: '@pop', bracket: '@close'}],
                [/\(/, {token: 'delimiter', next: '@macroArguments', bracket: '@open'}],
                [/\)/, {token: 'delimiter', bracket: '@close'}],
                [/math/, {token: 'tag', next: '@macroArgumentWithType.latex'}],
                [/date|br|include|목차|tableofcontents|각주|footnote|pagecount|age|dday|ruby|anchor|math|youtube|kakaotv|nicovideo/i, 'tag'],
                [/./, 'invalid'],
            ],
            macroArgumentWithType: [
                [/\(/, {token: 'delimiter', next: '@macroEmbedded', nextEmbedded: '$S2', bracket: '@open'}],
                [/\)\]/, {token: '@rematch', next: '@pop', bracket: '@close'}],
            ],
            macroEmbedded: [
                [/\)\]/, {token: '@rematch', next: '@pop', nextEmbedded: '@pop', bracket: '@close'}],
            ],
            macroArguments: [
                [/@escapes/, 'string.escape'],
                [/\)\]/, {token: '@rematch', next: '@pop', bracket: '@close'}],
                [/=/, {token: 'delimiter', next: '@macroArgumentsItem'}],
                [/,/, {token: 'delimiter'}],
                [/./, 'attribute.name'],
            ],
            macroArgumentsItem: [
                [/@escapes/, 'string.escape'],
                [/\)/, {token: '@rematch', next: '@pop'}],
                [/,/, {token: 'delimiter', next: '@pop'}],
                [/./, 'attribute.value'],
            ],
            link: [
                [/@escapes/, 'string.escape'],
                [/\]{2}/, {token: '@rematch', next: '@pop', bracket: '@close'}],
                [/\|/, {token: 'delimiter', next: '@linkText'}],
                [/[^\\\|\]]+/, 'string.link'],
            ],
            linkText: [
                [/\[{2}/, {token: 'delimiter', bracket: '@open', next: '@link'}],
                [/\]{2}/, {token: '@rematch', next: '@pop', bracket: '@close'}],
                {include: '@root'}
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
            codeWikiAttributes: [
                [/\}{3}/, {token: '@rematch', next: '@pop'}],
                [/(\w+)(\=)(\")([^\"]*?|@escapes)(\")(\s*)$/, ['attribute.name', 'white', 'white', 'attribute.value', {token: 'white', next: '@codeWiki'}, 'white']],
                [/(\w+)(\=)(\')([^\']*?|@escapes)(\')(\s*)$/, ['attribute.name', 'white', 'white', 'attribute.value', {token: 'white', next: '@codeWiki'}, 'white']],
                [/(\w+)(\=)(\")([^\"]*?|@escapes)(\")/, ['attribute.name', 'white', 'white', 'attribute.value', 'white']],
                [/(\w+)(\=)(\')([^\']*?|@escapes)(\')/, ['attribute.name', 'white', 'white', 'attribute.value', 'white']],
                [/.$/, {token: 'invalid', next: '@codeWiki'}],
                [/./, 'invalid'],
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
