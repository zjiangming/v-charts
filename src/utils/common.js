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

// 深度拷贝
export const deepClone = obj => {
    let objClone = Array.isArray(obj) ? [] : {};
    if(obj && typeof obj==="object"){
        for(let key in obj){
            if(obj.hasOwnProperty(key)){
                //判断ojb子元素是否为对象，如果是，递归复制
                if(obj[key] && typeof obj[key] === "object"){
                    objClone[key] = deepClone(obj[key]);
                }else{
                    //如果不是，简单复制
                    objClone[key] = obj[key];
                }
            }
        }
    }
    return objClone;
}

// 获取随机字符串
export const randomString = (len = 8) => {
    let str = Math.random().toString(36).substring(2);
    while(str.length < len){
        str += Math.random().toString(36).substring(2);
    }
    return str.substring(0, len);
}