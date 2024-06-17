<template>
    <v-card class="e4">
      <v-responsive
        :style="{ background: `${bulidColor()}` }"
        height="100px"
      ></v-responsive>
      <v-card-text>
        <v-container
          fluid
          grid-list-lg
        >
          <v-layout
            row
            wrap
          >
            <v-flex xs9>
              <v-slider
                v-model="red"
                :max="255"
                label="R"
              ></v-slider>
            </v-flex>
            <v-flex xs3>
              <v-text-field
                v-model="red"
                class="mt-0"
                type="number"
              ></v-text-field>
            </v-flex>
            <v-flex xs9>
              <v-slider
                v-model="green"
                :max="255"
                label="G"
              ></v-slider>
            </v-flex>
            <v-flex xs3>
              <v-text-field
                v-model="green"
                class="mt-0"
                type="number"
              ></v-text-field>
            </v-flex>
            <v-flex xs9>
              <v-slider
                v-model="blue"
                :max="255"
                label="B"
              ></v-slider>
            </v-flex>
            <v-flex xs3>
              <v-text-field
                v-model="blue"
                class="mt-0"
                type="number"
              ></v-text-field>
            </v-flex>
            <v-flex xs9>
              <v-slider
                v-model="opacity"
                :max="1"
                :step="0.01"
                label="B"
              ></v-slider>
            </v-flex>
            <v-flex xs3>
              <v-text-field
                v-model="opacity"
                class="mt-0"
                type="number"
              ></v-text-field>
            </v-flex>          </v-layout>
        </v-container>
      </v-card-text>
    </v-card>
  </template>
  
  <script>
  export default {
    data: function() {
      return {
        red: 0,
        blue: 0,
        green: 0,
        opacity: 0,
      }
    },
    updated: function() {
      this.$emit('input', {
        red: this.red,
        blue: this.blue,
        green: this.green,
        opacity: this.opacity
      })
    },
    mounted: function() {
      this.red = this.value.red,
      this.blue = this.value.blue,
      this.green = this.value.green,
      this.opacity = this.value.opacity
    },
    props: {
      value: {
        type: Object,
        required: true,
      },
    },
    methods: {
      bulidColor() {
        return `rgba(${this.red}, ${this.green}, ${this.blue}, ${this.opacity})`
      }
    }
  }
  </script>