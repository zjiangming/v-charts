import Echarts from 'echarts';
import 'echarts-wordcloud';
import 'echarts/map/js/china.js';
import defaultTheme from './theme/theme_default.json';

// 图表配色
export const colors = ['#5C9EFE', '#9743F8', '#F568A1', '#F9CD4F', '#57C4CB', '#92D944', '#F38A48', '#F3C743', '#57C4CB', '#29B266', '#F2595A', '#C255CF'];
// 图表实例
export default function DTMChart({ id, theme = '', config = {} }) {
    this.echart = null;
    this.container = id;
    this.themeName = theme || 'default';
    this.config = config;
    // 导入主题
    Echarts.registerTheme('default', defaultTheme);
    // 默认值
    this.defaultOptions = {
        // color: colors
    }
}
// 初始化
DTMChart.prototype.init = function(options = {}, theme = '', config = {}) {
    const Dom = document.getElementById(this.container);
    Echarts.dispose(Dom);
    this.echart = Echarts.init(Dom, theme || this.themeName, config || this.config);
    this.echart.setOption(Object.assign({}, this.defaultOptions, options));
    // 监控浏览器
    let timer = null;
    window.addEventListener("resize", () => {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
            this.echart.resize()
        }, 200)
    })
}
// 更新参数
DTMChart.prototype.setOption = function(options = {}) {
    this.echart.setOption(Object.assign({}, this.defaultOptions, options));
}
// 地图geo加载
DTMChart.prototype.setMap = function(callback) {
    const _this = this,
        geo = {
            '安徽': { codeName: 'anhui', level: 'province', json: require('echarts/map/json/province/anhui.json') },
            '北京': { codeName: 'beijing', level: 'province', json: require('echarts/map/json/province/beijing.json') },
            '重庆': { codeName: 'chongqing', level: 'province', json: require('echarts/map/json/province/chongqing.json') },
            '福建': { codeName: 'fujian', level: 'province', json: require('echarts/map/json/province/fujian.json') },
            '甘肃': { codeName: 'gansu', level: 'province', json: require('echarts/map/json/province/gansu.json') },
            '广东': { codeName: 'guangdong', level: 'province', json: require('echarts/map/json/province/guangdong.json') },
            '广西': { codeName: 'guangxi', level: 'province', json: require('echarts/map/json/province/guangxi.json') },
            '贵州': { codeName: 'guizhou', level: 'province', json: require('echarts/map/json/province/guizhou.json') },
            '海南': { codeName: 'hainan', level: 'province', json: require('echarts/map/json/province/hainan.json') },
            '河北': { codeName: 'hebei', level: 'province', json: require('echarts/map/json/province/hebei.json') },
            '黑龙江': { codeName: 'heilongjiang', level: 'province', json: require('echarts/map/json/province/heilongjiang.json') },
            '河南': { codeName: 'henan', level: 'province', json: require('echarts/map/json/province/henan.json') },
            '湖北': { codeName: 'hubei', level: 'province', json: require('echarts/map/json/province/hubei.json') },
            '湖南': { codeName: 'hunan', level: 'province', json: require('echarts/map/json/province/hunan.json') },
            '江苏': { codeName: 'jiangsu', level: 'province', json: require('echarts/map/json/province/jiangsu.json') },
            '江西': { codeName: 'jiangxi', level: 'province', json: require('echarts/map/json/province/jiangxi.json') },
            '吉林': { codeName: 'jilin', level: 'province', json: require('echarts/map/json/province/jilin.json') },
            '辽宁': { codeName: 'liaoning', level: 'province', json: require('echarts/map/json/province/liaoning.json') },
            '内蒙古': { codeName: 'neimenggu', level: 'province', json: require('echarts/map/json/province/neimenggu.json') },
            '宁夏': { codeName: 'ningxia', level: 'province', json: require('echarts/map/json/province/ningxia.json') },
            '青海': { codeName: 'qinghai', level: 'province', json: require('echarts/map/json/province/qinghai.json') },
            '山东': { codeName: 'shandong', level: 'province', json: require('echarts/map/json/province/shandong.json') },
            '上海': { codeName: 'shanghai', level: 'province', json: require('echarts/map/json/province/shanghai.json') },
            '陕西': { codeName: 'shanxi1', level: 'province', json: require('echarts/map/json/province/shanxi1.json') },
            '山西': { codeName: 'shanxi', level: 'province', json: require('echarts/map/json/province/shanxi.json') },
            '四川': { codeName: 'sichuan', level: 'province', json: require('echarts/map/json/province/sichuan.json') },
            '天津': { codeName: 'tianjin', level: 'province', json: require('echarts/map/json/province/tianjin.json') },
            '西藏': { codeName: 'xizang', level: 'province', json: require('echarts/map/json/province/xizang.json') },
            '新疆': { codeName: 'xinjiang', level: 'province', json: require('echarts/map/json/province/xinjiang.json') },
            '云南': { codeName: 'yunnan', level: 'province', json: require('echarts/map/json/province/yunnan.json') },
            '浙江': { codeName: 'zhejiang', level: 'province', json: require('echarts/map/json/province/zhejiang.json') },
            '香港': { codeName: 'xianggang', level: 'province', json: require('echarts/map/json/province/xianggang.json') },
            '澳门': { codeName: 'aomen', level: 'province', json: require('echarts/map/json/province/aomen.json') },
            '台湾': { codeName: 'taiwan', level: 'province', json: require('echarts/map/json/province/taiwan.json') },
        },
        china = this.getMap('china');
    china.forEach(t => geo[t.name] && (geo[t.name].code = t.code));
    for (let key in geo) {
        let g = geo[key];
        Echarts.registerMap(g.codeName, g.json);
    }
    this.setOption();
    this.echart.on('click', function(params) {
        let geoItem = geo[params.name],
            area = geoItem ? _this.getMap(geoItem.codeName) : null;
        callback && callback(params, geoItem, area);
    })
}
// get geo
DTMChart.prototype.getMap = function(mapName) {
    const map = Echarts.getMap(mapName),
        features = map ? map.geoJson.features : [];
    return features.map(t => {
        return Object.assign({ code: t.id }, t.properties);
    })
}