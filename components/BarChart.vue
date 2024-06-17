<template>
    <div>
      <Bar :data="chartData" :options="options" />
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted,watch,onBeforeUnmount } from 'vue'
  import { Bar } from 'vue-chartjs'
  import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'
  
  ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)
  
  const props = defineProps({
    chartData: {
      type: Object,
      required: true
    },
    options: {
      type: Object,
      default: () => ({})
    }
  })
  
  const canvas = ref(null)
  let chartInstance = null

  const renderChart = () => {
    if (chartInstance) {
      chartInstance.destroy()
    }
    if (canvas.value) {
      chartInstance = new Bar(canvas.value, {
        data: props.chartData,
        options: props.options
      })
    }
  }
  onMounted(() => {
    renderChart()
  })

  watch(() => props.chartData, renderChart, { deep: true })

  onBeforeUnmount(() => {
    if (chartInstance) {
      chartInstance.destroy()
    }
  })
  </script>
  
  <style scoped>
  canvas {
    max-width: 100%;
  }
  </style>
  