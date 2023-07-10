<script>
export default {
  props: {
    savor: Object,
  },
};
</script>

<template>
  <div class="section">
    <h1 class="sectionTitle">{{ savor.title || "" }}</h1>
    <div class="sectionBody">
      <div class="cover" v-for="completedItem in savor.completedItems">
        <img class="coverImg" :src="completedItem.item.cover_image_url" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.sectionTitle {
  color: white;
  font-size: 4em;
}
.sectionBody {
  display: flex;
  width: 100%;
  flex-wrap: wrap;
}

.cover {
  display: inline;
  padding: 10px;
  width: 20%;
  height: 25%;
  overflow: hidden;
}

.coverImg {
  max-width: 100%;
  max-height: 100%;
  object-fit: cover;
}
</style>
