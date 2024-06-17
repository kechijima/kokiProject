<template>
    <v-app>
      <v-container>
        <h1>{{ title }}</h1>
        <BarChart :chartData="chartData" :options="chartOptions" />
      </v-container>
    </v-app>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import BarChart from '~/components/BarChart.vue'
  
  const title = ref('Nuxt 3 Chart.js Example')
  const chartData = ref({
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    datasets: [
      {
        label: 'Data One',
        backgroundColor: '#f87979',
        data: [40, 20, 30, 10, 50, 80, 90]
      }
    ]
  })
  const chartOptions = ref({
    responsive: true,
    maintainAspectRatio: true
  })
  </script>
  
  <style scoped>
  h1 {
    text-align: center;
    margin-bottom: 20px;
  }
  </style>
  