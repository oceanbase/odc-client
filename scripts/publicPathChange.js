const cherio = require('cherio');
const path = require('path');
const fs = require('fs');


const branchName = process.env.ACI_COMMIT_REF_NAME;


let publicPath = process.argv[2];

let sourceHtmlPath = process.argv[3];
let targetHtmlPath = process.argv[4] || sourceHtmlPath;
if (branchName) {
    console.log('[Begin]Rewrite public path')
    const distHtmlPath = sourceHtmlPath || path.resolve(process.cwd(), 'dist/renderer/index.html');
    const $ = cherio.load(fs.readFileSync(distHtmlPath));
    $('html').prepend(`<script>window.publicPath="${publicPath}"</script>`);
    ['script', 'img'].forEach(type => {
        $(type).map(function () {
            const dom = $(this);
            if (dom) {
                let href = dom.attr('src');
                if (!href) {
                    return;
                }
                if (href.startsWith('/')) {
                    href = '.' + href;
                }
                const newHref = new URL(href, publicPath)
                dom.attr('src', newHref)
            }
        })
    });
    
    ['link', 'a'].forEach(type => {
        $(type)?.map(function () {
            const dom = $(this);
            if (dom) {
                let href = dom.attr('href');
                if (!href) {
                    return;
                }
                if (href.startsWith('/')) {
                    href = '.' + href;
                }
                const newHref = new URL(href, publicPath)
                dom.attr('href', newHref)
            }
        });
    });
    const result = $.html();
    fs.writeFileSync(
        targetHtmlPath,
        result
    )
    console.log('[Done]Rewrite public path')
}
