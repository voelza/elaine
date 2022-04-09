const fs = require('fs');
const jsdom = require("jsdom");


const files = process.argv.slice(2);
const start = "export default";

if (!files || files.length === 0) {
    throw "Please pass file-paths as arguments.";
}


function styleMap(style) {
    const m = new Map();

    let start = 0;
    let end = style.indexOf("}");
    const a = ".c";
    let counter = { c: 0 };
    while (end !== -1) {
        let next = style.substring(start, end);
        fillMap(next, m, a, counter);
        start = end;
        end = style.indexOf("}", end + 1);
    }
    return m;
}

function fillMap(style, m, clazz, counter) {
    const regex = new RegExp(/([\.#][_A-Za-z0-9\-]+)[^}]*{/g);
    let match = regex.exec(style);
    while (match !== null) {
        m.set(match[1], clazz + counter.c++);
        match = regex.exec(style);
    }
}

for (const filePath of files) {
    console.log(`Starting elaine single-file-component generation.`);
    const file = fs.readFileSync(filePath, { encoding: 'utf8' });
    const dom = new jsdom.JSDOM(`<!DOCTYPE html><body>${file}</body>`);

    let style = dom.window.document.querySelector("body > style").textContent.replace(/\r?\n|\r/g, "").replace(/\s\s+/g, '');
    let template = dom.window.document.querySelector("body > template").innerHTML.replace(/\r?\n|\r/g, "").replace(/\s\s+/g, '');

    // style class shortening
    const sMap = new Map([...styleMap(style).entries()].sort((a, b) => {
        return b[0].length - a[0].length;
    }));
    sMap.forEach((v, k) => {
        style = style.replace(new RegExp(`(${k})`, "g"), `${v}`);
    });
    console.log("Compiling style done");

    template = template.replace(/(class=\\?")(.+?)(\\?")/g, (_, clazzDeclaration, val, end) => {
        let nVal = [];
        for (const clazz of val.split(" ")) {
            const sub = sMap.get("." + clazz);
            if (sub) {
                nVal.push(sub.substring(1));
            } else {
                nVal.push(clazz)
            }
        }
        return clazzDeclaration + nVal.join(" ") + end;
    });
    console.log("Compiling template done");

    // component creation
    let componentStr = dom.window.document.querySelector("body > script").textContent;
    componentStr = componentStr.substring(componentStr.indexOf(start) + start.length).trim();
    componentStr = `{template:\`${template}\`,css:\`${style}\`,` + componentStr.substring(1);

    const component = eval(`() => {return ${componentStr};}`)();
    const name = component.name;

    const umd = `const ${name}=ELAINE.component(${componentStr.replace(/\r?\n|\r/g, "").replace(/\s\s+/g, '')});`;
    console.log("Compiling component done");
    fs.writeFileSync(`./dist/${name}.umd.js`, umd);
    console.log(`Wrote component file to ./dist/${name}.umd.js`);

    console.log(`Finished elaine single-file-component generation.`);
}
