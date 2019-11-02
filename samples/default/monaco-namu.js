(()=>{
    let domready = (callback) => {
        if(document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    };

    domready(()=>{
        let target = document.querySelector('div.a');
        require.config({
            paths: {
                'vs': '../../node_modules/monaco-editor/min/vs',
                'namu': '../../namu',
            },
        });
        require.config({
            'vs/nls' : {
                availableLanguages: {
                    '*': 'ko'
                }
            }
        });
        require(['namu/vs/languages/namumark', 'namu/toolbar/quickaccess'], function() {
            window.monaco_namu = monaco.editor.create(target, {
                language: 'namumark',
                automaticLayout: true,
                // renderWhitespace: 'all',
                fontFamily: 'D2Coding, Consolas, "Courier New", monospace',
                value:[
                    '## formatting syntax',
                    '__underline__',
                    '\'\'\'bold\'\'\'',
                    '\'\'italic\'\'',
                    '\'\'\' \'\'italic\'\' \'\'\'',
                    'normal text',
                    '',
                    '## paragraph',
                    '= 문단1 =',
                    '====== 문단6 ======',
                    '======= 문단 (invalid) =======',
                    '',
                    '## blockquote',
                    '> aaaaa',
                    '>> aaaaaa',
                    ' >> ffdsaf',
                    '',
                    '## horizontal line',
                    '----',
                    '',
                    '## link syntax',
                    '[[http://www.google.co.kr]]',
                    '[[파일:asdf.png]]',
                    '[[분류:asdf.png]]',
                    '[[http://www.google.co.kr|출력]]',
                    '[[문서|[[파일:example.png|width=너비&height=높이]]]]',
                    '',
                    '## macro syntax',
                    '[include(틀:-)]',
                    '[youtube(W761DtH1oRg,width=160px,height=90px)]',
                    '',
                    '## table syntax',
                    '|| 테이블 || 테이블 ||',
                    '|| 셀 || 셀 ||',
                    '',
                    '## escape syntax',
                    '{{{\'\'\'escape\'\'\'}}}',
                    '',
                    '## html syntax',
                    '{{{#!html',
                    '<!-- html madness -->',
                    '<div class="custom-class" markdown="1">',
                    '  <div>',
                    '    nested div',
                    '  </div>',
                    '  <script type=\'text/x-koka\'>',
                    '    function( x: int ) { return x*x; }',
                    '  </script>',
                    '  This is a div _with_ underscores',
                    '  and a & <b class="bold">bold</b> element.',
                    '  <style>',
                    '    body { font: "Consolas" }',
                    '  </style>',
                    '</div>',
                    '}}}',
                    '',
                    '## wikibox syntax',
                    '{{{#!wiki style="margin: -5px -10px; padding: 5px 10px; background-image: linear-gradient(135deg, #FFB9B9, #FFD3B6, #FFFDBB, #B4ECB4, #ACE1FF, #F6C3FF)"',
                    '그라데이션 기능입니다',
                    '',
                    '\'\'\'하하하!\'\'\'',
                    '',
                    '무지개색 총공격!}}}',
                    '',
                ].join('\n')
            });
            target.querySelector('textarea').style.display = 'none';
            
            let quickaccess = new namu.toolbar.QuickAccess(window.monaco_namu);
            document.querySelectorAll('[data-editor-job]').forEach((elem) => { elem.addEventListener('click', quickaccess.apply); });
        });
    });
})();