<script>
import SavorSection from "./components/SavorSection.vue";

export default {
  data() {
    return {
      savors: [],
      category_map: {
        book: { id: 1, title: "I read" },
        screen: { id: 2, title: "I watched" },
        music: { id: 3, title: "I listened" },
        game: { id: 4, title: "I played" },
      },
    };
  },
  components: {
    SavorSection,
  },
  methods: {
    async getCompletedItems(category_name) {
      const req = await fetch(`/api/complete/${category_name}`);
      const resp_json = await req.json();

      this.savors.push({
        id: this.category_map[category_name].id,
        title: this.category_map[category_name].title,
        completedItems: resp_json.data,
      });
    },
  },
  mounted() {
    for (let category_name in this.category_map) {
      this.getCompletedItems(category_name);
    }

    console.log(this.savors);
  },
};
</script>

<template>
  <h1 class="pageTitle">In {{ new Date().getFullYear() }},</h1>

  <SavorSection
    v-for="savor in savors.sort((i, j) => {
      return i.id - j.id;
    })"
    :savor="savor"
    :key="savor.id"
  />
</template>

<style>
.pageTitle {
  color: white;
  font-size: 5em;
}
</style>
