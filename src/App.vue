<script>
import SavorSection from "./components/SavorSection.vue";

export default {
  data() {
    return {
      savors: {
        1: {type: "book", title: "I read", completedItems: []},
        2: {type: "screen", title: "I watched", completedItems: []},
        3: {type: "music", title: "I listened", completedItems: []},
        4: {type: "game", title: "I played", completedItems: []},
      },
    };
  },
  components: {
    SavorSection,
  },
  methods: {
    async getCompletedItems(category_id) {
      const type = this.savors[category_id].type
      const baseUrl = process.env.NODE_ENV === 'development' 
        ? "http://localhost:9527"
        : "";
      const req = await fetch(baseUrl + `/api/complete/${type}`);
      const resp_json = await req.json();

      this.savors[category_id].completedItems = resp_json.data;
    },
  },
  mounted() {
    for (let category_id in this.savors) {
      this.getCompletedItems(category_id);
    }

  },
};
</script>

<template>
  <h1 class="pageTitle">In {{ new Date().getFullYear() }},</h1>

  <SavorSection
    v-for="savor in Object.values(savors)"
    :savor="savor"
    :key="savor.id"
  />
</template>

<style>
.pageTitle {
  color: #f3f3f3;
  font-size: 5em;
  font-family: 'Helvetica', 'SimHei', 'STHeiti';
}

.section {
  margin-bottom: 50px;
}
</style>
