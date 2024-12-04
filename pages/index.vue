<template>
    <v-container>
      <!-- 事業詳細のセレクトボックス -->
      <v-form ref="form" v-model="valid" lazy-validation class="mt-6 ml-6" style="width: 50%;">
        <h2 class="my-6">売上入力</h2>
        <v-select v-model="selectedDetail" :items="details" label="事業詳細を選択" @update:modelValue="updateType" required></v-select>
        <v-select v-model="seikyuType" :items="seikyuTypes" label="請求タイプ" required></v-select>
        <v-text-field v-show="false" label="非表示の項目" v-model="selectedType"></v-text-field>        
        <v-text-field label="請求日" v-model="seikyuDate" input type="date"></v-text-field>
        <v-select v-model="selectedClient" :items="clientCandidates" label="取引先を選択" item-title="name" item-value="name" required></v-select>
        <v-text-field label="売上金額" v-model="uriagekingaku" :rules="amountRules" prefix="￥" required></v-text-field>
        <v-text-field v-model="kenmei" label="件名を入力" required></v-text-field>
        <div v-if="seikyuType === '定期'">
          <v-text-field label="請求開始日" v-model="kaishibi" input type="date"></v-text-field>
          <v-text-field label="請求終了日" v-model="shuryobi" input type="date"></v-text-field>
        </div>
        <div v-else>
          <v-text-field label="支払期限日" v-model="shiharaikigenbi" input type="date"></v-text-field>
        </div>
        <v-textarea label="備考" v-model="memo" required></v-textarea>
        <v-btn color="primary" @click="submitForm">送信</v-btn>

         <!-- 折りたたみ可能な詳細セクション -->
        <!-- <div class="mt-3">
          <h3 class="my-2">【備考欄の記載方法】</h3>
          <v-expansion-panels>
            <v-expansion-panel v-for="(section, index) in sections" :key="index">
              <v-expansion-panel-title>{{ section.title }}</v-expansion-panel-title>
              <v-expansion-panel-text>
                <div v-html="section.content"></div>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </div> -->
    </v-form>
    </v-container>
  </template>
  
  <script setup>
  import { ref, onMounted,watch } from "vue";
  import { getProjectData } from "~/composables/useSheet";
  import { getClientData } from "~/composables/useSheet";
  import { useDayjs } from '#dayjs' 
  
  const dayjs = useDayjs();
  const projectData = ref({});
  const details = ref([]);
  const selectedDetail = ref(null);
  const selectedType = ref(null);
  const seikyuType = ref(null);
  const seikyuTypes = ref(['都度','定期']);
  const seikyuDate = ref(null);
  const selectedClient = ref(null); // 選択された取引先
  const clientMap = ref({}); // 事業詳細ごとの取引先データ
  const clientCandidates = ref([]); // 選択肢として表示する取引先
  const uriagekingaku = ref(null);
  const amountRules = [
    v => !!v || '金額は必須です',
    v => !isNaN(v) || '金額は数字で入力してください'
  ];
  const kenmei = ref(null);
  const kaishibi = ref(null);
  const shuryobi = ref(null);
  const shiharaikigenbi = ref(null);
  const memo = ref(null);
  const parsedDate = dayjs(seikyuDate.value);

  onMounted(async () => {
    try {
      const data = await getProjectData();
      projectData.value = data;
  
      // 事業詳細の一覧を取得
      details.value = Object.keys(data);//Object.values(data).flat();
      console.log(details.value);
    } catch (error) {
      console.error("データ取得エラー:", error);
    }

    try {
      console.log("取引先データ取得");
      clientMap.value = await getClientData();
      console.log(clientMap.value);

      // 事業詳細の一覧を取得
      details.value = Object.keys(clientMap.value);
    } catch (error) {
      console.error("データ取得エラー:", error);
    }
    
    // 初期の請求日を基に関連フィールドを計算
    seikyuDate.value = dayjs().format('YYYY-MM-DD');
    updateDateFields(seikyuDate.value);
    
  });

  // 日付フィールドを更新する関数
  const updateDateFields = (date) => {
    const parsedDate = dayjs(date);
    kaishibi.value = parsedDate.startOf("month").format("YYYY-MM-DD");
    shuryobi.value = parsedDate.add(1, "month").endOf("month").format("YYYY-MM-DD");
    shiharaikigenbi.value = parsedDate.add(1, "month").endOf("month").format("YYYY-MM-DD");

  };
  
  // 事業詳細の選択変更を監視
  watch(selectedDetail, (newDetail) => {
    console.log("選択された事業詳細:", newDetail);

    // 選択された事業詳細に基づいて事業タイプを更新
    for (const [type, detailList] of Object.entries(projectData.value)) {
      //if (detailList.includes(newDetail)) {
      if (newDetail && projectData.value[newDetail]) {
        const detailData = projectData.value[newDetail];
        selectedType.value = detailData.type; // 事業タイプ
        seikyuType.value = detailData.billingType; // 請求区分
        kenmei.value = detailData.invoiceTitle; // 件名
        memo.value = detailData.bikou; // 備考
        console.log("更新された事業タイプ:", selectedType.value);
        selectedType.value = type;
        console.log("更新された事業タイプ:", selectedType.value);
        if (newDetail && clientMap.value[newDetail]) {
          console.log("該当する事業タイプが見つかりました");
          clientCandidates.value = clientMap.value[newDetail];
        } else {
          clientCandidates.value = [];
        }
        return;
      }
    }
    // 該当する事業詳細がない場合
    selectedType.value = null;
    console.log("該当する事業タイプが見つかりません");
  });

  // 請求日の変更を監視
  watch(seikyuDate, (newSeikyuDate) => {
    console.log("請求日が変更されました:", newSeikyuDate);
    if (newSeikyuDate) {
      updateDateFields(newSeikyuDate);
    }
  });

  // フォーム送信
  const submitForm = () => {
    if(seikyuType === '定期'){
      const message = `earnings\n${selectedDetail.value}\n${seikyuType.value}\n${seikyuDate.value}\n${selectedClient.value}\n${uriagekingaku.value}\n${kenmei.value}\n${kaishibi.value}\n${shuryobi.value}\n\n${memo.value}`;
      console.log(message);
    }else{
      const message = `earnings\n${selectedDetail.value}\n${seikyuType.value}\n${seikyuDate.value}\n${selectedClient.value}\n${uriagekingaku.value}\n${kenmei.value}\n\n\n${shiharaikigenbi.value}\n${memo.value}`;
      console.log(message);
    }
  };
  </script>
  