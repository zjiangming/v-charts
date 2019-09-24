<template>
  <div id="app">
    <div>
      <ChartContainer />
    </div>
  </div>
</template>

<script>
import ChartContainer from './components/ChartContainer';

export default {
  name: 'app',
  components: {
    ChartContainer
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
