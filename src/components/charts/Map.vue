<template>
    <div class="chart-container">
        <div v-if="data.title" class="chart-title">
            {{ data.title }}
        </div>
        <div :id="key" :style="{ width, height }" />
    </div>
</template>

<script>
import { deepClone, randomString } from '@/utils/common';
import DTMChart from './utils';

export default {
    name: 'DtMap',
    props: {
        data: {
            type: Object,
            default: () => ({})
        },
        config: {
            type: Object,
            default: () => ({})
        },
        id: {
            type: String,
            default: ''
        },
        grid: {
            type: Object,
            default: () => ({ rows: 1, cols: 1 })
        },
        width: {
            type: String,
            default: '100%'
        },
        height: {
            type: String,
            default: '300px'
        },
        goDown: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            key: '',
            defaultOption: {
                title: {},
                tooltip: {},
                visualMap: {
                    show:false,
                    min: 0,
                    // max: 11,
                    left: 'left',
                    top: 'bottom',
                    text: ['高', '低'],
                    calculable: true,
                    seriesIndex: 0,
                    inRange: {
                        color: [
                            "#fba853",
                            "#fa8737",
                            "#F4D5B1",
                        ]
                    }
                },
                // geo: {
                //     show: true,
                //     map: 'china',
                // },
                series: []
            },
            geoStyle: {
                label: {
                    normal: {
                        show: false
                    },
                    emphasis: {
                        show: true,
                        color: '#FFF'
                    }
                },
                roam: false,
                itemStyle: {
                    normal: {
                        areaColor: '#ffc188',
                        borderColor: '#FFF',
                        shadowColor: 'rgba(255, 255, 255, .5)',
                        shadowOffsetX: -2,
                        shadowOffsetY: 2,
                        shadowBlur: 5
                    },
                    emphasis: {
                        areaColor: '#4bbdd6'
                    }
                },
                tooltip: {
                    show: true,
                    formatter: '{b}：{c}',
                }
            },
            activeArea: 'guangdong',
        }
    },
    computed: {
        chartGrid() {
            return Object.assign({ rows: 1, cols: 1}, this.grid);
        }
    },
    watch: {
        'data.source'() {
            this.$nextTick(() => {
                this.chart.init(this.initData());
            })
        }
    },
    mounted() {
        this.key = this.id || 'map-' + randomString(8);
        this.chart = new DTMChart({ id: this.key });
        this.$nextTick(() => {
            this.chart.init(this.initData());
            this.chart.setMap(this.clickMap);
        })
    },
    methods: {
        initData() {
            const { dimensions, gridData, source } = this.data,
                options = deepClone(this.defaultOption),
                { legend, grid, xAxis, yAxis, series } = options;

            gridData.forEach((item, index) => {
                let d = {
                    name: item.mapName,
                    type: 'map',
                    mapType: item.mapName,
                    //geoIndex: 0,
                    //aspectScale: 0.75, //长宽比
                    animation: false,
                    data: []
                }
                d = Object.assign({}, this.geoStyle, d);
                d.data = source;
                series.push(d)
                if (this.goDown) {
                    d.left = '10%';
                    //d.right = '50%';
                    let c = Object.assign({
                        name: this.activeArea,
                        type: 'map',
                        mapType: this.activeArea,
                        left: '60%',
                        //aspectScale: 0.75, //长宽比
                        animation: false,
                        data: []
                    }, this.geoStyle);
                    series.push(c);
                }
            })
            // 合并配置参数
            for (let key in this.config) {
                options[key] = Object.assign({}, options[key], this.config[key]);
            }
            console.log(options)
            return options;
        },
        // 地图点击
        clickMap(params, geoItem, area) {
            console.log(geoItem)
            if (geoItem && geoItem.level == 'province') {
                this.activeArea = geoItem.codeName;
                this.chart.setOption(this.initData());
            }
        }
    }
}
</script>

