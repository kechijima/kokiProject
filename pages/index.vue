<script setup>
    import {allRows,getProjectRows} from '@/composables/useSheet';

    const valid = ref(true)
    const projectName = ref(null)
    const amountRules = [
        v => !!v || '金額は必須です',
        v => !isNaN(v) || '金額は数字で入力してください'
    ]
    const amount = ref(null)
    const kamoku = ref(null)
    const date = ref(null)
    let project = ref(null)
    let kamokuItems = ref(null)
    const result = ref([])
    let {data:kamokuData} = await allRows()
    kamokuItems = kamokuData.value.values.map(item => item[0]);
    let {data:projectData} = await getProjectRows()
    project = projectData.value.values.map(item => item[0]);
    
</script>

<template>
    <v-form ref="form" v-model="valid" lazy-validation class="mt-6 ml-6" style="width: 50%;">
    <h2 class="my-6">経費入力</h2>
    <v-select v-model="projectName" label="案件" :items="project" required></v-select>
    <v-select v-model="kamoku" label="勘定科目" :items="kamokuItems" required></v-select>
    <v-text-field v-model="amount" label="金額"  prefix="￥" :rules="amountRules" @input="formatAmount"></v-text-field>
    <v-text-field v-model="date" label="日付" type="date"></v-text-field>
    <v-btn color="primary" @click="submitForm">送信</v-btn>
  </v-form>
</template>
