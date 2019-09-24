<template>
    <div :id="config.id" class="chart-col" :style="styles">
        <div class="chart-item">
            <div class="chart-item__title">
                {{ title }}
            </div>
            <div class="chart-item__content">
                <img src="../assets/ct.png">
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'ChartItem',
    props: {
        title: {
            type: String,
            default: ''
        },
        config: {
            type: Object,
            default: () => ({})
        }
    },
    data() {
        return {
            detail: {}
        }
    },
    computed: {
        styles() {
            let config = this.config;
            return {
                top: config.top + 'px',
                left: config.left + 'px',
                width: config.width + 'px',
                height: config.height + 'px'
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.chart-col {
    position: absolute;
    display: inline-table;
    z-index: 1;
    transition: all 0.2s ease;
    transition-property: left,top;
    &.active {
        z-index: 2;
        .chart-item {
            border-color: #495BD2;
        }
    }
    &.dragging {
        transition: none;
        z-index: 2;
    }
    .chart-item {
        height: 100%;
        position: relative;
        background-color: #FFF;
        border-radius: 3px;
        border: 1px solid #eee;
        user-select: none;
        .chart-item__title {
            height: 39px;
            line-height: 39px;
            border-bottom: 1px solid transparent;
            padding: 0 30px 0 16px;
            cursor: move;
        }
        .chart-item__content {
            position: absolute;
            top: 40px;
            bottom: 0px;
            width: 100%;
            overflow: hidden;
        }
    }
    img {
        width: 100%;
        height: 100%;
        pointer-events: none;
    }
}
</style>


