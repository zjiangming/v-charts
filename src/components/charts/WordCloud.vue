<template>
    <div class="chart-container">
        <div v-if="empty || chartEmpty" class="chart-empty">
            <Svgicon class="chart-empty__icon" icon="icon-emptycondition1" />
            <p class="chart-empty__tips">
                暂无数据
            </p>
        </div>
        <template v-else>
            <div v-if="data.title" class="chart-title">
                {{ data.title }}
            </div>
            <div :id="key" :style="{ width, height }" />
        </template>
    </div>
</template>

<script>
import { deepClone, randomString } from '@/utils/common';
import DTMChart from './utils';

export default {
    name: 'DtWordCloud',
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
            default: '200px'
        },
        maskImage: {
            type: String,
            default: ''
        },
        empty: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            key: '',
            chartEmpty: this.empty,
            defaultOption: {
                title: {},
                legend: {
                    show: false
                },
                series: []
            },
            maskImageData: '',
            colors: {
                index: 0,
                list: ['#5C9EFE', '#9743F8', '#F568A1', '#F9CD4F', '#57C4CB', '#92D944', '#F38A48', '#F3C743', '#57C4CB', '#29B266', '#F2595A', '#C255CF']
            }
        }
    },
    computed: {
        chartGrid() {
            return Object.assign({ rows: 1, cols: 1}, this.grid);
        }
    },
    watch: {
        'data.source'(val) {
            if (!val || val.length == 0) this.chartEmpty = true;
            else this.chartEmpty = false;
            this.$nextTick(() => {
                !this.chartEmpty && this.chart.init(this.initData());
            })
        },
        'maskImage'(val) {
            this.$nextTick(() => {
                this.imageLoad()
            })
        }
    },
    mounted() {
        const { source } = this.data;
        this.chartEmpty = source ? !source.length : true;
        this.key = this.id || 'word-' + randomString(8);
        this.chart = new DTMChart({ id: this.key });
        this.$nextTick(() => {
            this.imageLoad()
        })
    },
    methods: {
        initData() {
            const { dimensions, gridData, source } = this.data,
                options = deepClone(this.defaultOption),
                { legend, grid, series } = options;
            series[0] = {
                type: 'wordCloud',
                gridSize: 5,    // 间距
                sizeRange: [10, 16],    // 字体大小
                rotationRange: [-45, 90],   // 角度
                rotationStep: 45,
                maskImage: this.maskImageData,
                textStyle: {
                    normal: {
                        color: () => {
                            let i = this.colors.index ++,
                                list = this.colors.list;
                            return list[i%list.length];
                        }
                    }
                },
                data: source
            }
            // 合并配置参数
            for (let key in this.config) {
                options[key] = Object.assign({}, options[key], this.config[key]);
            }
            console.log(options)
            return options;
        },
        imageLoad() {
            this.maskImageData = new Image();
            this.maskImageData.src = this.maskImage;
            this.maskImageData.onload = () => {
                !this.chartEmpty && this.chart.init(this.initData());
            }
        }
    }
}
</script>

