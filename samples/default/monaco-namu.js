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
        require(['vs/editor/editor.main', 'namu/toolbar/quickaccess'], async () => {
            const {default: namumark_register} = await import('../../namu/vs/languages/namumark.js');
            namumark_register();
            window.monaco_namu = monaco.editor.create(target, {
                language: 'namumark',
                automaticLayout: true,
                wordWrap: true,
                renderWhitespace: 'all',
                fontFamily: 'D2Coding, Consolas, "나눔고딕코딩", "Courier New", monospace',
                value:[
                    '{{{{{{{{{코드}}}}}}}}}',
                    '\'\'\'굵게\'\'\'',
                    '{{{#!wiki',
                    '\'\'\'굵게\'\'\'',
                    '\'\'기울임\'\'',
                    '}}}',
                    '\'\'기울임\'\'',
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
                    '\'\'\'굵게\'\'\'',
                ].join('\n')
            });
            target.querySelector('textarea').style.display = 'none';
            
            let quickaccess = new namu.toolbar.QuickAccess(window.monaco_namu);
            document.querySelectorAll('[data-editor-job]').forEach((elem) => { elem.addEventListener('click', quickaccess.apply); });
        });
    });
})();