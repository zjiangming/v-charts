<template>
  <div id="app">
    <div>
      <Portrait />
    </div>
  </div>
</template>

<script>
import Portrait from './views/portrait/index';

export default {
  name: 'app',
  components: {
    Portrait
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
