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
  font-size: 5.5em;
  font-weight: 300;
  margin: 2rem 0 3.5rem;
  font-family: 'Space Grotesk', 'Helvetica Neue', 'SimHei', 'STHeiti';
  letter-spacing: -0.03em;
  background: linear-gradient(to right, #fff, #c4c4ff);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  position: relative;
}

.section {
  margin-bottom: 4rem;
  opacity: 0;
  animation: fadeIn 0.8s ease forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media only screen and (max-width: 768px) {
  .pageTitle {
    font-size: 3.5em;
    margin: 1.5rem 0 2rem;
  }
  
  .section {
    margin-bottom: 3rem;
  }
}
</style>
