// className设置
export function setElementClass(dom, name, sure) {
    const run = (dom) => {
        let className = dom.className;
        if (sure) {
            if (className.indexOf(name) == -1) dom.className += ` ${name}`;
        } else {
            dom.className = className.replace(` ${name}`, '').trim();
        }
    }
    if (dom.length > 0) {
        for(let i = 0; i < dom.length; i++) {
            run(dom[i]);
        }
    } else {
        run(dom);
    }
}